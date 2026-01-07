import React from 'react';
import { WeightData } from '../types';

interface Props {
  data: WeightData;
  targetWeight?: number;
  onWeightChange?: (newWeight: number) => void;
}

const WeightCard: React.FC<Props> = ({ data, targetWeight = 0, onWeightChange }) => {
  const formatWeight = (value: number) => {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const renderDifference = () => {
    if (!targetWeight || targetWeight <= 0) return null;

    const diff = data.net - targetWeight;
    const isNeg = diff < -0.01;
    const isPos = diff > 0.01;
    
    let colorClass = 'text-on-surface-variant';
    let icon = 'check';
    let sign = '';
    
    if (isNeg) {
        colorClass = 'text-error';
        icon = 'arrow_downward';
    } else if (isPos) {
        colorClass = 'text-emerald-700';
        icon = 'arrow_upward';
        sign = '+';
    }

    return (
        <div className={`flex items-center gap-1 text-xs font-bold ${colorClass} bg-surface-container-high px-2 py-1 rounded-lg transition-all`}>
             <span className="text-[9px] font-extrabold uppercase opacity-60">DIF:</span>
             <span className="tabular-nums">{sign}{diff.toFixed(2)}</span>
             <span className="material-symbols-rounded text-[14px]">{icon}</span>
        </div>
    );
  };

  return (
    <section className="flex flex-col gap-2">
        {/* Main Display Card */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-container to-secondary-container shadow-md p-4">
            
            {/* Header: Stability & Title */}
            <div className="flex justify-between items-start mb-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-primary-container/60 mt-1">
                    Peso Bruto
                </span>
                
                <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 transition-colors duration-300 ${data.isStable ? 'bg-primary/10' : 'bg-yellow-500/20'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${data.isStable ? 'bg-primary' : 'bg-yellow-600'} ${data.isStable ? '' : 'animate-pulse'}`}></span>
                    <span className={`text-[9px] font-extrabold uppercase tracking-wide ${data.isStable ? 'text-primary' : 'text-yellow-800'}`}>
                        {data.isStable ? 'Estável' : 'Instável'}
                    </span>
                </div>
            </div>

            {/* Main Input Area - Compacted */}
            <div className="flex items-baseline justify-center relative w-full my-0">
                 {onWeightChange ? (
                    <div className="relative w-full flex justify-center">
                         {/* Hidden placeholder to ensure width */}
                         <div className="h-0 overflow-hidden text-[4.5rem] font-black tracking-tighter opacity-0 px-2 pointer-events-none">
                            {data.current === 0 ? '0.00' : data.current}
                         </div>
                         
                         <input
                            type="number"
                            inputMode="decimal"
                            className="w-full text-center bg-transparent border-0 p-0 text-[4rem] xs:text-[4.5rem] font-black tracking-tighter tabular-nums leading-none text-on-primary-container focus:ring-0 placeholder:text-on-primary-container/20 z-10"
                            value={data.current === 0 ? '' : data.current}
                            placeholder="0.00"
                            onChange={(e) => onWeightChange(parseFloat(e.target.value) || 0)}
                            step="0.01"
                        />
                         <span className="absolute right-4 bottom-3 text-lg font-bold text-on-primary-container/50 pointer-events-none">kg</span>
                    </div>
                ) : (
                     <div className="relative">
                        <span className="text-[4.5rem] font-black tracking-tighter tabular-nums leading-none text-on-primary-container">
                            {formatWeight(data.current)}
                        </span>
                        <span className="absolute -right-8 bottom-3 text-lg font-bold text-on-primary-container/50">kg</span>
                     </div>
                )}
            </div>
        </div>

        {/* Info Grid - Compacted */}
        <div className="grid grid-cols-2 gap-2">
            {/* Left Col: Details */}
            <div className="bg-surface-container rounded-[1.5rem] px-3 py-2.5 flex flex-col justify-center gap-1.5">
                <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase text-on-surface-variant/70">Tara Total</span>
                    <span className="text-base font-bold text-on-surface-variant tabular-nums">{formatWeight(data.tare)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold uppercase text-on-surface-variant/70">Nota</span>
                    <span className="text-sm font-bold text-on-surface-variant tabular-nums">
                        {targetWeight > 0 ? targetWeight.toFixed(2) : '--'}
                    </span>
                </div>
            </div>

            {/* Right Col: Net Weight & Diff */}
            <div className="bg-primary text-on-primary rounded-[1.5rem] px-3 py-2.5 flex flex-col items-center justify-center relative overflow-hidden shadow-lg shadow-primary/20">
                <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-bl-[3rem]"></div>
                
                <span className="text-[9px] font-bold uppercase opacity-80 mb-0">Peso Líquido</span>
                <span className="text-2xl font-black tabular-nums tracking-tight leading-none mb-1">
                    {formatWeight(data.net)}
                </span>
                
                {renderDifference()}
            </div>
        </div>
    </section>
  );
};

export default WeightCard;