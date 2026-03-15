import { useEffect, useState } from 'react';
import { apiFetch, API_BASE } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function ApiKeys() {
  const { token, user } = useAuth();
  const [activeKey, setActiveKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  async function fetchKey() {
    setLoading(true);
    try {
      const data = await apiFetch('/api/apikeys/me', {}, token);
      setActiveKey(data.active_key || null);
    } catch {
      setActiveKey(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchKey();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleGenerate(e) {
    e.preventDefault();
    if (
      activeKey &&
      !window.confirm(
        'Generating a new key will immediately revoke your current key. Any integrations using the old key will stop working. Continue?'
      )
    )
      return;

    setActionLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await apiFetch('/api/apikeys', {
        method: 'POST',
        body: JSON.stringify({ label: newLabel.trim() || undefined }),
      }, token);
      setActiveKey(data.active_key);
      setRevealed(true); // show the new key immediately after creation
      setNewLabel('');
      setMessage('New API key generated. Copy and store it safely — you can always regenerate it but old integrations will break.');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRevoke() {
    if (
      !window.confirm(
        'This will permanently revoke your API key. Any integrations using it will immediately stop working. Continue?'
      )
    )
      return;

    setActionLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await apiFetch('/api/apikeys/revoke', { method: 'DELETE' }, token);
      setActiveKey(null);
      setRevealed(false);
      setMessage(data.message || 'API key revoked.');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  }

  function maskKey(key) {
    if (!key) return '';
    return key.slice(0, 8) + '••••••••••••••••••••••••••••••••••••••••••••••••' + key.slice(-8);
  }

  const externalUrl = `${API_BASE}/api/external/imei-check`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold text-white">API Access</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Connect your IMEICheck account to external services (e.g. probuyer.org) using an API key.
        </p>
      </div>

      {message && (
        <div className="rounded-xl bg-emerald-950 border border-emerald-700 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-rose-950 border border-rose-700 px-4 py-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Active key card */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300">Your Active API Key</h3>
          {activeKey && (
            <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
              Active
            </span>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : !activeKey ? (
          <div className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-5 text-center">
            <p className="text-sm text-slate-400">No active API key. Generate one below.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeKey.label && (
              <p className="text-xs text-slate-400">
                Label: <span className="text-slate-200">{activeKey.label}</span>
              </p>
            )}

            {/* Key display */}
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-xs font-mono text-white break-all">
                {revealed ? activeKey.api_key : maskKey(activeKey.api_key)}
              </code>
              <button
                onClick={() => setRevealed((r) => !r)}
                className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 shrink-0"
              >
                {revealed ? 'Hide' : 'Show'}
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeKey.api_key);
                  setMessage('API key copied to clipboard!');
                }}
                className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 shrink-0"
              >
                Copy
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
              <span>Created: {new Date(activeKey.created_at).toLocaleDateString()}</span>
              <span>
                Last used:{' '}
                {activeKey.last_used_at
                  ? new Date(activeKey.last_used_at).toLocaleString()
                  : 'Never'}
              </span>
            </div>

            <button
              onClick={handleRevoke}
              disabled={actionLoading}
              className="w-full rounded-lg bg-rose-900 hover:bg-rose-800 disabled:opacity-50 px-4 py-2 text-sm font-medium text-white transition-colors"
            >
              {actionLoading ? 'Revoking…' : 'Revoke Key'}
            </button>
          </div>
        )}
      </div>

      {/* Generate new key */}
      <form
        onSubmit={handleGenerate}
        className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4"
      >
        <h3 className="text-sm font-semibold text-slate-300">
          {activeKey ? 'Regenerate Key' : 'Generate Key'}
        </h3>
        {activeKey && (
          <div className="rounded-lg bg-amber-950 border border-amber-700 px-3 py-2 text-xs text-amber-300">
            ⚠ Generating a new key immediately revokes the current one.
          </div>
        )}
        <div>
          <label className="block text-xs text-slate-400 mb-1">Label (optional)</label>
          <input
            type="text"
            maxLength={100}
            placeholder="e.g. probuyer.org integration"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={actionLoading}
          className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          {actionLoading
            ? 'Generating…'
            : activeKey
              ? 'Regenerate API Key'
              : 'Generate API Key'}
        </button>
      </form>

      {/* Integration docs */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-300">Integration Guide</h3>
        <p className="text-xs text-slate-400">
          Make a <span className="text-white font-mono">POST</span> request from your platform to the
          endpoint below. Both your <strong className="text-slate-200">API key</strong> and your
          registered <strong className="text-slate-200">email</strong> must match.
        </p>

        <div>
          <p className="text-xs text-slate-500 mb-1">Endpoint</p>
          <code className="block rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs font-mono text-indigo-300 break-all">
            POST {externalUrl}
          </code>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1">Request body (JSON)</p>
          <pre className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-3 text-xs font-mono text-slate-200 overflow-x-auto">{`{
  "api_key":    "${activeKey ? maskKey(activeKey.api_key) : '<your-api-key>'}",
  "email":      "${user?.email || '<your-registered-email>'}",
  "service_id": 1,
  "imei":       "359998765432100"
}`}</pre>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1">Bulk (up to 50 IMEIs)</p>
          <pre className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-3 text-xs font-mono text-slate-200 overflow-x-auto">{`{
  "api_key":    "<your-api-key>",
  "email":      "<your-email>",
  "service_id": 1,
  "imeis":      ["359998765432100", "359998765432101"]
}`}</pre>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1">Response (success)</p>
          <pre className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-3 text-xs font-mono text-slate-200 overflow-x-auto">{`{
  "success":  true,
  "order_id": 12345,
  "status":   "completed",
  "results": [
    {
      "imei":   "359998765432100",
      "status": "completed",
      "result": "Find My iPhone: ON\\nModel: iPhone 15 Pro",
      "object": { "fmiOn": true, "model": "iPhone 15 Pro (A3104)" }
    }
  ],
  "charged": 0.01,
  "balance": 4.37
}`}</pre>
        </div>

        <div>
          <p className="text-xs text-slate-500 mb-1">Service IDs</p>
          <p className="text-xs text-slate-400">
            Use the same numeric service IDs visible in the IMEI Check page. Service prices apply
            according to your account tier (registered / premium / pro).
          </p>
        </div>
      </div>
    </div>
  );
}
