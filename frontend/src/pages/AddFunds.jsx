import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const PRESETS = [5, 10, 25, 50, 100];

export default function AddFunds() {
  const { token, user, refreshUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Detect Stripe return
  const fundsStatus = searchParams.get('funds');
  const sessionId = searchParams.get('session_id');
  const requestedAmount = Number(amount) || 0;
  const stripeFee = requestedAmount > 0
    ? Number((requestedAmount * 0.036 + 0.2).toFixed(2))
    : 0;
  const totalCharge = Number((requestedAmount + stripeFee).toFixed(2));

  useEffect(() => {
    if (fundsStatus === 'success') {
      refreshUser();
    }
  }, [fundsStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCheckout(e) {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt < 1) {
      setError('Minimum amount is $1.00');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/payments/stripe-checkout', {
        method: 'POST',
        body: JSON.stringify({ amount: amt }),
      }, token);
      if (!data.checkout_url) throw new Error('No checkout URL received');
      window.location.href = data.checkout_url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-xl font-semibold text-white">Add Funds</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Top up your wallet balance via Stripe.
        </p>
      </div>

      {fundsStatus === 'success' && (
        <div className="rounded-xl bg-emerald-950 border border-emerald-700 px-5 py-4">
          <p className="text-sm font-semibold text-emerald-300">Payment successful!</p>
          <p className="text-xs text-emerald-400 mt-1">
            Your balance has been updated.{sessionId && ` Session: ${sessionId}`}
          </p>
          <p className="text-lg font-bold text-emerald-300 mt-2">
            Current balance: ${Number(user?.balance ?? 0).toFixed(2)}
          </p>
        </div>
      )}

      {fundsStatus === 'cancel' && (
        <div className="rounded-xl bg-amber-950 border border-amber-700 px-5 py-4 text-sm text-amber-300">
          Payment cancelled. You were not charged.
        </div>
      )}

      {/* Balance display */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
        <p className="text-xs text-slate-400">Current Balance</p>
        <p className="text-3xl font-bold text-emerald-400 mt-1">
          ${Number(user?.balance ?? 0).toFixed(2)}
        </p>
      </div>

      <form
        onSubmit={handleCheckout}
        className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-5"
      >
        <h3 className="text-sm font-semibold text-slate-200">Add funds via Stripe</h3>

        {/* Preset buttons */}
        <div>
          <p className="text-xs text-slate-400 mb-2">Quick amounts</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  amount === String(p)
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ${p}
              </button>
            ))}
          </div>
        </div>

        {/* Custom amount */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Custom amount (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 pl-7 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          {requestedAmount > 0 && (
            <p className="mt-2 text-xs text-slate-400">
              You receive ${requestedAmount.toFixed(2)}. Stripe fee (3.6% + $0.20): ${stripeFee.toFixed(2)}. Total charge: ${totalCharge.toFixed(2)}.
            </p>
          )}
        </div>

        {error && (
          <div className="rounded-lg bg-rose-950 border border-rose-700 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !amount || Number(amount) < 1}
          className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          {loading ? 'Redirecting to Stripe…' : `Pay $${totalCharge.toFixed(2)} via Stripe`}
        </button>

        <p className="text-xs text-slate-500 text-center">
          Secured by Stripe. You will be redirected to complete payment.
        </p>
      </form>
    </div>
  );
}
