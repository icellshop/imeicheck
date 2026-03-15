import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLOR = {
  completed: 'text-emerald-400',
  partial: 'text-amber-400',
  pending: 'text-slate-400',
  failed: 'text-rose-400',
};

export default function Dashboard() {
  const { user, token, services, refreshUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    refreshUser();
    apiFetch('/api/imei-orders/me', {}, token)
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const topServices = useMemo(() => {
    const counts = {};
    for (const o of orders) {
      const name = o.service_name_at_order || 'Unknown';
      counts[name] = (counts[name] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [orders]);

  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter((o) => o.status === 'completed').length;
    const pending = orders.filter((o) => o.status === 'pending').length;
    const failed = orders.filter((o) => o.status === 'failed' || o.status === 'partial').length;
    const spent = orders.reduce((s, o) => s + Number(o.price_used || 0), 0);
    return { total, completed, pending, failed, spent };
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Welcome back{user?.username ? `, ${user.username}` : ''}!
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">Here's an overview of your account.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Balance" value={`$${Number(user?.balance ?? 0).toFixed(2)}`} accent="text-emerald-400" />
        <StatCard label="Total Orders" value={stats.total} />
        <StatCard label="Completed" value={stats.completed} accent="text-emerald-400" />
        <StatCard label="Total Spent" value={`$${stats.spent.toFixed(2)}`} accent="text-indigo-400" />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/imei-check"
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          + New IMEI Check
        </Link>
        <Link
          to="/add-funds"
          className="rounded-lg bg-slate-700 hover:bg-slate-600 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          Add Funds
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top services */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Most Used Services</h3>
          {loadingOrders ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : topServices.length === 0 ? (
            <p className="text-sm text-slate-500">No orders yet.</p>
          ) : (
            <ul className="space-y-3">
              {topServices.map(([name, count]) => {
                const max = topServices[0][1];
                const pct = Math.round((count / max) * 100);
                return (
                  <li key={name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300 truncate">{name}</span>
                      <span className="text-slate-400 ml-2">{count}</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full">
                      <div
                        className="h-1.5 bg-indigo-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recent orders */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300">Recent Orders</h3>
            <Link to="/orders" className="text-xs text-indigo-400 hover:text-indigo-300">
              View all →
            </Link>
          </div>
          {loadingOrders ? (
            <p className="text-sm text-slate-500">Loading…</p>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500">No orders yet.</p>
          ) : (
            <ul className="space-y-2">
              {recentOrders.map((o) => {
                const imeis = safeParseImeis(o.imei);
                return (
                  <li key={o.order_id} className="flex items-center justify-between text-xs">
                    <div className="min-w-0">
                      <p className="text-slate-200 truncate">
                        {o.service_name_at_order || `Service #${o.service_id}`}
                      </p>
                      <p className="text-slate-500 truncate">{imeis[0] ?? '—'}</p>
                    </div>
                    <div className="ml-3 text-right flex-shrink-0">
                      <span className={`font-medium ${STATUS_COLOR[o.status] ?? 'text-slate-400'}`}>
                        {o.status}
                      </span>
                      <p className="text-slate-500">${Number(o.price_used || 0).toFixed(2)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
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

function safeParseImeis(raw) {
  if (!raw) return [];
  try {
    const p = JSON.parse(raw);
    return Array.isArray(p) ? p : [String(raw)];
  } catch {
    return [String(raw)];
  }
}
