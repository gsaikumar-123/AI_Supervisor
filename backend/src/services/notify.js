const { init } = require('./db');
const { EventEmitter } = require('events');

const emitter = new EventEmitter();
const clients = new Map();

function subscribe(callerId, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  let set = clients.get(callerId);
  if (!set) {
    set = new Set();
    clients.set(callerId, set);
  }
  set.add(res);
  reqOnClose(res, () => {
    set.delete(res);
    if (set.size === 0) clients.delete(callerId);
  });
}

function reqOnClose(res, cb) {
  res.on('close', cb);
  res.on('finish', cb);
  res.on('error', cb);
}

async function addNotification(callerId, payload) {
  const { notifDB } = await init();
  await notifDB.read();
  const item = { id: Date.now().toString(36), callerId, payload, createdAt: new Date().toISOString() };
  notifDB.data.notifications.push(item);
  await notifDB.write();
  const set = clients.get(callerId);
  if (set) {
    const data = `data: ${JSON.stringify(item)}\n\n`;
    for (const res of set) res.write(data);
  }
  emitter.emit('notify', item);
  return item;
}

async function listNotifications(callerId) {
  const { notifDB } = await init();
  await notifDB.read();
  return (notifDB.data.notifications || []).filter(n => n.callerId === callerId).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}

module.exports = { subscribe, addNotification, listNotifications };
