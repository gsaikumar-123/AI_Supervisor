import { useState } from 'react';
import { api } from '../services/api';
import Button from '../components/Button';

const TestCall = () => {
  const [callerId, setCallerId] = useState('caller_123');
  const [question, setQuestion] = useState('do you offer manicure?');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await api.call(callerId, question);
      setResponse(result);
    } catch (error) {
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Simulate Call</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="callerId" className="block text-sm font-medium text-gray-700 mb-2">
              Caller ID
            </label>
            <input
              type="text"
              id="callerId"
              value={callerId}
              onChange={(e) => setCallerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
              Question
            </label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Sending...' : 'Send'}
          </Button>
        </form>

        {response && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Response</h2>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCall;
