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

  await kbDB.read();
  await reqDB.read();

  kbDB.data = kbDB.data || { answers: [] };
  reqDB.data = reqDB.data || { requests: [] };

  return { kbDB, reqDB };
};

module.exports = { init };
