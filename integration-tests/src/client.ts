import axios from 'axios';
import http from 'http';

export const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:28000';

// Every test asserts on `response.status` itself, so let axios resolve
// (rather than throw) for 4xx/5xx responses too.
export const client = axios.create({
  baseURL: API_BASE_URL,
  validateStatus: () => true,
  // Avoid reusing a single keep-alive socket across this suite's ~70+
  // sequential requests — Node accumulates an error listener on it per
  // request and eventually warns (MaxListenersExceededWarning).
  httpAgent: new http.Agent({ keepAlive: false }),
});

export function authHeaders(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
