const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = {
  async call(callerId, question) {
    const response = await fetch(`${API_BASE_URL}/api/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callerId, question })
    });
    return response.json();
  },

  async getRequests(status) {
    const url = status ? `${API_BASE_URL}/api/requests?status=${status}` : `${API_BASE_URL}/api/requests`;
    const response = await fetch(url);
    return response.json();
  },

  async getRequest(id) {
    const response = await fetch(`${API_BASE_URL}/api/requests/${id}`);
    return response.json();
  },

  async answerRequest(id, answerText, resolved = true) {
    const response = await fetch(`${API_BASE_URL}/api/requests/${id}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answerText, resolved })
    });
    return response.json();
  },

  async getLearnedAnswers() {
    const response = await fetch(`${API_BASE_URL}/api/kb/learned`);
    return response.json();
  },

  async getAllAnswers() {
    const response = await fetch(`${API_BASE_URL}/api/kb`);
    return response.json();
  },

  async getNotifications(callerId) {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${callerId}`);
    return response.json();
  },

  subscribeToNotifications(callerId, onMessage) {
    const eventSource = new EventSource(`${API_BASE_URL}/api/stream/${callerId}`);
    eventSource.onmessage = (event) => {
      onMessage(JSON.parse(event.data));
    };
    return eventSource;
  }
};
