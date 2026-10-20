import { create } from "zustand";
import { wsUrl } from "../api";
import { useAuthStore } from "./authStore";

/**
 * Toast + realtime channel.
 *
 * `showNotification(message, type)` is the imperative API called across the
 * app; the same store owns the WebSocket that Django Channels pushes to, and
 * keeps a short history so the header bell has something to show.
 */
const HISTORY_LIMIT = 12;

export const useNotificationStore = create((set, get) => ({
  message: null,
  type: "success",
  isVisible: false,
  timeoutId: null,

  socket: null,
  isConnected: false,
  retryTimer: null,
  history: [],

  showNotification: (message, type = "success", duration = 3600) => {
    const { timeoutId, history } = get();
    if (timeoutId) clearTimeout(timeoutId);

    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      message,
      type,
      at: new Date().toISOString(),
      read: false,
    };

    const id = duration
      ? setTimeout(() => get().hideNotification(), duration)
      : null;

    set({
      message,
      type,
      isVisible: true,
      timeoutId: id,
      history: [entry, ...history].slice(0, HISTORY_LIMIT),
    });
  },

  hideNotification: () => {
    const { timeoutId } = get();
    if (timeoutId) clearTimeout(timeoutId);
    set({ isVisible: false, timeoutId: null });
  },

  markAllRead: () => {
    set({ history: get().history.map((h) => ({ ...h, read: true })) });
  },

  /** Reconnects with backoff while the socket is unavailable. */
  connect: () => {
    if (get().socket || !useAuthStore.getState().isAuthenticated) return;

    let socket;
    try {
      socket = new WebSocket(wsUrl());
    } catch {
      return;
    }

    socket.onopen = () => {
      set({ isConnected: true, retryTimer: null });
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.message) {
          get().showNotification(data.message, data.type || "info", 6000);
        }
      } catch {
        /* non-JSON payload — ignore */
      }
    };

    socket.onclose = () => {
      const wasClean = socket.readyState === 3;
      set({ socket: null, isConnected: false });
      // Retry with a fixed backoff, but only while still signed in.
      const stillAuthed = !!useAuthStore.getState().user;
      if (!stillAuthed) return;
      const timer = setTimeout(() => get().connect(), wasClean ? 4000 : 6000);
      set({ retryTimer: timer });
    };

    socket.onerror = () => {
      try {
        socket.close();
      } catch {
        /* already closed */
      }
    };

    set({ socket });
  },

  disconnect: () => {
    const { socket, retryTimer } = get();
    if (retryTimer) clearTimeout(retryTimer);
    if (socket) {
      socket.onclose = null;
      try {
        socket.close();
      } catch {
        /* noop */
      }
    }
    set({ socket: null, isConnected: false, retryTimer: null });
  },
}));
