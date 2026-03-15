import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { token, user } = useAuth();
  const [quickStats, setQuickStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [servicesUsage, setServicesUsage] = useState([]);
  const [paymentsTimeline, setPaymentsTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isSuperAdmin = user?.user_type === 'superadmin';

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

      {isSuperAdmin && quickStats?.imeicheck_upstream_balance?.error && (
        <div className="rounded-xl bg-amber-950 border border-amber-700 px-4 py-3 text-sm text-amber-300">
          Upstream balance warning: {quickStats.imeicheck_upstream_balance.error}
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
  const usersTotal = Number(quickStats?.users_live_balance_total || 0);
  const upstreamTotal = Number(quickStats?.imeicheck_upstream_balance?.value || 0);
  const gap = upstreamTotal - usersTotal;
  const sign = gap >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(gap).toFixed(2)}`;
}