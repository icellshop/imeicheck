import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function AdminServices() {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadServices();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadServices() {
    setLoading(true);
    try {
      const data = await apiFetch('/api/services', {}, token);
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function updateLocal(serviceId, field, value) {
    setServices((current) => current.map((service) => (
      service.service_id === serviceId ? { ...service, [field]: value } : service
    )));
  }

  async function saveService(service) {
    setSavingId(service.service_id);
    setError('');
    setMessage('');
    try {
      await apiFetch(`/api/services/${service.service_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          service_name: service.service_name,
          description: service.description,
          cost: service.cost,
          object: service.object,
          limit: service.limit,
          price_guest: service.price_guest,
          price_registered: service.price_registered,
          price_premium: service.price_premium,
          price_pro: service.price_pro,
          active: service.active,
        }),
      }, token);
      setMessage(`Saved service #${service.service_id}.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Services</h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Edit service pricing tiers and service metadata.
        </p>
      </div>

      {message && <Banner tone="success">{message}</Banner>}
      {error && <Banner tone="error">{error}</Banner>}

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-5 text-sm text-slate-400">Loading services…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1200px]">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="px-3 py-3 text-left">Service</th>
                  <th className="px-3 py-3 text-left">Description</th>
                  <th className="px-3 py-3 text-right">Guest</th>
                  <th className="px-3 py-3 text-right">Registered</th>
                  <th className="px-3 py-3 text-right">Premium</th>
                  <th className="px-3 py-3 text-right">Pro</th>
                  <th className="px-3 py-3 text-right">Cost</th>
                  <th className="px-3 py-3 text-right">Limit</th>
                  <th className="px-3 py-3 text-left">Active</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.service_id} className="border-b border-slate-800/60 align-top">
                    <td className="px-3 py-3">
                      <input
                        value={service.service_name || ''}
                        onChange={(e) => updateLocal(service.service_id, 'service_name', e.target.value)}
                        className="w-48 rounded bg-slate-800 border border-slate-700 px-2 py-1.5 text-white"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <textarea
                        value={service.description || ''}
                        onChange={(e) => updateLocal(service.service_id, 'description', e.target.value)}
                        rows={2}
                        className="w-72 rounded bg-slate-800 border border-slate-700 px-2 py-1.5 text-white"
                      />
                    </td>
                    {['price_guest', 'price_registered', 'price_premium', 'price_pro', 'cost', 'limit'].map((field) => (
                      <td key={field} className="px-3 py-3 text-right">
                        <input
                          type="number"
                          step={field === 'limit' ? '1' : '0.01'}
                          value={service[field] ?? ''}
                          onChange={(e) => updateLocal(service.service_id, field, e.target.value)}
                          className="w-24 rounded bg-slate-800 border border-slate-700 px-2 py-1.5 text-right text-white"
                        />
                      </td>
                    ))}
                    <td className="px-3 py-3">
                      <label className="inline-flex items-center gap-2 text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={Boolean(service.active)}
                          onChange={(e) => updateLocal(service.service_id, 'active', e.target.checked)}
                        />
                        {service.active ? 'Active' : 'Hidden'}
                      </label>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => saveService(service)}
                        disabled={savingId === service.service_id}
                        className="rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-3 py-2 text-xs font-semibold text-white"
                      >
                        {savingId === service.service_id ? 'Saving…' : 'Save'}
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