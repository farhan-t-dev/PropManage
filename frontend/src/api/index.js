import axios from 'axios';

// VITE_API_URL is baked in at build time (see render.yaml). Falls back to the
// docker-compose backend for local development.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// WebSocket URL on the same origin as the REST API (ws:// in dev, wss:// in prod).
export function wsUrl(path = '/ws/notifications/') {
  const url = new URL(API_BASE_URL.replace(/^http/, 'ws'));
  url.pathname = path;
  return url.toString();
}

export default api;
