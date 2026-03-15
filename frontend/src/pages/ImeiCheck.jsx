import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLOR = {
  completed: 'text-emerald-400 bg-emerald-950 border-emerald-800',
  partial: 'text-amber-400 bg-amber-950 border-amber-800',
  pending: 'text-slate-300 bg-slate-800 border-slate-700',
  failed: 'text-rose-400 bg-rose-950 border-rose-800',
};

export default function ImeiCheck() {
  const { token, services, refreshUser } = useAuth();
  const [bulkMode, setBulkMode] = useState(false);
  const [serviceId, setServiceId] = useState('');
  const [imeiInput, setImeiInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');

  const filteredServices = useMemo(() => {
    if (!serviceSearch.trim()) return services;
    const q = serviceSearch.toLowerCase();
    return services.filter((s) => s.service_name.toLowerCase().includes(q));
  }, [services, serviceSearch]);

  const selectedService = useMemo(
    () => services.find((s) => String(s.service_id) === String(serviceId)),
    [services, serviceId]
  );

  const imeiList = useMemo(() => {
    return imeiInput
      .split(/[\n,;]+/)
      .map((v) => v.trim())
      .filter(Boolean);
  }, [imeiInput]);

  const lineCount = imeiList.length;
  const tooMany = lineCount > 50;
  const estimatedCost = selectedService
    ? (Number(selectedService.price_registered || 0) * Math.min(lineCount, 50)).toFixed(2)
    : '0.00';

  async function handleSubmit(e) {
    e.preventDefault();
    if (!serviceId) { setError('Please select a service.'); return; }
    if (lineCount === 0) { setError('Please enter at least one IMEI or SN.'); return; }
    if (tooMany) { setError('Maximum 50 IMEIs per order.'); return; }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const payload = {
        service_id: Number(serviceId),
        imeis: imeiList,
      };
      const data = await apiFetch('/api/imei-orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, token);
      setResults(Array.isArray(data) ? data : [data]);
      setImeiInput('');
      refreshUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-semibold text-white">IMEI Check</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Enter an IMEI or Serial Number to query a service.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-5">
        {/* Mode toggle */}
        <div className="flex gap-2">
          <ModeBtn active={!bulkMode} onClick={() => { setBulkMode(false); setImeiInput(''); }}>
            Single IMEI / SN
          </ModeBtn>
          <ModeBtn active={bulkMode} onClick={() => { setBulkMode(true); setImeiInput(''); }}>
            Bulk (up to 50)
          </ModeBtn>
        </div>

        {/* Service selector */}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Service</label>
          <input
            type="text"
            placeholder="Search service…"
            value={serviceSearch}
            onChange={(e) => setServiceSearch(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-white mb-2 focus:outline-none focus:border-indigo-500"
          />
          <select
            required
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            size={Math.min(filteredServices.length + 1, 8)}
          >
            <option value="">— Select service —</option>
            {filteredServices.map((s) => (
              <option key={s.service_id} value={s.service_id}>
                [{s.service_id}] {s.service_name} · ${Number(s.price_registered || 0).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        {/* IMEI input */}
        {bulkMode ? (
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              IMEIs / Serial Numbers{' '}
              <span className={tooMany ? 'text-rose-400' : 'text-slate-500'}>
                ({lineCount}/50)
              </span>
            </label>
            <textarea
              rows={10}
              placeholder="One IMEI or SN per line (max 50)"
              value={imeiInput}
              onChange={(e) => setImeiInput(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500 resize-none"
            />
            {tooMany && (
              <p className="text-xs text-rose-400 mt-1">Exceeds 50 IMEI limit.</p>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs text-slate-400 mb-1">IMEI or Serial Number</label>
            <input
              type="text"
              placeholder="e.g. 359998765432100 or C02XL2YJJG5J"
              value={imeiInput}
              onChange={(e) => setImeiInput(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {/* Cost estimate */}
        {selectedService && lineCount > 0 && (
          <div className="text-xs text-slate-400 bg-slate-800 rounded-lg px-3 py-2">
            <span className="text-slate-300">{lineCount} IMEI(s) × </span>
            <span className="text-white">${Number(selectedService.price_registered || 0).toFixed(2)}</span>
            <span className="text-slate-300"> = estimated </span>
            <span className="text-emerald-400 font-semibold">${estimatedCost}</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-rose-950 border border-rose-700 px-3 py-2 text-sm text-rose-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !serviceId || lineCount === 0 || tooMany}
          className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          {loading ? 'Processing…' : `Submit${lineCount > 1 ? ` (${lineCount} IMEIs)` : ''}`}
        </button>
      </form>

      {/* Results */}
      {results && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300">Results</h3>
          {results.map((r, i) => (
            <ResultCard key={i} result={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function ModeBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
        active
          ? 'bg-indigo-600 border-indigo-500 text-white'
          : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );
}

function ResultCard({ result }) {
  const status = result.status || 'unknown';
  const colorClass = STATUS_COLOR[status] || 'text-slate-400 bg-slate-800 border-slate-700';
  const rawResult = result.api?.result || result.result || '';

  return (
    <div className={`rounded-xl border p-4 ${colorClass.split(' ').slice(1).join(' ')}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-slate-300">{result.imei}</span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${colorClass}`}>
          {status}
        </span>
      </div>
      {rawResult ? (
        <pre className="text-xs text-slate-200 whitespace-pre-wrap break-all font-mono bg-black/30 rounded p-2">
          {cleanHtml(rawResult)}
        </pre>
      ) : (
        result.error && (
          <p className="text-xs text-rose-300">{result.error}</p>
        )
      )}
    </div>
  );
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
