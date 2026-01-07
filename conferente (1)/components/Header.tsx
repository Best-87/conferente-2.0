import React, { useState, useEffect } from 'react';
import { AppView } from '../types';

interface Props {
    currentView?: AppView;
    onNavigate?: (view: AppView) => void;
}

// Global declaration for the theme update function injected in index.html
declare global {
    interface Window {
        updateAppTheme: (palette: string, isDark: boolean) => void;
    }
}

const FAQModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
        <div 
            className="w-full max-w-md bg-surface text-on-surface rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-300 max-h-[85vh] overflow-y-auto" 
            onClick={e => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-rounded text-3xl">help</span>
                    <h2 className="text-xl font-bold text-on-surface">Dúvidas Frequentes</h2>
                </div>
                <button onClick={onClose} className="p-2 bg-surface-container rounded-full hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-rounded">close</span>
                </button>
            </div>

            <div className="flex flex-col gap-4">
                <details className="group bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30">
                    <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-sm select-none hover:bg-surface-container transition-colors">
                        Como funciona o modo Auto?
                        <span className="material-symbols-rounded text-lg transition-transform group-open:rotate-180">expand_more</span>
                    </summary>
                    <div className="px-4 pb-4 text-sm text-on-surface-variant leading-relaxed">
                        O sistema aprende automaticamente a tara dos produtos. Ao digitar o fornecedor e o produto, se já houver um registro anterior, a tara será preenchida e o modo mudará para Manual.
                    </div>
                </details>

                <details className="group bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30">
                    <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-sm select-none hover:bg-surface-container transition-colors">
                        O que é a Tara de Embalagem?
                        <span className="material-symbols-rounded text-lg transition-transform group-open:rotate-180">expand_more</span>
                    </summary>
                    <div className="px-4 pb-4 text-sm text-on-surface-variant leading-relaxed">
                        É o peso adicional de itens como pallets, cantoneiras ou plásticos. Você informa o peso unitário em gramas e a quantidade, e o sistema soma ao peso da tara do produto.
                    </div>
                </details>

                <details className="group bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30">
                    <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-sm select-none hover:bg-surface-container transition-colors">
                        Como corrigir o peso?
                        <span className="material-symbols-rounded text-lg transition-transform group-open:rotate-180">expand_more</span>
                    </summary>
                    <div className="px-4 pb-4 text-sm text-on-surface-variant leading-relaxed">
                        Toque diretamente no número grande do peso para digitar manualmente caso a balança não esteja conectada ou precise de ajuste fino.
                    </div>
                </details>
                
                 <details className="group bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/30">
                    <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-sm select-none hover:bg-surface-container transition-colors">
                        Como funciona a "Evidência Visual"?
                        <span className="material-symbols-rounded text-lg transition-transform group-open:rotate-180">expand_more</span>
                    </summary>
                    <div className="px-4 pb-4 text-sm text-on-surface-variant leading-relaxed">
                        Ao pressionar o botão de câmera, uma foto simulada é anexada ao registro para auditoria. No histórico, você pode clicar para ver a imagem em tela cheia.
                    </div>
                </details>
            </div>
            
            <div className="mt-8 text-center">
                <p className="text-xs text-on-surface-variant/60">Conferente Pro v1.3.0</p>
                <p className="text-[10px] text-on-surface-variant/40 mt-1">Desenvolvido para alta performance</p>
            </div>
        </div>
    </div>
);

