import React from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationToast = () => {
  const { isVisible, message, type, hideNotification } = useNotificationStore();

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-brand-500" />
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-100',
    error: 'bg-rose-50 border-rose-100',
    warning: 'bg-amber-50 border-amber-100',
    info: 'bg-brand-50 border-brand-100'
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className={`fixed bottom-10 left-1/2 z-[100] min-w-[320px] p-4 rounded-2xl border shadow-2xl flex items-center gap-4 ${bgColors[type]}`}
        >
          {icons[type]}
          <div className="flex-1">
            <p className="text-sm font-bold text-surface-900">{message}</p>
          </div>
          <button 
            onClick={hideNotification}
            className="p-1 hover:bg-white rounded-lg transition-colors text-surface-400 hover:text-surface-900"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationToast;