const USE_LOCAL = import.meta.env.VITE_USE_LOCAL === 'true';
const BASE = USE_LOCAL ? import.meta.env.VITE_LOCAL_API_URL : import.meta.env.VITE_PROD_API_URL;

export const getAuthToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

export async function apiRequest(path, { method = 'GET', body, token = getAuthToken(), headers = {} } = {}) {
  const requestHeaders = { ...headers };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}