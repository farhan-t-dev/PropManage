import { create } from "zustand";
import api from "../api";

/**
 * A 401 on anything but an auth endpoint means the access cookie expired or
 * was never issued. Quietly drop the cached identity; the route guards will
 * bounce to /login. Registering the interceptor here (rather than in the api
 * module) avoids a circular import between the two.
 */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    const isAuthCall = /\/auth\/|\/users\/register\//.test(url);
    if (
      status === 401 &&
      !isAuthCall &&
      !error?.config?.skipAuthReset &&
      useAuthStore.getState().isAuthenticated
    ) {
      useAuthStore.getState().logout_local();
    }
    return Promise.reject(error);
  },
);

/**
 * Identity store. The JWT lives in an HttpOnly cookie, so only the user
 * object is cached here — in memory and mirrored to localStorage so a page
 * refresh doesn't flash the logged-out shell.
 */
export const useAuthStore = create((set, get) => ({
  user: readCachedUser(),
  isAuthenticated: !!readCachedUser(),
  /** True until the first /users/me/ round-trip settles. */
  bootstrapped: false,

  login: async (username, password) => {
    await api.post("/auth/token/", { username, password });
    await get().fetchUser();
  },

  register: async (userData) => {
    await api.post("/users/register/", userData);
    await get().login(userData.username, userData.password);
  },

  fetchUser: async () => {
    try {
      const res = await api.get("/users/me/");
      set({ user: res.data, isAuthenticated: true });
      localStorage.setItem("user", JSON.stringify(res.data));
      return res.data;
    } catch {
      get().logout_local();
      return null;
    } finally {
      set({ bootstrapped: true });
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout/");
    } finally {
      get().logout_local();
    }
  },

  logout_local: () => {
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    if (get().bootstrapped) return;
    // A cached identity may be stale; always revalidate on boot.
    await get().fetchUser();
  },
}));

function readCachedUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
