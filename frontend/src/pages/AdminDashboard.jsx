import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [quickStats, setQuickStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [servicesUsage, setServicesUsage] = useState([]);
  const [paymentsTimeline, setPaymentsTimeline] = useState(null);
  const [stripeFees, setStripeFees] = useState({ percent: '3.6', fixed: '0.30' });
  const [feesLoading, setFeesLoading] = useState(false);
  const [feesSaving, setFeesSaving] = useState(false);
  const [feesMessage, setFeesMessage] = useState('');
  const [feesError, setFeesError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isSuperAdmin = user?.user_type === 'superadmin';
  const coverageGap = getCoverageGapValue(quickStats);

  useEffect(() => {
    let cancelled = false;

    async function load({ withLoader = true } = {}) {
      if (withLoader) setLoading(true);
      setError('');
      try {
        const [quick, orders, usage, timeline] = await Promise.all([
          apiFetch('/api/dashboard/quick-stats', {}, token),
          apiFetch('/api/dashboard/order-stats', {}, token),
          apiFetch('/api/dashboard/services-usage', {}, token),
          apiFetch('/api/dashboard/payments-approved-timeline', {}, token),
        ]);

        if (!cancelled) {
          setQuickStats(quick);
          setOrderStats(orders);
          setServicesUsage(Array.isArray(usage) ? usage : []);
          setPaymentsTimeline(timeline);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load({ withLoader: true });
    const timer = setInterval(() => load({ withLoader: false }), 15000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isSuperAdmin) return;

    let cancelled = false;

    async function loadStripeFees() {
      setFeesLoading(true);
      setFeesError('');
      try {
        const data = await apiFetch('/api/branding', {}, token);
        if (!cancelled) {
          setStripeFees({
            percent: String(Number(data?.stripe_fee_percent ?? 3.6)),
            fixed: Number(data?.stripe_fee_fixed ?? 0.3).toFixed(2),
          });
        }
      } catch (err) {
        if (!cancelled) {
          setFeesError(err.message);
        }
      } finally {
        if (!cancelled) setFeesLoading(false);
      }
    }

    loadStripeFees();
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin, token]);

  async function handleSaveStripeFees(e) {
    e.preventDefault();
    setFeesSaving(true);
    setFeesMessage('');
    setFeesError('');

    const percent = Number(stripeFees.percent);
    const fixed = Number(stripeFees.fixed);

    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      setFeesSaving(false);
      setFeesError('Fee percent must be between 0 and 100.');
      return;
    }

    if (!Number.isFinite(fixed) || fixed < 0 || fixed > 1000) {
      setFeesSaving(false);
      setFeesError('Fixed fee must be between 0 and 1000.');
      return;
    }

    try {
      const response = await apiFetch('/api/branding/stripe-fees', {
        method: 'PUT',
        body: JSON.stringify({
          stripe_fee_percent: percent,
          stripe_fee_fixed: fixed,
        }),
      }, token);

      setStripeFees({
        percent: String(Number(response?.stripe_fee_percent ?? percent)),
        fixed: Number(response?.stripe_fee_fixed ?? fixed).toFixed(2),
      });
      setFeesMessage('Stripe fee settings saved.');
    } catch (err) {
      setFeesError(err.message);
    } finally {
      setFeesSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-400">Loading admin dashboard…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Platform Dashboard</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Global platform overview for {user?.user_type || 'admin'} accounts.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-950 border border-rose-700 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Users" value={quickStats?.users ?? 0} />
        <StatCard label="Orders" value={quickStats?.orders ?? 0} />
        <StatCard label="Revenue" value={`$${Number(quickStats?.payments ?? 0).toFixed(2)}`} accent="text-emerald-400" />
        <StatCard label="Completed Orders" value={orderStats?.completed ?? 0} accent="text-indigo-400" />
      </div>

      {isSuperAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="All Users Live Balance"
            value={`$${Number(quickStats?.users_live_balance_total ?? 0).toFixed(2)}`}
            accent="text-amber-300"
          />
          <StatCard
            label="IMEICHECK Upstream Balance"
            value={formatUpstreamBalance(quickStats?.imeicheck_upstream_balance)}
            accent="text-cyan-300"
          />
          <StatCard
            label="Coverage Gap"
            value={formatCoverageGap(quickStats)}
            accent="text-fuchsia-300"
          />
        </div>
      )}

      {isSuperAdmin && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Stripe Fee Settings</h3>

          {feesLoading ? (
            <p className="text-sm text-slate-400">Loading fee settings…</p>
          ) : (
            <form onSubmit={handleSaveStripeFees} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs text-slate-400">Fee percent (%)</span>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    max="100"
                    value={stripeFees.percent}
                    onChange={(e) => setStripeFees((prev) => ({ ...prev, percent: e.target.value }))}
                    className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </label>

                <label className="block">
                  <span className="text-xs text-slate-400">Fixed fee (USD)</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1000"
                    value={stripeFees.fixed}
                    onChange={(e) => setStripeFees((prev) => ({ ...prev, fixed: e.target.value }))}
                    className="mt-1 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </label>
              </div>

              <p className="text-xs text-slate-500">
                Formula used at checkout: customer charge = recharge amount + (recharge amount * fee% / 100) + fixed fee.
              </p>

              {feesError && (
                <div className="rounded-lg bg-rose-950 border border-rose-700 px-3 py-2 text-sm text-rose-300">
                  {feesError}
                </div>
              )}

              {feesMessage && (
                <div className="rounded-lg bg-emerald-950 border border-emerald-700 px-3 py-2 text-sm text-emerald-300">
                  {feesMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={feesSaving}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition-colors"
              >
                {feesSaving ? 'Saving…' : 'Save Stripe Fees'}
              </button>
            </form>
          )}
        </div>
      )}

      {isSuperAdmin && quickStats?.imeicheck_upstream_balance?.error && (
        <div className="rounded-xl bg-amber-950 border border-amber-700 px-4 py-3 text-sm text-amber-300">
          Upstream balance warning: {quickStats.imeicheck_upstream_balance.error}
        </div>
      )}

      {isSuperAdmin && coverageGap < 0 && (
        <div className="rounded-xl bg-rose-950 border border-rose-700 px-4 py-3 text-sm text-rose-300">
          Coverage alert: Upstream IMEICHECK balance is ${Math.abs(coverageGap).toFixed(2)} below total users live balance. Top up upstream credits to avoid user service interruptions.
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Order Status</h3>
          <div className="space-y-3 text-sm">
            <MetricRow label="Completed" value={orderStats?.completed ?? 0} />
            <MetricRow label="Pending" value={orderStats?.pending ?? 0} />
            <MetricRow label="Failed" value={orderStats?.failed ?? 0} />
            <MetricRow label="Total" value={orderStats?.total ?? 0} />
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Services</h3>
          <div className="space-y-3">
            {servicesUsage.length === 0 ? (
              <p className="text-sm text-slate-500">No usage data yet.</p>
            ) : (
              servicesUsage.slice(0, 6).map((entry) => (
                <div key={entry.service} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 truncate mr-3">{entry.service}</span>
                  <span className="text-slate-500">{entry.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Approved Payments Timeline</h3>
          <span className="text-xs text-slate-500">Last 12 months</span>
        </div>

        <div className="space-y-3">
          {(paymentsTimeline?.months || []).map((month, index) => (
            <div key={month} className="grid grid-cols-[90px_1fr_80px] gap-3 items-center text-xs">
              <span className="text-slate-500">{month}</span>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{
                    width: `${getBarWidth(paymentsTimeline?.totals || [], index)}%`,
                  }}
                />
              </div>
              <span className="text-right text-slate-300">
                ${Number(paymentsTimeline?.totals?.[index] || 0).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = 'text-white' }) {
  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${accent}`}>{value}</p>
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function getBarWidth(totals, index) {
  const max = Math.max(...totals, 1);
  return Math.round((Number(totals[index] || 0) / max) * 100);
}

function formatUpstreamBalance(upstream) {
  if (!upstream) return 'N/A';
  if (upstream.value === null || typeof upstream.value === 'undefined') return 'N/A';
  return `$${Number(upstream.value).toFixed(2)}`;
}

function formatCoverageGap(quickStats) {
  const gap = getCoverageGapValue(quickStats);
  const sign = gap >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(gap).toFixed(2)}`;
}

function getCoverageGapValue(quickStats) {
  const usersTotal = Number(quickStats?.users_live_balance_total || 0);
  const upstreamTotal = Number(quickStats?.imeicheck_upstream_balance?.value || 0);
  return upstreamTotal - usersTotal;
}