const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const kbFile = path.join(__dirname, '..', 'data', 'kb.json');
const requestsFile = path.join(__dirname, '..', 'data', 'requests.json');

const init = async () => {
  const kbAdapter = new JSONFile(kbFile);
  const reqAdapter = new JSONFile(requestsFile);
  const kbDB = new Low(kbAdapter, { answers: [] });
  const reqDB = new Low(reqAdapter, { requests: [] });

  try {
    await kbDB.read();
  } catch (err) {
    console.error('Failed to read KB JSON, reinitializing:', err && err.message ? err.message : err);
    kbDB.data = { answers: [] };
    try { await kbDB.write(); } catch (e) { /* ignore write errors here */ }
  }

  try {
    await reqDB.read();
  } catch (err) {
    console.error('Failed to read requests JSON, reinitializing:', err && err.message ? err.message : err);
    reqDB.data = { requests: [] };
    try { await reqDB.write(); } catch (e) { /* ignore write errors here */ }
  }

  kbDB.data = kbDB.data || { answers: [] };
  reqDB.data = reqDB.data || { requests: [] };

  return { kbDB, reqDB };
};

module.exports = { init };
