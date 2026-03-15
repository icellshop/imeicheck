import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const COUNTRIES = [
  'United States', 'Mexico', 'Canada', 'Brazil', 'Argentina', 'Colombia',
  'Spain', 'United Kingdom', 'Germany', 'France', 'Italy', 'Australia',
  'India', 'China', 'Japan', 'Other',
];

export default function Profile() {
  const { user, token, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    country: user?.country || '',
    phone: user?.phone || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  const [branding, setBranding] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoMsg, setLogoMsg] = useState('');
  const [logoErr, setLogoErr] = useState('');
  const isSuperAdmin = user?.user_type === 'superadmin';

  useEffect(() => {
    if (!isSuperAdmin) return;
    apiFetch('/api/branding')
      .then((data) => setBranding(data || null))
      .catch(() => setBranding(null));
  }, [isSuperAdmin]);

  function setP(field) {
    return (e) => setProfileForm((s) => ({ ...s, [field]: e.target.value }));
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg('');
    setProfileErr('');
    try {
      await apiFetch('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: profileForm.full_name.trim() || null,
          country: profileForm.country || null,
          phone: profileForm.phone.trim() || null,
        }),
      }, token);
      setProfileMsg('Profile updated successfully.');
      refreshUser();
    } catch (err) {
      setProfileErr(err.message);
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwErr('New passwords do not match.');
      return;
    }
    if (pwForm.new_password.length < 8) {
      setPwErr('Password must be at least 8 characters.');
      return;
    }
    setPwLoading(true);
    setPwMsg('');
    setPwErr('');
    try {
      const data = await apiFetch('/api/users/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: pwForm.current_password,
          new_password: pwForm.new_password,
        }),
      }, token);
      setPwMsg(data.message || 'Password changed successfully.');
      setPwForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPwErr(err.message);
    } finally {
      setPwLoading(false);
    }
  }

  async function handleLogoUpload(e) {
    e.preventDefault();
    if (!logoFile) {
      setLogoErr('Please select an image file.');
      return;
    }

    setLogoLoading(true);
    setLogoMsg('');
    setLogoErr('');

    const body = new FormData();
    body.append('logo', logoFile);

    try {
      const data = await apiFetch('/api/branding/logo', {
        method: 'PUT',
        body,
      }, token);
      setBranding(data);
      setLogoMsg(data.message || 'Global logo updated successfully.');
      setLogoFile(null);
    } catch (err) {
      setLogoErr(err.message);
    } finally {
      setLogoLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h2 className="text-xl font-semibold text-white">Profile</h2>
        <p className="text-sm text-slate-400 mt-0.5">Manage your account settings.</p>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 mb-1">Account Info</h3>
        <InfoRow label="User ID" value={`#${user?.user_id}`} mono />
        <InfoRow label="Username" value={user?.username} />
        <InfoRow label="Email" value={user?.email} />
        <InfoRow label="Account Type" value={user?.user_type} />
        <InfoRow
          label="Balance"
          value={`$${Number(user?.balance ?? 0).toFixed(2)}`}
          accent="text-emerald-400"
        />
      </div>

      <form
        onSubmit={handleProfileSave}
        className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4"
      >
        <h3 className="text-sm font-semibold text-slate-300">Edit Profile</h3>

        {profileMsg && (
          <div className="rounded-lg bg-emerald-950 border border-emerald-700 px-3 py-2 text-sm text-emerald-300">
            {profileMsg}
          </div>
        )}
        {profileErr && (
          <div className="rounded-lg bg-rose-950 border border-rose-700 px-3 py-2 text-sm text-rose-300">
            {profileErr}
          </div>
        )}

        <Field label="Full Name" value={profileForm.full_name} onChange={setP('full_name')} />

        <div>
          <label className="block text-xs text-slate-400 mb-1">Country</label>
          <select
            value={profileForm.country}
            onChange={setP('country')}
            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select country</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <Field label="Phone" type="tel" value={profileForm.phone} onChange={setP('phone')} />

        <button
          type="submit"
          disabled={profileLoading}
          className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          {profileLoading ? 'Saving…' : 'Save Changes'}
        </button>
      </form>

      {isSuperAdmin && (
        <form
          onSubmit={handleLogoUpload}
          className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold text-slate-300">Global Branding Logo</h3>

          {logoMsg && (
            <div className="rounded-lg bg-emerald-950 border border-emerald-700 px-3 py-2 text-sm text-emerald-300">
              {logoMsg}
            </div>
          )}
          {logoErr && (
            <div className="rounded-lg bg-rose-950 border border-rose-700 px-3 py-2 text-sm text-rose-300">
              {logoErr}
            </div>
          )}

          {branding?.logo_url ? (
            <div className="rounded-lg bg-slate-800 border border-slate-700 p-3">
              <img src={branding.logo_url} alt="Current logo" className="h-12 w-auto" />
            </div>
          ) : (
            <p className="text-xs text-slate-400">No logo uploaded yet.</p>
          )}

          <div>
            <label className="block text-xs text-slate-400 mb-1">Logo image (PNG/JPG/WEBP/SVG, max 2MB)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white file:mr-3 file:rounded file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={logoLoading}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            {logoLoading ? 'Uploading…' : 'Upload Global Logo'}
          </button>
        </form>
      )}

      <form
        onSubmit={handleChangePassword}
        className="bg-slate-900 rounded-xl border border-slate-800 p-5 space-y-4"
      >
        <h3 className="text-sm font-semibold text-slate-300">Change Password</h3>

        {pwMsg && (
          <div className="rounded-lg bg-emerald-950 border border-emerald-700 px-3 py-2 text-sm text-emerald-300">
            {pwMsg}
          </div>
        )}
        {pwErr && (
          <div className="rounded-lg bg-rose-950 border border-rose-700 px-3 py-2 text-sm text-rose-300">
            {pwErr}
          </div>
        )}

        <Field
          label="Current Password"
          type="password"
          autoComplete="current-password"
          value={pwForm.current_password}
          onChange={(e) => setPwForm((s) => ({ ...s, current_password: e.target.value }))}
          required
        />
        <Field
          label="New Password"
          type="password"
          autoComplete="new-password"
          value={pwForm.new_password}
          onChange={(e) => setPwForm((s) => ({ ...s, new_password: e.target.value }))}
          required
        />
        <Field
          label="Confirm New Password"
          type="password"
          autoComplete="new-password"
          value={pwForm.confirm_password}
          onChange={(e) => setPwForm((s) => ({ ...s, confirm_password: e.target.value }))}
          required
        />

        <button
          type="submit"
          disabled={pwLoading}
          className="w-full rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          {pwLoading ? 'Changing…' : 'Change Password'}
        </button>
      </form>

      <div className="bg-slate-900 rounded-xl border border-red-900/40 p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Session</h3>
        <button
          onClick={handleLogout}
          className="rounded-lg bg-rose-800 hover:bg-rose-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono = false, accent = 'text-slate-200' }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className={`${accent} ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
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
