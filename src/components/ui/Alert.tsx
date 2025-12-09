import React from 'react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type = 'info', message, onClose }) => {
  const styles = {
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    success: 'bg-green-50 text-green-800 border-green-200',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    error: 'bg-red-50 text-red-800 border-red-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${styles[type]} flex justify-between items-center`}>
      <p>{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-4 text-lg font-bold hover:opacity-70"
        >
          &times;
        </button>
      )}
    </div>
  );
};