import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const data = await apiFetch('/api/users/request-password-reset', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setMessage(data.message || 'If the email exists, a reset link has been sent.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-white">
            IMEI<span className="text-indigo-400">Check</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-950 border border-rose-700 px-4 py-2 text-sm text-rose-300">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-lg bg-emerald-950 border border-emerald-700 px-4 py-2 text-sm text-emerald-300">
              {message}
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-400 mb-1">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>

          <div className="flex justify-between text-xs text-slate-400 pt-1">
            <Link to="/login" className="hover:text-white">Back to login</Link>
            <Link to="/register" className="hover:text-white">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
