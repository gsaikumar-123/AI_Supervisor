const { init } = require('./db');

async function listAll() {
  const { kbDB } = await init();
  await kbDB.read();
  return kbDB.data.answers || [];
}

async function listLearned() {
  const { kbDB } = await init();
  await kbDB.read();
  const arr = kbDB.data.answers || [];
  return arr.filter(a => a.learnedAt).sort((a,b)=>new Date(b.learnedAt||0)-new Date(a.learnedAt||0));
}

module.exports = { listAll, listLearned };
