'use client';

import { useState, useEffect } from 'react';

// Define interface for login data
interface LoginData {
  username: string;
  password: string;
  timestamp: string;
  ip?: string;
}

export default function TestRedis() {
  const [status, setStatus] = useState('Testing connection...');
  const [data, setData] = useState<LoginData[]>([]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('/api/login');
        if (response.ok) {
          const result = await response.json();
          setData(result);
          setStatus('Connection successful!');
        } else {
          setStatus('Connection failed: ' + response.status);
        }
      } catch (error) {
        setStatus('Connection error: ' + (error instanceof Error ? error.message : String(error)));
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Redis Connection Test</h1>
      <p className="mb-4">Status: {status}</p>
      
      <h2 className="text-xl font-bold mb-2">Stored Data:</h2>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
      
      <button 
        onClick={() => window.location.reload()} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh
      </button>
    </div>
  );
}