const Header: React.FC<Props> = ({ currentView = 'weighing', onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentPalette, setCurrentPalette] = useState('indigo');

  const themes = [
    { id: 'indigo', color: '#4f46e5', label: 'Índigo' },
    { id: 'emerald', color: '#059669', label: 'Verde' },
    { id: 'blue', color: '#2563eb', label: 'Azul' },
    { id: 'rose', color: '#e11d48', label: 'Rosa' },
    { id: 'amber', color: '#d97706', label: 'Âmbar' },
  ];

  useEffect(() => {
      // Check Theme Mode
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          setIsDark(true);
      } else {
          setIsDark(false);
      }

      // Check Palette
      const savedPalette = localStorage.getItem('themePalette');
      if (savedPalette) {
          setCurrentPalette(savedPalette);
      }
  }, []);

  const toggleTheme = () => {
      const newDarkState = !isDark;
      setIsDark(newDarkState);
      
      if (newDarkState) {
          document.documentElement.classList.add('dark');
          localStorage.theme = 'dark';
      } else {
          document.documentElement.classList.remove('dark');
          localStorage.theme = 'light';
      }
      
      // Re-apply palette with new dark state
      if (window.updateAppTheme) {
        window.updateAppTheme(currentPalette, newDarkState);
      }
  };

  const changePalette = (paletteId: string) => {
      setCurrentPalette(paletteId);
      localStorage.setItem('themePalette', paletteId);
      if (window.updateAppTheme) {
          window.updateAppTheme(paletteId, isDark);
      }
  };

  return (
    <>
    <header className="sticky top-0 z-50 bg-surface-container-low/80 backdrop-blur-md pt-2 pb-2 px-4 transition-all duration-200 border-b border-transparent dark:border-outline-variant/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary shadow-lg shadow-primary/30 transition-colors duration-300">
            <span className="material-symbols-rounded text-[24px]">fact_check</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold leading-none text-on-surface tracking-tight">Conferente</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200 animate-pulse"></span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Sistema Ativo</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            {onNavigate && currentView !== 'weighing' ? (
                <button 
                    onClick={() => onNavigate('weighing')}
                    className="flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 bg-surface border border-outline-variant hover:bg-surface-container text-on-surface-variant shadow-sm"
                >
                    <span className="material-symbols-rounded text-[20px]">arrow_back</span>
                </button>
            ) : (
                <button 
                    onClick={() => setIsMenuOpen(true)}
                    className="flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 hover:bg-surface-container text-on-surface-variant active:scale-95"
                >
                    <span className="material-symbols-rounded text-[24px]">menu</span>
                </button>
            )}
        </div>
      </div>
    </header>

    {/* Menu Drawer Overlay */}
    {isMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300" onClick={() => setIsMenuOpen(false)}></div>
            
            <div className="absolute top-2 right-2 bottom-auto left-auto w-72 bg-surface/95 backdrop-blur-xl border border-outline-variant/20 rounded-[2rem] shadow-2xl p-4 flex flex-col gap-2 animate-in slide-in-from-right-10 zoom-in-95 duration-300 origin-top-right">
                
                <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Aparência</span>
                    <button onClick={() => setIsMenuOpen(false)} className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant">
                        <span className="material-symbols-rounded">close</span>
                    </button>
                </div>

                {/* Dark Mode Toggle */}
                <button 
                    onClick={toggleTheme}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors group mb-2"
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-orange-500/20 text-orange-600'} transition-colors`}>
                            <span className="material-symbols-rounded text-[20px]">{isDark ? 'dark_mode' : 'light_mode'}</span>
                        </div>
                        <span className="text-sm font-bold text-on-surface">Modo Escuro</span>
                    </div>
                    <div className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${isDark ? 'bg-primary' : 'bg-outline-variant'}`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDark ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                </button>

                {/* Color Palette Grid */}
                <div className="px-2 mb-2">
                    <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase mb-2 block">Cor do Tema</span>
                    <div className="flex justify-between items-center bg-surface-container rounded-xl p-2">
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => changePalette(theme.id)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 relative ring-2 ${currentPalette === theme.id ? 'ring-on-surface ring-offset-2 ring-offset-surface' : 'ring-transparent'}`}
                                style={{ backgroundColor: theme.color }}
                                aria-label={theme.label}
                                title={theme.label}
                            >
                                {currentPalette === theme.id && (
                                    <span className="material-symbols-rounded text-[16px] text-white drop-shadow-md">check</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-px bg-outline-variant/20 my-1 mx-2"></div>

                {/* Social Media / Contact */}
                <div className="px-2 mb-1 mt-2">
                     <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase mb-1 block">Contato</span>
                     <a
                        href="https://t.me/Best_87"
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container transition-colors text-on-surface group"
                     >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#229ED9]/10 text-[#229ED9] group-hover:bg-[#229ED9]/20 transition-colors">
                            <span className="material-symbols-rounded text-[18px] -ml-0.5 mt-0.5">send</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold leading-tight">Telegram</span>
                            <span className="text-[10px] text-on-surface-variant leading-tight">@Best_87</span>
                        </div>
                     </a>
                </div>

                <div className="h-px bg-outline-variant/20 my-1 mx-2"></div>

                <button 
                    onClick={() => { setIsMenuOpen(false); setIsFaqOpen(true); }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container transition-colors text-on-surface"
                >
                     <div className="p-2 rounded-full bg-tertiary-container text-on-tertiary-container">
                        <span className="material-symbols-rounded text-[20px]">help</span>
                    </div>
                    <span className="text-sm font-bold">Ajuda & FAQ</span>
                </button>

                <div className="mt-2 pt-3 border-t border-outline-variant/10 px-2 flex justify-between items-center text-[10px] text-on-surface-variant/50 font-medium">
                    <span>Versão 1.3.1</span>
                    <span>Build 2025.07</span>
                </div>
            </div>
        </div>
    )}

    {isFaqOpen && <FAQModal onClose={() => setIsFaqOpen(false)} />}
    </>
  );
};

export default Header;