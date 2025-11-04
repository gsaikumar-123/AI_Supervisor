const { applySupervisorAnswer } = require('./aiAgent');
const { listRequests, getRequestById } = require('./storage');

async function answerRequest({ requestId, answerText, resolved = true }) {
  if (!answerText || !answerText.trim()) throw new Error('answerText required');
  return applySupervisorAnswer({ requestId, answerText: answerText.trim(), resolved });
}

module.exports = { listRequests, getRequestById, answerRequest };
