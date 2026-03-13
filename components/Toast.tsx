import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === 'success'
      ? 'bg-green-600'
      : type === 'error'
        ? 'bg-red-600'
        : 'bg-blue-600';

  return (
    <div
      className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50`}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-xl">
          &times;
        </button>
      </div>
    </div>
  );
};

export default Toast;
