// track_daily – shared HTTP fetch wrapper
export const API_BASE = '/api';

export function getHeaders(): { [key: string]: string } {
  const token = localStorage.getItem('track_daily_token');
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
