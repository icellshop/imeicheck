import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const USER_TYPES = ['registered', 'premium', 'pro', 'admin', 'superadmin'];

export default function AdminUsers() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadUsers() {
    setLoading(true);
    try {
      const [statsRows, users] = await Promise.all([
        apiFetch('/api/users/admin-list', {}, token),
        apiFetch('/api/users', {}, token),
      ]);

      const usersById = Object.fromEntries((Array.isArray(users) ? users : []).map((user) => [String(user.user_id), user]));
      const merged = (Array.isArray(statsRows) ? statsRows : []).map((row) => ({
        ...usersById[String(row.user_id)],
        ...row,
      }));

      setRows(merged);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function updateLocal(userId, field, value) {
    setRows((current) => current.map((row) => (
      row.user_id === userId ? { ...row, [field]: value } : row
    )));
  }

  async function saveUser(row) {
    setSavingId(row.user_id);
    setError('');
    setMessage('');
    try {
      await apiFetch(`/api/users/${row.user_id}/update-type`, {
        method: 'PUT',
        body: JSON.stringify({ user_type: row.user_type }),
      }, token);

      await apiFetch(`/api/users/${row.user_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          username: row.username,
          email: row.email,
          country: row.country,
          phone: row.phone,
          full_name: row.full_name,
        }),
      }, token);

      setMessage(`Saved user #${row.user_id}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Users</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Superadmin controls for user tiers and account details.
        </p>
      </div>

      {message && <Banner tone="success">{message}</Banner>}
      {error && <Banner tone="error">{error}</Banner>}

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-5 text-sm text-slate-400">Loading users…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1300px]">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="px-3 py-3 text-left">User</th>
                  <th className="px-3 py-3 text-left">Full Name</th>
                  <th className="px-3 py-3 text-left">Country</th>
                  <th className="px-3 py-3 text-left">Phone</th>
                  <th className="px-3 py-3 text-left">Tier</th>
                  <th className="px-3 py-3 text-right">Payments</th>
                  <th className="px-3 py-3 text-right">Spent</th>
                  <th className="px-3 py-3 text-right">Orders</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.user_id} className="border-b border-slate-800/60 align-top">
                    <td className="px-3 py-3">
                      <input
                        value={row.email || ''}
                        onChange={(e) => updateLocal(row.user_id, 'email', e.target.value)}
                        className="w-64 rounded bg-slate-800 border border-slate-700 px-2 py-1.5 text-white mb-2"
                      />
                      <input
                        value={row.username || ''}
                        onChange={(e) => updateLocal(row.user_id, 'username', e.target.value)}
                        className="w-48 rounded bg-slate-800 border border-slate-700 px-2 py-1.5 text-white"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        value={row.full_name || ''}
                        onChange={(e) => updateLocal(row.user_id, 'full_name', e.target.value)}
                        className="w-44 rounded bg-slate-800 border border-slate-700 px-2 py-1.5 text-white"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        value={row.country || ''}
                        onChange={(e) => updateLocal(row.user_id, 'country', e.target.value)}
                        className="w-32 rounded bg-slate-800 border border-slate-700 px-2 py-1.5 text-white"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        value={row.phone || ''}
                        onChange={(e) => updateLocal(row.user_id, 'phone', e.target.value)}
                        className="w-36 rounded bg-slate-800 border border-slate-700 px-2 py-1.5 text-white"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={row.user_type || 'registered'}
                        onChange={(e) => updateLocal(row.user_id, 'user_type', e.target.value)}
                        className="rounded bg-slate-800 border border-slate-700 px-2 py-1.5 text-white"
                      >
                        {USER_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 text-right text-slate-300">${Number(row.total_payments_amount || 0).toFixed(2)}</td>
                    <td className="px-3 py-3 text-right text-slate-300">${Number(row.completed_orders_amount || 0).toFixed(2)}</td>
                    <td className="px-3 py-3 text-right text-slate-300">{Number(row.completed_orders || 0)}</td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => saveUser(row)}
                        disabled={savingId === row.user_id}
                        className="rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-3 py-2 text-xs font-semibold text-white"
                      >
                        {savingId === row.user_id ? 'Saving…' : 'Save'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Banner({ tone, children }) {
  const styles = tone === 'success'
    ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
    : 'bg-rose-950 border-rose-700 text-rose-300';

  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}