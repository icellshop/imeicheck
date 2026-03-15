const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const normalizedApiUrl = rawApiUrl ? rawApiUrl.replace(/\/$/, '') : '';
const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedApiUrl);

const API_BASE = import.meta.env.DEV
  ? normalizedApiUrl || ''
  : !normalizedApiUrl || isLocalApiUrl
    ? ''
    : normalizedApiUrl;

async function parseResponse(res) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const message =
      (isJson && (payload.error || payload.message)) ||
      (typeof payload === 'string' ? payload : `HTTP ${res.status}`);
    throw new Error(message);
  }

  return payload;
}

export async function apiFetch(path, options = {}, token = null) {
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  return parseResponse(response);
}

export { API_BASE };
