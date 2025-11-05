const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const kbFile = path.join(__dirname, '..', 'data', 'kb.json');
const requestsFile = path.join(__dirname, '..', 'data', 'requests.json');
const notificationsFile = path.join(__dirname, '..', 'data', 'notifications.json');

const init = async () => {
  const kbAdapter = new JSONFile(kbFile);
  const reqAdapter = new JSONFile(requestsFile);
  const notifAdapter = new JSONFile(notificationsFile);
  const kbDB = new Low(kbAdapter, { answers: [] });
  const reqDB = new Low(reqAdapter, { requests: [] });
  const notifDB = new Low(notifAdapter, { notifications: [] });

  async function readWithInit(db, defaultData, name) {
    try {
      await db.read();
    } catch (err) {
      console.error(`Failed to read ${name} JSON, reinitializing:`, err && err.message ? err.message : err);
      db.data = defaultData;
      try {
        await db.write();
      } catch (writeErr) {
        console.error(`Failed to write ${name} JSON during reinitialization:`, writeErr && writeErr.message ? writeErr.message : writeErr);
      }
    }
    db.data = db.data || defaultData;
  }

  await readWithInit(kbDB, { answers: [] }, 'KB');
  await readWithInit(reqDB, { requests: [] }, 'requests');
  await readWithInit(notifDB, { notifications: [] }, 'notifications');

  return { kbDB, reqDB, notifDB };
};

module.exports = { init };