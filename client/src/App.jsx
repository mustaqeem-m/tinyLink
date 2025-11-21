import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Copy, ExternalLink, BarChart2, Loader2 } from 'lucide-react';

// API Base URL - change this if you deploy the backend elsewhere
const API_BASE = 'http://localhost:5000';

function App() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ url: '', shortCode: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // --- 1. Fetch Links on Load ---
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/links`);
      setLinks(res.data);
    } catch (err) {
      console.error('Failed to fetch links', err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Create Link ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await axios.post(`${API_BASE}/api/links`, formData);
      setFormData({ url: '', shortCode: '' }); // Reset form
      fetchLinks(); // Refresh list
    } catch (err) {
      // Show backend error message (e.g., "Code already in use")
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  // --- 3. Delete Link ---
  const handleDelete = async (code) => {
    if (!confirm('Are you sure you want to delete this link?')) return;
    try {
      await axios.delete(`${API_BASE}/api/links/${code}`);
      setLinks(links.filter((l) => l.shortCode !== code));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  // --- 4. Copy to Clipboard ---
  const copyToClipboard = (code) => {
    const fullUrl = `${API_BASE}/${code}`;
    navigator.clipboard.writeText(fullUrl);
    alert(`Copied: ${fullUrl}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-indigo-600 tracking-tight">
            TinyLink
          </h1>
          <p className="text-gray-500 mt-2">
            Shorten your links, track your clicks.
          </p>
        </header>

        {/* Add Link Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Link</h2>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-4 items-start"
          >
            <div className="flex-1 w-full">
              <input
                type="url"
                placeholder="https://example.com/long-url"
                required
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
              />
            </div>
            <div className="w-full md:w-48">
              <input
                type="text"
                placeholder="Custom Code (Optional)"
                pattern="[A-Za-z0-9]{6,8}"
                title="6-8 alphanumeric characters"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                value={formData.shortCode}
                onChange={(e) =>
                  setFormData({ ...formData, shortCode: e.target.value })
                }
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                'Shorten'
              )}
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>

        {/* Links Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Short Link</th>
                  <th className="p-4 font-medium">Original URL</th>
                  <th className="p-4 font-medium text-center">Clicks</th>
                  <th className="p-4 font-medium">Last Clicked</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400">
                      Loading...
                    </td>
                  </tr>
                ) : links.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-400">
                      No links created yet.
                    </td>
                  </tr>
                ) : (
                  links.map((link) => (
                    <tr
                      key={link.id}
                      className="hover:bg-gray-50/50 transition group"
                    >
                      <td className="p-4 font-medium text-indigo-600">
                        <a
                          href={`${API_BASE}/${link.shortCode}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 hover:underline"
                        >
                          {link.shortCode} <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                      <td
                        className="p-4 text-gray-600 max-w-xs truncate"
                        title={link.originalUrl}
                      >
                        {link.originalUrl}
                      </td>
                      <td className="p-4 text-center font-semibold bg-gray-50 rounded-lg">
                        {link.clicks}
                      </td>
                      <td className="p-4 text-gray-400 text-sm">
                        {link.lastClickedAt
                          ? new Date(link.lastClickedAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => copyToClipboard(link.shortCode)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition"
                          title="Copy Link"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(link.shortCode)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                          title="Delete Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
