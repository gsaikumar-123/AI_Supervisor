const { init } = require('./db');
const { initFirebase } = require('../config/firebase');
const { nanoid } = require('nanoid');

const useFirebase = process.env.USE_FIREBASE_REQUESTS === 'true';

async function createPendingRequestLowdb({ callerId, question, callbackUrl }) {
  const { reqDB } = await init();
  await reqDB.read();
  const request = { id: nanoid(), callerId, question, status: 'pending', createdAt: new Date().toISOString(), callbackUrl };
  reqDB.data.requests.push(request);
  await reqDB.write();
  return request;
}

async function getRequestByIdLowdb(id) {
  const { reqDB } = await init();
  await reqDB.read();
  return (reqDB.data.requests || []).find(r => r.id === id) || null;
}

async function listRequestsLowdb({ status }) {
  const { reqDB } = await init();
  await reqDB.read();
  let arr = reqDB.data.requests || [];
  if (status) arr = arr.filter(r => r.status === status);
  return arr.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}

async function resolveRequestLowdb({ requestId, answerText, resolved, resolvedAt = new Date().toISOString() }) {
  const { reqDB } = await init();
  await reqDB.read();
  const req = reqDB.data.requests.find(r => r.id === requestId);
  if (!req) return null;
  req.status = resolved ? 'resolved' : 'unresolved';
  req.resolvedAt = resolvedAt;
  req.answer = answerText;
  await reqDB.write();
  return req;
}

async function timeoutStalePendingLowdb({ timeoutMs }) {
  const { reqDB } = await init();
  await reqDB.read();
  const now = Date.now();
  let count = 0;
  for (const r of reqDB.data.requests || []) {
    if (r.status === 'pending') {
      const age = now - new Date(r.createdAt).getTime();
      if (age >= timeoutMs) {
        r.status = 'unresolved';
        r.resolvedAt = new Date().toISOString();
        count++;
      }
    }
  }
  if (count > 0) await reqDB.write();
  return count;
}

async function createPendingRequestFirebase({ callerId, question, callbackUrl }) {
  const admin = initFirebase();
  const db = admin.firestore();
  const id = nanoid();
  const data = { id, callerId, question, status: 'pending', createdAt: new Date().toISOString(), callbackUrl };
  const cleaned = Object.entries(data).reduce((acc, [k, v]) => {
    if (v !== undefined) acc[k] = v;
    return acc;
  }, {});
  await db.collection('requests').doc(id).set(cleaned);
  return data;
}

async function getRequestByIdFirebase(id) {
  const admin = initFirebase();
  const snap = await admin.firestore().collection('requests').doc(id).get();
  return snap.exists ? snap.data() : null;
}

async function listRequestsFirebase({ status }) {
  const admin = initFirebase();
  let ref = admin.firestore().collection('requests');
  if (status) ref = ref.where('status', '==', status);
  const snaps = await ref.get();
  const arr = snaps.docs.map(d => d.data());
  return arr.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}

async function resolveRequestFirebase({ requestId, answerText, resolved, resolvedAt = new Date().toISOString() }) {
  const admin = initFirebase();
  const ref = admin.firestore().collection('requests').doc(requestId);
  const snap = await ref.get();
  if (!snap.exists) return null;
  const data = snap.data();
  const updated = { ...data, status: resolved ? 'resolved' : 'unresolved', resolvedAt, answer: answerText };
  // Clean undefined values to avoid Firestore errors
  const cleaned = Object.entries(updated).reduce((acc, [k, v]) => {
    if (v !== undefined) acc[k] = v;
    return acc;
  }, {});
  await ref.set(cleaned, { merge: true });
  return cleaned;
}

async function timeoutStalePendingFirebase({ timeoutMs }) {
  const admin = initFirebase();
  const now = Date.now();
  const col = admin.firestore().collection('requests');
  const snaps = await col.where('status', '==', 'pending').get();
  let count = 0;
  for (const doc of snaps.docs) {
    const r = doc.data();
    const age = now - new Date(r.createdAt).getTime();
    if (age >= timeoutMs) {
      await doc.ref.update({ status: 'unresolved', resolvedAt: new Date().toISOString() });
      count++;
    }
  }
  return count;
}

const createPendingRequest = useFirebase ? createPendingRequestFirebase : createPendingRequestLowdb;
const getRequestById = useFirebase ? getRequestByIdFirebase : getRequestByIdLowdb;
const listRequests = useFirebase ? listRequestsFirebase : listRequestsLowdb;
const resolveRequest = useFirebase ? resolveRequestFirebase : resolveRequestLowdb;
const timeoutStalePending = useFirebase ? timeoutStalePendingFirebase : timeoutStalePendingLowdb;

module.exports = { createPendingRequest, getRequestById, listRequests, resolveRequest, timeoutStalePending };
