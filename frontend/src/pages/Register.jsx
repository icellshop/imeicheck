import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import BrandLogoLink from '../components/BrandLogoLink';

const COUNTRIES = [
  'United States', 'Mexico', 'Canada', 'Brazil', 'Argentina', 'Colombia',
  'Spain', 'United Kingdom', 'Germany', 'France', 'Italy', 'Australia',
  'India', 'China', 'Japan', 'Other',
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    country: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function set(field) {
    return (e) => setForm((s) => ({ ...s, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/users/register', {
        method: 'POST',
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          full_name: form.full_name.trim() || undefined,
          country: form.country || undefined,
          phone: form.phone.trim() || undefined,
        }),
      });
      setSuccess(data.message || 'Account created! Check your email to verify your account.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="w-full max-w-sm text-center">
          <div className="bg-emerald-950 border border-emerald-700 rounded-xl p-6 text-emerald-300 text-sm mb-4">
            {success}
          </div>
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 text-sm">
            ← Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <BrandLogoLink className="inline-flex items-center justify-center" imageClassName="h-12 w-auto object-contain" fallbackClassName="text-3xl font-bold text-white" />
          <p className="text-slate-400 text-sm mt-1">Create your account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-4"
        >
          {error && (
            <div className="rounded-lg bg-rose-950 border border-rose-700 px-4 py-2 text-sm text-rose-300">
              {error}
            </div>
          )}

          <Field label="Username *" value={form.username} onChange={set('username')} required />
          <Field label="Email *" type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
          <Field label="Full Name" value={form.full_name} onChange={set('full_name')} />

          <div>
            <label className="block text-xs text-slate-400 mb-1">Country</label>
            <select
              value={form.country}
              onChange={set('country')}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <Field label="Phone" type="tel" value={form.phone} onChange={set('phone')} />
          <Field label="Password *" type="password" value={form.password} onChange={set('password')} required autoComplete="new-password" />
          <Field label="Confirm Password *" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required autoComplete="new-password" />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-white">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <input
        {...props}
        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
      />
    </div>
  );
}
