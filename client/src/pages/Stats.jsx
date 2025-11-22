import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ExternalLink, Clock, MousePointer } from 'lucide-react';

const API_BASE = 'http://localhost:5000'; // Update this after deployment

function Stats() {
  const { code } = useParams();
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/links/${code}`);
        setLink(res.data);
      } catch (err) {
        setError('Link not found');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [code]);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading stats...</div>
    );
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-md w-full">
        <Link
          to="/"
          className="text-indigo-600 flex items-center gap-2 mb-6 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold mb-2 text-gray-800">
          Link Statistics
        </h1>
        <div className="bg-indigo-50 p-4 rounded-lg mb-6 text-center">
          <p className="text-xs uppercase text-indigo-400 font-bold tracking-wider">
            Short Code
          </p>
          <p className="text-3xl font-extrabold text-indigo-700">
            {link.shortCode}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-gray-400 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Target URL</p>
              <a
                href={link.originalUrl}
                target="_blank"
                className="text-indigo-600 break-all hover:underline"
              >
                {link.originalUrl}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MousePointer className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Total Clicks</p>
              <p className="font-semibold text-gray-800">{link.clicks}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Last Clicked</p>
              <p className="font-semibold text-gray-800">
                {link.lastClickedAt
                  ? new Date(link.lastClickedAt).toLocaleString()
                  : 'Never'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
