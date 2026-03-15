import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import BrandLogoLink from '../components/BrandLogoLink';

function cleanHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export default function GuestImeiChecker() {
  const [params] = useSearchParams();
  const paymentStatus = params.get('payment');
  const sessionId = params.get('session_id');

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceId, setServiceId] = useState('');
  const [imei, setImei] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [error, setError] = useState('');

  const [polling, setPolling] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  useEffect(() => {
    let ignore = false;
    setLoadingServices(true);
    apiFetch('/api/services')
      .then((data) => {
        if (ignore) return;
        setServices(Array.isArray(data) ? data.filter((s) => s.active) : []);
      })
      .catch(() => {
        if (ignore) return;
        setServices([]);
      })
      .finally(() => {
        if (!ignore) setLoadingServices(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const selectedService = useMemo(
    () => services.find((s) => String(s.service_id) === String(serviceId)),
    [services, serviceId]
  );

  useEffect(() => {
    if (!(paymentStatus === 'success' && sessionId)) return;

    let canceled = false;
    let attempts = 0;

    async function pollOrder() {
      setPolling(true);
      setError('');

      while (!canceled && attempts < 30) {
        attempts += 1;
        try {
          const data = await apiFetch(`/api/imei-orders/by-session/${encodeURIComponent(sessionId)}`);
          if (canceled) return;

          setOrderResult(data);
          if (data.status === 'completed' || data.status === 'failed') {
            setPolling(false);
            return;
          }
        } catch {
          // keep polling; webhook may not have completed yet
        }

        await new Promise((r) => setTimeout(r, 3000));
      }

      if (!canceled) {
        setPolling(false);
      }
    }

    pollOrder();

    return () => {
      canceled = true;
    };
  }, [paymentStatus, sessionId]);

  async function startCheckout(e) {
    e.preventDefault();
    setError('');

    if (!/^\d{15}$/.test(imei.trim())) {
      setError('IMEI must be exactly 15 digits.');
      return;
    }
    if (!serviceId) {
      setError('Please select a service.');
      return;
    }
    if (!guestEmail.trim()) {
      setError('Email is required.');
      return;
    }

    setLoadingCheckout(true);
    try {
      const data = await apiFetch('/api/payments/stripe/imei-checkout', {
        method: 'POST',
        body: JSON.stringify({
          imei: imei.trim(),
          service_id: Number(serviceId),
          guest_email: guestEmail.trim().toLowerCase(),
        }),
      });

      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError('Could not start checkout session.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingCheckout(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <BrandLogoLink className="inline-flex items-center" imageClassName="h-8 w-auto" fallbackClassName="text-xl font-bold text-white" />
          <div>
            <h1 className="text-2xl font-semibold">Guest IMEI Checker</h1>
            <p className="text-sm text-slate-400 mt-1">
              Pay per service with Stripe before running the IMEI check.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="px-3 py-2 rounded-lg border border-slate-700 text-sm text-slate-200 hover:bg-slate-800">
              Home
            </Link>
            <Link to="/login" className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium">
              Sign In
            </Link>
          </div>
        </div>

        {paymentStatus === 'cancel' && (
          <div className="rounded-lg bg-amber-950 border border-amber-700 px-4 py-3 text-sm text-amber-300">
            Payment was canceled.
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-rose-950 border border-rose-700 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={startCheckout} className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Email (result delivery)</label>
            <input
              type="email"
              required
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Service</label>
            <select
              required
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              disabled={loadingServices}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">{loadingServices ? 'Loading services…' : 'Select service'}</option>
              {services.map((service) => (
                <option key={service.service_id} value={service.service_id}>
                  [{service.service_id}] {service.service_name} · ${Number(service.price_guest || 0).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">IMEI (15 digits)</label>
            <input
              type="text"
              value={imei}
              onChange={(e) => setImei(e.target.value.replace(/\s+/g, ''))}
              placeholder="359998765432100"
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          {selectedService && (
            <div className="text-xs rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-slate-300">
              Guest service price: <span className="text-emerald-400 font-semibold">${Number(selectedService.price_guest || 0).toFixed(2)}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loadingCheckout || loadingServices}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold"
          >
            {loadingCheckout ? 'Redirecting to Stripe…' : 'Pay & Run IMEI Check'}
          </button>
        </form>

        {paymentStatus === 'success' && (
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-300">Order status</h2>
            {polling && !orderResult && (
              <p className="text-sm text-slate-400">Payment confirmed. Waiting for result…</p>
            )}
            {orderResult && (
              <>
                <p className="text-sm text-slate-300">
                  Status: <span className="font-semibold text-white">{orderResult.status}</span>
                </p>
                <p className="text-sm text-slate-300">
                  IMEI: <span className="font-mono text-white">{orderResult.imei}</span>
                </p>
                <p className="text-sm text-slate-300">
                  Service: <span className="text-white">{orderResult.service || '—'}</span>
                </p>
                {orderResult.result && (
                  <pre className="text-xs text-slate-200 whitespace-pre-wrap break-words font-mono bg-slate-800 border border-slate-700 rounded p-3">
                    {cleanHtml(orderResult.result)}
                  </pre>
                )}
                {polling && orderResult.status !== 'completed' && orderResult.status !== 'failed' && (
                  <p className="text-xs text-slate-400">Still processing…</p>
                )}
              </>
            )}
          </section>
        )}
      </div>
    </div>
  );
}



