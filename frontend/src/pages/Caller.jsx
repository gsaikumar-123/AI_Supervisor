import { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import Button from '../components/Button';

const Caller = () => {
  const [callerId, setCallerId] = useState('');
  const [question, setQuestion] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef(null);

  const handleConnect = () => {
    if (!callerId.trim()) {
      alert('Please enter a Caller ID');
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = api.subscribeToNotifications(callerId, (notification) => {
      setNotifications(prev => [notification, ...prev]);
    });

    es.onerror = () => {
      addLog('Stream error occurred');
    };

    eventSourceRef.current = es;
    setConnected(true);
    addLog('Connected to notification stream');
  };

  const handleDisconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setConnected(false);
    addLog('Disconnected from stream');
  };

  const handleAsk = async () => {
    if (!callerId.trim() || !question.trim()) {
      alert('Please enter both Caller ID and Question');
      return;
    }

    try {
      const result = await api.call(callerId, question);
      addLog(JSON.stringify(result));
    } catch (error) {
      addLog('Error: ' + error.message);
    }
  };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setNotifications(prev => [{
      id: Date.now(),
      payload: { message: `[${timestamp}] ${message}` }
    }, ...prev]);
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Caller Console</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Caller ID"
              value={callerId}
              onChange={(e) => setCallerId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button onClick={handleConnect} disabled={connected} variant="primary">Connect</Button>
            <Button onClick={handleDisconnect} disabled={!connected} variant="secondary">Disconnect</Button>
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button onClick={handleAsk}>Ask</Button>
          </div>
        </div>

        {connected && (
          <div className="mt-4 inline-flex items-center text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded">
            <div className="w-2 h-2 bg-indigo-600 rounded-full mr-2 animate-pulse"></div>
            Connected
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
        <div className="bg-gray-100 p-4 rounded-md h-96 overflow-auto">
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-center">No notifications yet</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <div key={notification.id} className="bg-white p-3 rounded border border-gray-200">
                  <pre className="text-sm whitespace-pre-wrap">
                    {notification.payload?.message || JSON.stringify(notification.payload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Caller;
