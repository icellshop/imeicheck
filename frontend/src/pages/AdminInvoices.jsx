import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function AdminInvoices() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiFetch('/api/payments/all', {}, token);
        setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">All Invoices</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Global payment and invoice history across all users.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-950 border border-rose-700 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400">
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-right">Charged</th>
                <th className="px-4 py-3 text-right">Credited</th>
                <th className="px-4 py-3 text-left">Method</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Reference</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs">Loading…</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs">No payments found.</td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.payment_id} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <p className="text-slate-200">{payment.User?.email || `User #${payment.user_id}`}</p>
                      <p className="text-xs text-slate-500">{payment.User?.username || 'No username'}</p>
                    </td>
                    <td className="px-4 py-3 text-right text-white">${Number(payment.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-emerald-400">${Number(payment.credited_amount ?? payment.amount ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-slate-300">{payment.payment_method || '—'}</td>
                    <td className="px-4 py-3 text-slate-300">{payment.status}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                      {payment.stripe_checkout_session_id || payment.stripe_payment_intent_id || payment.payment_reference || `#${payment.payment_id}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {payment.created_at ? new Date(payment.created_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}