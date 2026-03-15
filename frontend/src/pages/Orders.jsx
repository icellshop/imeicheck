import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['', 'pending', 'completed', 'partial', 'failed'];

const STATUS_BADGE = {
  completed: 'bg-emerald-950 text-emerald-400 border-emerald-800',
  partial: 'bg-amber-950 text-amber-400 border-amber-800',
  pending: 'bg-slate-800 text-slate-300 border-slate-700',
  failed: 'bg-rose-950 text-rose-400 border-rose-800',
};

export default function Orders() {
  const { token, services } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  // Filters
  const [filterImei, setFilterImei] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterService, setFilterService] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  async function fetchOrders() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterImei.trim()) params.set('imei', filterImei.trim());
      if (filterStatus) params.set('status', filterStatus);
      if (filterService.trim()) params.set('service', filterService.trim());
      if (filterFrom) params.set('from', filterFrom);
      if (filterTo) params.set('to', filterTo);
      const qs = params.toString();
      const data = await apiFetch(`/api/imei-orders/me${qs ? `?${qs}` : ''}`, {}, token);
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleFilter(e) {
    e.preventDefault();
    fetchOrders();
  }

  function clearFilters() {
    setFilterImei('');
    setFilterStatus('');
    setFilterService('');
    setFilterFrom('');
    setFilterTo('');
    // Re-fetch without filters after state updates (next render)
    setTimeout(fetchOrders, 0);
  }

  const serviceNames = useMemo(
    () => [...new Set(services.map((s) => s.service_name))].sort(),
    [services]
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white">Order History</h2>
        <p className="text-sm text-slate-400 mt-0.5">All your IMEI check orders.</p>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleFilter}
        className="bg-slate-900 rounded-xl border border-slate-800 p-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <LabeledInput
            label="IMEI / SN"
            placeholder="Search by IMEI…"
            value={filterImei}
            onChange={(e) => setFilterImei(e.target.value)}
          />
          <div>
            <label className="block text-xs text-slate-400 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s || 'All statuses'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Service</label>
            <input
              list="service-options"
              placeholder="Filter by service…"
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <datalist id="service-options">
              {serviceNames.map((n) => <option key={n} value={n} />)}
            </datalist>
          </div>
          <LabeledInput
            label="From date"
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
          />
          <LabeledInput
            label="To date"
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
          />
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-medium text-white"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="flex-1 rounded-lg bg-slate-700 hover:bg-slate-600 px-3 py-2 text-sm font-medium text-white"
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      {/* Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400">
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">IMEI / SN</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Result</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs">
                    Loading…
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 text-xs">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const imeis = safeParseImeis(o.imei);
                  const isExpanded = expanded === o.order_id;
                  return (
                    <>
                      <tr key={o.order_id} className="border-b border-slate-800/60 hover:bg-slate-800/40">
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">#{o.order_id}</td>
                        <td className="px-4 py-3 text-slate-200 max-w-[180px] truncate">
                          {o.service_name_at_order || `Service #${o.service_id}`}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-300 max-w-[140px] truncate">
                          {imeis.length > 1 ? `${imeis[0]} +${imeis.length - 1}` : (imeis[0] || '—')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded border font-medium ${STATUS_BADGE[o.status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300 font-mono text-xs">
                          ${Number(o.price_used || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                          {new Date(o.created_at).toLocaleDateString()}{' '}
                          <span className="text-slate-600">
                            {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {o.result && o.status !== 'pending' && (
                            <button
                              onClick={() => setExpanded(isExpanded ? null : o.order_id)}
                              className="text-xs text-indigo-400 hover:text-indigo-300"
                            >
                              {isExpanded ? 'Hide' : 'View'}
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${o.order_id}-expand`} className="bg-slate-800/40">
                          <td colSpan={7} className="px-4 py-3">
                            <ResultBlock result={o.result} imeis={imeis} />
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ResultBlock({ result, imeis }) {
  let parsed = [];
  try {
    parsed = JSON.parse(result);
  } catch {
    return <pre className="text-xs text-slate-300 whitespace-pre-wrap">{String(result)}</pre>;
  }

  if (!Array.isArray(parsed)) {
    return <pre className="text-xs text-slate-300 whitespace-pre-wrap">{JSON.stringify(parsed, null, 2)}</pre>;
  }

  return (
    <div className="space-y-3">
      {parsed.map((entry, i) => {
        const raw = entry.api?.result || entry.result || '';
        const status = entry.status || 'unknown';
        return (
          <div key={i} className="rounded-lg bg-slate-900 border border-slate-700 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-slate-400">{entry.imei || imeis[i] || '—'}</span>
              <span className={`text-xs font-semibold ${
                status === 'completed' ? 'text-emerald-400' :
                status === 'failed' ? 'text-rose-400' : 'text-amber-400'
              }`}>{status}</span>
            </div>
            {raw ? (
              <pre className="text-xs text-slate-200 whitespace-pre-wrap break-all font-mono">
                {cleanHtml(raw)}
              </pre>
            ) : entry.error ? (
              <p className="text-xs text-rose-300">{entry.error}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function LabeledInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input
        {...props}
        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
      />
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

function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}
