// node-fetch v3 is ESM-only; use a small dynamic-import wrapper so CommonJS code can still call it.
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const { init } = require('./db');
const { addNotification } = require('./notify');
const { createPendingRequest, resolveRequest } = require('./storage');

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
    console.log(`[AI] Found answer for "${question}" → ${match.answer}`);
    return {
      action: 'answer',
      answer: match.answer,
    };
  }

  const request = await createPendingRequest({ callerId, question });
  console.log(`[SUPERVISOR ALERT] Help needed for "${question}" (requestId: ${request.id})`);

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
          message: `Hey, I need help answering: "${question}"`,
        }),
      });
      console.log(`[Webhook → Supervisor] Notification sent successfully to ${webhookUrl}`);
    } catch (err) {
      console.error(`[Webhook Error] Could not send to supervisor: ${err.message}`);
    }
  } else {
    console.warn("SUPERVISOR_WEBHOOK_URL not configured, skipping webhook call.");
  }

  return {
    action: 'escalate',
    message: 'Let me check with my supervisor and get back to you.',
    requestId: request.id,
  };
}

async function applySupervisorAnswer({ requestId, answerText, resolved = true }) {
  const { kbDB } = await getDbs();
  await kbDB.read();

  const req = await resolveRequest({ requestId, answerText, resolved });
  if (!req) throw new Error('Request not found when applying supervisor answer.');

  kbDB.data.answers.push({
    question: req.question,
    answer: answerText,
    learnedAt: new Date().toISOString(),
  });
  await kbDB.write();
  console.log(`[AI] Learned new answer for "${req.question}"`);

  await addNotification(req.callerId, {
    type: 'answer',
    requestId,
    question: req.question,
    answer: answerText,
  });

  const callerWebhook = process.env.CALLER_WEBHOOK_URL;
  if (callerWebhook) {
    try {
      await fetch(callerWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerId: req.callerId,
          requestId,
          question: req.question,
          answer: answerText,
        }),
      });
      console.log(`[Webhook → Caller] Sent learned answer for "${req.question}"`);
    } catch (err) {
      console.error(`[Webhook Error] Could not send to caller: ${err.message}`);
    }
  } else {
    console.warn("CALLER_WEBHOOK_URL not configured, skipping webhook call.");
  }

  return { success: true };
}

module.exports = { handleIncomingCall, applySupervisorAnswer };
