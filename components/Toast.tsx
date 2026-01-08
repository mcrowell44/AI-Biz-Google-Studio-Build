
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
  duration?: number; // Optional duration in milliseconds, default to 3000
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Give time for fade-out animation before calling onClose
      setTimeout(onClose, 300); 
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 border-green-700 text-white';
      case 'error':
        return 'bg-red-600 border-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 border-yellow-700 text-white';
      case 'info':
      default:
        return 'bg-blue-600 border-blue-700 text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      case 'warning':
        return <AlertCircle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed top-6 right-6 z-[200] p-4 pr-6 rounded-xl shadow-lg flex items-center gap-3 transition-all duration-300 transform 
        ${getColors()} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      {getIcon()}
      <p className="font-medium text-sm">{message}</p>
      <button 
        onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
        className="ml-auto p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close notification"
      >
        <XCircle size={16} className="text-white opacity-70" />
      </button>
    </div>
  );
};

export default Toast;