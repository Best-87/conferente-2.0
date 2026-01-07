import React, { useEffect } from 'react';

interface Props {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<Props> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-600' : 'bg-red-600';
  const icon = type === 'success' ? 'check_circle' : 'error';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex justify-center w-full pointer-events-none">
      <div 
        className={`
          pointer-events-auto
          ${bgColor} 
          text-white shadow-xl shadow-black/20 
          rounded-full py-2 pl-3 pr-3
          flex items-center gap-2.5 
          backdrop-blur-md 
          animate-in slide-in-from-top-2 fade-in zoom-in-95 duration-300
          max-w-[calc(100vw-32px)]
        `}
      >
        <span className="material-symbols-rounded text-[18px] leading-none">{icon}</span>
        <span className="text-xs font-bold tracking-wide pt-[1px] truncate max-w-[200px] sm:max-w-xs">{message}</span>
        <button 
            onClick={onClose} 
            className="ml-1 p-0.5 hover:bg-white/20 rounded-full transition-colors flex items-center justify-center"
        >
            <span className="material-symbols-rounded text-[14px] leading-none">close</span>
        </button>
      </div>
    </div>
  );
};

export default Toast;