import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Activity,
  Database,
  Server,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

// Use the same base URL
const API_BASE = 'http://localhost:5000';

function Health() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await axios.get(`${API_BASE}/healthz`);
        setStatus(res.data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    // Optional: Auto-refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Checking systems...
      </div>
    );

  const isHealthy = !error && status?.ok;

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header Status */}
        <div
          className={`p-6 flex items-center gap-4 ${
            isHealthy
              ? 'bg-green-50 border-b border-green-100'
              : 'bg-red-50 border-b border-red-100'
          }`}
        >
          {isHealthy ? (
            <div className="p-3 bg-green-100 rounded-full text-green-600">
              <CheckCircle className="w-8 h-8" />
            </div>
          ) : (
            <div className="p-3 bg-red-100 rounded-full text-red-600">
              <XCircle className="w-8 h-8" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-800">System Status</h1>
            <p
              className={`font-medium ${
                isHealthy ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isHealthy ? 'All Systems Operational' : 'System Outage'}
            </p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="p-6 space-y-6">
          {/* API Health */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-indigo-500" />
              <span className="text-gray-600 font-medium">API Server</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isHealthy
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {isHealthy ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>

          {/* Database Health */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-blue-500" />
              <span className="text-gray-600 font-medium">Database</span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                status?.database === 'connected'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {status?.database === 'connected' ? 'CONNECTED' : 'ERROR'}
            </span>
          </div>

          {/* Uptime */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-500" />
              <span className="text-gray-600 font-medium">Uptime</span>
            </div>
            <span className="text-gray-800 font-mono">
              {status?.uptime ? `${Math.floor(status.uptime)}s` : '-'}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
          Version {status?.version || '1.0'} • Last checked:{' '}
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

export default Health;
