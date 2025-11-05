import { useState, useEffect } from 'react';
import { api } from '../services/api';
import Button from '../components/Button';

const Learned = () => {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnswers();
  }, []);

  const fetchAnswers = async () => {
    setLoading(true);
    try {
      const data = await api.getLearnedAnswers();
      setAnswers(data.answers || []);
    } catch (error) {
      console.error('Error fetching learned answers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Learned Answers</h1>
        <Button onClick={fetchAnswers}>Refresh</Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Learned At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {answers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    No learned answers yet
                  </td>
                </tr>
              ) : (
                answers.map((answer, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{answer.question}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{answer.answer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {answer.learnedAt ? new Date(answer.learnedAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Learned;
