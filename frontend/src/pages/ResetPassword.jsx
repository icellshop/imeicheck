import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import BrandLogoLink from '../components/BrandLogoLink';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => params.get('token') || '', [params]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Missing reset token. Please request a new reset link.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/api/users/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      setMessage(data.message || 'Password changed successfully. Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
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
          <BrandLogoLink className="inline-flex items-center justify-center" imageClassName="h-10 w-auto" fallbackClassName="text-3xl font-bold text-white" />
          <p className="text-slate-400 text-sm mt-1">Set a new password</p>
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
            <label className="block text-xs text-slate-400 mb-1">New password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Confirm password</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            {loading ? 'Saving…' : 'Change password'}
          </button>

          <div className="text-xs text-slate-400 text-center pt-1">
            <Link to="/forgot-password" className="hover:text-white">Request another link</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
