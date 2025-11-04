const { init } = require('./db');
const { applySupervisorAnswer } = require('./aiAgent');

let dbsPromise = null;
const getDbs = () => {
  if (!dbsPromise) dbsPromise = init();
  return dbsPromise;
};

async function listRequests({ status } = {}) {
  const { reqDB } = await getDbs();
  await reqDB.read();
  let arr = reqDB.data.requests || [];
  if (status) arr = arr.filter(r => r.status === status);
  return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getRequestById(id) {
  const { reqDB } = await getDbs();
  await reqDB.read();
  return (reqDB.data.requests || []).find(r => r.id === id) || null;
}

async function answerRequest({ requestId, answerText, resolved = true }) {
  if (!answerText || !answerText.trim()) throw new Error('answerText required');
  return applySupervisorAnswer({ requestId, answerText: answerText.trim(), resolved });
}

module.exports = { listRequests, getRequestById, answerRequest };
