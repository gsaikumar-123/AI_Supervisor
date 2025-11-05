import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Button from '../components/Button';
import Badge from '../components/Badge';

const Supervisor = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [resolved, setResolved] = useState(true);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const data = await api.getRequests(filter);
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleSelectRequest = async (id) => {
    try {
      const data = await api.getRequest(id);
      setSelectedRequest(data);
      setAnswerText('');
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !answerText.trim()) return;

    setLoading(true);
    try {
      await api.answerRequest(selectedRequest.id, answerText, resolved);
      alert('Answer submitted successfully!');
      setAnswerText('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error) {
      alert('Error submitting answer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Supervisor Console</h1>

      <div className="mb-6 flex gap-4">
        <Button onClick={fetchRequests}>Refresh</Button>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="resolved">Resolved</option>
          <option value="unresolved">Unresolved</option>
        </select>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caller</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr
                key={request.id}
                onClick={() => handleSelectRequest(request.id)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.id.slice(0, 8)}...</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.callerId}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{request.question}</td>
                <td className="px-6 py-4 whitespace-nowrap"><Badge status={request.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(request.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Details</h2>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm mb-6">
            {JSON.stringify(selectedRequest, null, 2)}
          </pre>

          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <div>
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                Answer
              </label>
              <textarea
                id="answer"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Type your answer here..."
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="resolved"
                checked={resolved}
                onChange={(e) => setResolved(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="resolved" className="ml-2 block text-sm text-gray-900">
                Mark as resolved
              </label>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting...' : 'Submit Answer'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Supervisor;
