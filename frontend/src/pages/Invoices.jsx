import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const STATUS_BADGE = {
  approved: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  pending: 'bg-slate-800 text-slate-300 border-slate-700',
  failed: 'bg-rose-950 text-rose-400 border-rose-800',
};

const TYPE_LABEL = {
  recharge: 'Wallet Top-up',
  guest_imei: 'Guest IMEI Check',
  manual: 'Manual Credit',
};

export default function Invoices() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/payments/my', {}, token)
      .then((data) => setPayments(Array.isArray(data) ? data : []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totalDeposited = payments
    .filter((p) => p.status === 'approved')
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white">Invoices</h2>
        <p className="text-sm text-slate-400 mt-0.5">Your payment and balance history.</p>
      </div>

      {/* Summary */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Total Deposited</p>
          <p className="text-2xl font-bold text-emerald-400">${totalDeposited.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Transactions</p>
          <p className="text-2xl font-bold text-white">{payments.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Reference</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-xs">
                    Loading…
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-xs">
                    No payments found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.payment_id} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString()}{' '}
                      <span className="text-slate-600">
                        {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-200">
                      {TYPE_LABEL[p.type] || p.type || 'Payment'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-white">
                      ${Number(p.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded border font-medium ${
                          STATUS_BADGE[p.status] || 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs truncate max-w-[160px]">
                      {p.stripe_checkout_session_id || p.stripe_payment_intent_id || `#${p.payment_id}`}
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
