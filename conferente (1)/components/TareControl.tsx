import React, { useState, useEffect } from 'react';
import { TareMode } from '../types';

interface Props {
  mode: TareMode;
  onChange: (mode: TareMode) => void;
  onResetTare: () => void;
  
  // Product Tare
  onTareChange?: (value: number) => void;
  currentTare: number; 
  quantity: number;
  onQuantityChange: (qty: number) => void;

  // Packaging Tare
  packagingUnitWeight: number; // Stored in KG
  onPackagingUnitWeightChange: (val: number) => void;
  packagingQuantity: number;
  onPackagingQuantityChange: (val: number) => void;
}

const TareControl: React.FC<Props> = ({ 
  mode, 
  onChange, 
  onResetTare, 
  onTareChange, 
  currentTare,
  quantity,
  onQuantityChange,
  packagingUnitWeight,
  onPackagingUnitWeightChange,
  packagingQuantity,
  onPackagingQuantityChange
}) => {
  const [localUnitTareStr, setLocalUnitTareStr] = useState(currentTare > 0 ? (currentTare * 1000).toString() : '');

  useEffect(() => {
    const parsedCurrentGrams = parseMultiValueAverage(localUnitTareStr);
    const externalCurrentGrams = currentTare * 1000;

    if (Math.abs(parsedCurrentGrams - externalCurrentGrams) > 0.1) {
        setLocalUnitTareStr(currentTare === 0 ? '' : parseFloat((currentTare * 1000).toFixed(1)).toString());
    }
  }, [currentTare]);

  const parseMultiValueAverage = (str: string): number => {
      if (!str) return 0;
      let cleanStr = str.replace(/,/g, '.').replace(/\+/g, ' ');
      const parts = cleanStr.split(/\s+/).filter(p => p.trim() !== '' && !isNaN(parseFloat(p)));
      if (parts.length === 0) return 0;
      const sum = parts.reduce((acc, part) => acc + parseFloat(part), 0);
      return sum / parts.length;
  };

  const handleUnitTareStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalUnitTareStr(val);
    const avgGrams = parseMultiValueAverage(val);
    if (onTareChange) onTareChange(avgGrams / 1000);
  };

  const handlePkgWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(',', '.');
      const grams = parseFloat(val);
      if (isNaN(grams)) {
          onPackagingUnitWeightChange(0);
      } else {
          onPackagingUnitWeightChange(grams / 1000);
      }
      if (!isNaN(grams) && grams > 0 && (packagingQuantity === 0 || !packagingQuantity)) {
          onPackagingQuantityChange(1);
      }
  };

  const handlePkgQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const valStr = e.target.value;
      if (valStr === '') {
          onPackagingQuantityChange(0);
          return;
      }
      const val = parseInt(valStr);
      if (!isNaN(val)) onPackagingQuantityChange(val);
  };

  const handleProductQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const valStr = e.target.value;
      if (valStr === '') {
          onQuantityChange(0);
          return;
      }
      const val = parseInt(valStr);
      if (!isNaN(val)) onQuantityChange(val);
  };

  const productTotal = currentTare * (quantity || 0);
  const packagingTotal = packagingUnitWeight * (packagingQuantity || 0);
  const totalTareValue = productTotal + packagingTotal;
  
  const isAveraging = localUnitTareStr.trim().split(/[\s+]+/).filter(x => x).length > 1;
  const packagingDisplayValue = packagingUnitWeight > 0 
    ? parseFloat((packagingUnitWeight * 1000).toFixed(1))
    : '';

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
            <h3 className="text-xs font-bold text-on-surface-variant">Controle de Tara</h3>
            {(mode === 'manual' || totalTareValue > 0) && (
                 <p className="text-[10px] font-medium text-primary">
                    Total: <span className="font-bold">{totalTareValue.toFixed(3)}kg</span>
                 </p>
            )}
        </div>
        <button
          onClick={() => {
              onResetTare();
              setLocalUnitTareStr('');
          }}
          disabled={totalTareValue === 0}
          className={`
            flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all
            ${totalTareValue === 0 
              ? 'text-outline/50 bg-surface-container cursor-not-allowed' 
              : 'text-error bg-error-container hover:bg-error-container/80'
            }
          `}
        >
          <span className="material-symbols-rounded text-[14px]">restart_alt</span>
          Zerar
        </button>
      </div>
      
      <div className="flex w-full rounded-full bg-surface-container border border-outline-variant p-0.5">
        {[
            { id: 'auto', label: 'Auto' },
            { id: 'manual', label: 'Manual' },
            { id: 'none', label: 'Zero' }
        ].map((opt) => {
            const isSelected = mode === opt.id;
            return (
                <button
                    key={opt.id}
                    onClick={() => onChange(opt.id as TareMode)}
                    className={`
                        flex-1 flex items-center justify-center rounded-full py-1.5 text-xs font-bold transition-all duration-300
                        ${isSelected 
                            ? 'bg-secondary-container text-on-secondary-container shadow-sm' 
                            : 'text-on-surface-variant hover:bg-surface-container-high'
                        }
                    `}
                >
                    {isSelected && <span className="material-symbols-rounded text-[14px] mr-1">check</span>}
                    {opt.label}
                </button>
            )
        })}
      </div>

      {mode === 'manual' && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300 flex flex-col gap-2 mt-1">
            <div className="flex gap-2">
                <div className="w-[28%] bg-surface-container-high rounded-xl px-3 py-1.5 flex flex-col justify-center border border-transparent focus-within:border-primary/30 transition-colors">
                    <label className="text-[8px] font-bold text-primary uppercase">Qtd Cx</label>
                    <input 
                        className="w-full bg-transparent border-0 p-0 text-base font-bold text-on-surface focus:ring-0" 
                        type="number"
                        min="0"
                        placeholder="0"
                        value={quantity === 0 ? '' : quantity}
                        onChange={handleProductQtyChange}
                    />
                </div>

                <div className="flex-1 bg-surface-container-high rounded-xl px-3 py-1.5 flex flex-col justify-center relative overflow-hidden border border-transparent focus-within:border-primary/30 transition-colors">
                    <label className="flex items-center justify-between text-[8px] font-bold text-primary uppercase">
                        Tara Unitária (gramas)
                        {isAveraging && (
                             <span className="text-[8px] bg-primary/10 px-1 rounded text-primary font-extrabold">Méd: {currentTare.toFixed(3)}kg</span>
                        )}
                    </label>
                    <div className="flex items-center">
                        <input 
                            className="w-full bg-transparent border-0 p-0 text-base font-bold text-on-surface focus:ring-0 placeholder-on-surface-variant/30" 
                            placeholder="Ex: 1500 1600" 
                            type="text"
                            inputMode="decimal"
                            value={localUnitTareStr}
                            onChange={handleUnitTareStringChange}
                        />
                        <span className="text-xs font-medium text-on-surface-variant ml-1">g</span>
                    </div>
                </div>
            </div>
            
             <div className="flex flex-col gap-1.5 bg-tertiary-container/20 rounded-xl p-2.5 border border-tertiary/10">
                <div className="flex items-center justify-between px-0.5">
                    <div className="flex items-center gap-1.5 text-tertiary">
                         <span className="material-symbols-rounded text-[16px]">package_2</span>
                         <span className="text-[9px] font-bold uppercase tracking-wider">Tara Embalagem</span>
                    </div>
                    {packagingTotal > 0 && (
                        <div className="text-[9px] font-bold text-on-tertiary-container bg-tertiary-container px-1.5 py-0.5 rounded">
                            + {packagingTotal.toFixed(3)} kg
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex-1 relative bg-surface-container-low rounded-lg px-2 py-1.5 ring-1 ring-inset ring-transparent focus-within:ring-tertiary/50 transition-all">
                        <label className="text-[7px] font-bold text-tertiary/80 uppercase block mb-0.5">Peso Unit. (gramas)</label>
                        <div className="flex items-baseline">
                            <input 
                                className="w-full bg-transparent border-0 p-0 text-sm font-bold text-on-surface focus:ring-0 placeholder-tertiary/20"
                                placeholder="0"
                                type="number"
                                step="1"
                                inputMode="decimal"
                                value={packagingDisplayValue}
                                onChange={handlePkgWeightChange}
                            />
                            <span className="text-[10px] font-medium text-tertiary/60 ml-1">g</span>
                        </div>
                    </div>

                    <span className="text-tertiary/40 font-medium text-[10px]">X</span>

                    <div className="w-[30%] relative bg-surface-container-low rounded-lg px-2 py-1.5 ring-1 ring-inset ring-transparent focus-within:ring-tertiary/50 transition-all">
                        <label className="text-[7px] font-bold text-tertiary/80 uppercase block mb-0.5 text-center">Qtd</label>
                        <input 
                            className="w-full bg-transparent border-0 p-0 text-sm font-bold text-on-surface focus:ring-0 text-center placeholder-tertiary/20"
                            placeholder="0"
                            type="number"
                            min="0"
                            value={packagingQuantity === 0 ? '' : packagingQuantity}
                            onChange={handlePkgQuantityChange}
                        />
                    </div>
                </div>
            </div>
        </div>
      )}
    </section>
  );
};

export default TareControl;