const { init } = require('./db');
const { nanoid } = require('nanoid');
const { addNotification } = require('./notify');

let dbsPromise = null;
const getDbs = () => {
  if (!dbsPromise) dbsPromise = init();
  return dbsPromise;
};

function findInKB(kb, question) {
  const q = question.trim().toLowerCase();
  return kb.answers.find(a => a.question.trim().toLowerCase() === q);
}

async function handleIncomingCall({ callerId, question }) {
  const { kbDB, reqDB } = await getDbs();
  await kbDB.read();
  await reqDB.read();

  const match = findInKB(kbDB.data, question);
  if (match) {
    return {
      action: 'answer',
      answer: match.answer
    };
  }

  const request = {
    id: nanoid(),
    callerId,
    question,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  reqDB.data.requests.push(request);
  await reqDB.write();

  console.log(`[SUPERVISOR ALERT] Hey, I need help answering: "${question}" (requestId: ${request.id})`);

  const webhookUrl = process.env.SUPERVISOR_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert: 'new_request',
          requestId: request.id,
          question,
          callerId,
          message: `Hey, I need help answering: "${question}"`
        })
      });
      console.log(`Webhook notification sent to ${webhookUrl}`);
    } catch (err) {
      console.error(`Failed to send webhook: ${err.message}`);
    }
  }

  return {
    action: 'escalate',
    message: 'Let me check with my supervisor and get back to you.',
    requestId: request.id
  };
}

async function applySupervisorAnswer({ requestId, answerText, resolved = true }) {
  const { kbDB, reqDB } = await getDbs();
  await kbDB.read();
  await reqDB.read();

  const req = reqDB.data.requests.find(r => r.id === requestId);
  if (!req) throw new Error('request not found');

  req.status = resolved ? 'resolved' : 'unresolved';
  req.resolvedAt = new Date().toISOString();
  req.answer = answerText;

  await reqDB.write();

  kbDB.data.answers.push({
    question: req.question,
    answer: answerText,
    learnedAt: new Date().toISOString()
  });
  await kbDB.write();
  await addNotification(req.callerId, { type: 'answer', requestId, question: req.question, answer: answerText });

  return { success: true };
}

module.exports = { handleIncomingCall, applySupervisorAnswer };
