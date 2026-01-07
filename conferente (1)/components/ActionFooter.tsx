import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface Props {
  activeView: AppView;
  onRegister: () => void;
  onHistory: () => void;
  onTicket: () => void;
  onWeighing: () => void;
}

const ActionFooter: React.FC<Props> = ({ activeView, onRegister, onHistory, onTicket, onWeighing }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Detect keyboard by monitoring viewport height changes
    // This is more reliable on mobile than focus events
    const handleResize = () => {
      if (window.visualViewport) {
        // If the viewport height is significantly less than the screen height,
        // it's highly likely the keyboard is open.
        const isKeyboardOpen = window.visualViewport.height < window.innerHeight * 0.75;
        setIsVisible(!isKeyboardOpen);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
    }

    // Fallback for focused inputs
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
        setIsVisible(false);
      }
    };

    const handleFocusOut = () => {
      // Small delay to ensure we aren't just jumping between inputs
      setTimeout(() => {
        if (window.visualViewport) {
          const isKeyboardOpen = window.visualViewport.height < window.innerHeight * 0.75;
          setIsVisible(!isKeyboardOpen);
        } else {
          setIsVisible(true);
        }
      }, 150);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return (
    <div 
      className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-surface-container-low via-surface-container-low/95 to-transparent pt-10 z-50 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="grid grid-cols-[1fr_2fr_1fr] gap-3">
        <button 
          className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl font-bold transition-all active:scale-95 shadow-sm
            ${activeView === 'history' ? 'bg-primary text-on-primary' : 'bg-secondary-container text-on-secondary-container hover:bg-secondary-container/80'}
          `}
          onClick={onHistory}
        >
          <span className="material-symbols-rounded text-[22px]">history</span>
          <span className="text-[10px] font-extrabold uppercase opacity-80">Histórico</span>
        </button>

        <button 
          className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/25 transition-transform active:scale-95 hover:bg-primary/90"
          onClick={activeView === 'weighing' ? onRegister : onWeighing}
        >
          <span className="material-symbols-rounded text-[22px]">
            {activeView === 'weighing' ? 'check' : 'scale'}
          </span>
          <span className="text-sm uppercase tracking-wide">
            {activeView === 'weighing' ? 'Salvar' : 'Pesar'}
          </span>
        </button>

        <button 
          className={`flex h-14 flex-col items-center justify-center gap-0.5 rounded-2xl font-bold transition-all active:scale-95 shadow-sm
            ${activeView === 'ticket' ? 'bg-primary text-on-primary' : 'bg-tertiary-container text-on-tertiary-container hover:bg-tertiary-container/80'}
          `}
          onClick={onTicket}
        >
          <span className="material-symbols-rounded text-[22px]">receipt_long</span>
          <span className="text-[10px] font-extrabold uppercase opacity-80">Ticket</span>
        </button>
      </div>
    </div>
  );
};

export default ActionFooter;