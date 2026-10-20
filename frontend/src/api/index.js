import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

/**
 * Single axios instance. Auth is cookie-based (HttpOnly JWT), so every request
 * must carry credentials — never reach for a bare `axios` import elsewhere.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

/** Build a websocket URL from the configured API origin. */
export function wsUrl(path = "/ws/notifications/") {
  const url = new URL(API_BASE_URL.replace(/^http/, "ws"));
  url.pathname = path;
  return url.toString();
}

export function apiUrl(path) {
  return new URL(path, API_BASE_URL).toString();
}

export default api;
