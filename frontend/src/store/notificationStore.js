import { create } from 'zustand';

export const useNotificationStore = create((set, get) => ({
  message: null,
  type: 'success',
  isVisible: false,
  timeoutId: null,
  socket: null,
  isConnected: false,

  showNotification: (message, type = 'success', duration = 3000) => {
    const { timeoutId } = get();
    if (timeoutId) clearTimeout(timeoutId);

    const newTimeoutId = setTimeout(() => {
      get().hideNotification();
    }, duration);

    set({ message, type, isVisible: true, timeoutId: newTimeoutId });
  },

  hideNotification: () => {
    const { timeoutId } = get();
    if (timeoutId) clearTimeout(timeoutId);
    set({ isVisible: false, message: null, type: 'success', timeoutId: null });
  },

  connect: () => {
    const { socket } = get();
    if (socket) return;

    const wsUrl = 'ws://localhost:8000/ws/notifications/';
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      set({ isConnected: true });
      console.log('WS Connected');
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        get().showNotification(data.message, data.type || 'info');
      } catch (e) {
        console.error('WS Error', e);
      }
    };

    newSocket.onclose = () => {
      set({ isConnected: false, socket: null });
    };

    set({ socket: newSocket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.close();
      set({ socket: null, isConnected: false });
    }
  }
}));