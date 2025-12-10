import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(id), 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const icons = {
    success: <CheckCircle size={18} className="text-space-neon" />,
    error: <AlertOctagon size={18} className="text-space-alert" />,
    warning: <AlertTriangle size={18} className="text-yellow-400" />,
    info: <Info size={18} className="text-blue-400" />
  };

  const borders = {
    success: 'border-space-neon/50',
    error: 'border-space-alert/50',
    warning: 'border-yellow-400/50',
    info: 'border-blue-400/50'
  };

  const bgs = {
    success: 'bg-space-darker shadow-[0_0_15px_rgba(0,194,255,0.15)]',
    error: 'bg-red-950/80 shadow-[0_0_15px_rgba(255,50,50,0.15)]',
    warning: 'bg-yellow-950/80 shadow-[0_0_15px_rgba(255,200,0,0.15)]',
    info: 'bg-blue-950/80 shadow-[0_0_15px_rgba(50,100,255,0.15)]'
  }

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-lg border backdrop-blur-md transition-all duration-300 transform mb-2 pointer-events-auto
        ${bgs[type]} ${borders[type]}
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
      role="alert"
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <p className="text-sm font-mono text-space-text flex-1 mr-4">
        {message}
      </p>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(id), 300);
        }}
        className="text-space-muted hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
