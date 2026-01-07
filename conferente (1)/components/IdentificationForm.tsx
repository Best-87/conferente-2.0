import React, { useState } from 'react';
import { IdentificationData } from '../types';

interface Props {
  data: IdentificationData;
  onChange: (data: IdentificationData) => void;
  onSupplierBlur?: () => void;
  onProductBlur?: () => void;
}

interface InputFieldProps {
    label: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon: string;
    id: string;
    type?: string;
    placeholder?: string;
    inputMode?: "text" | "search" | "none" | "tel" | "url" | "email" | "numeric" | "decimal";
    onBlur?: () => void;
    activeField: string | null;
    setActiveField: (id: string | null) => void;
}

// Helper component extracted outside to prevent re-mounting on every render
const InputField: React.FC<InputFieldProps> = ({ 
    label, 
    value, 
    onChange, 
    icon, 
    id, 
    type = 'text', 
    placeholder, 
    inputMode, 
    onBlur,
    activeField,
    setActiveField
  }) => {
    const isActive = activeField === id;
    const hasValue = value !== undefined && value !== null && value.toString().length > 0;
    
    return (
        <div 
            className={`
                relative flex items-center bg-surface-container-high rounded-xl px-3 py-2 transition-all duration-200
                ${isActive ? 'ring-2 ring-primary bg-surface-container' : 'hover:bg-surface-container-high/80'}
            `}
        >
            <span className={`material-symbols-rounded text-[20px] mr-3 transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant'}`}>
                {icon}
            </span>
            
            <div className="flex-1 relative h-9 flex flex-col justify-center">
                <label 
                    className={`
                        absolute left-0 transition-all duration-200 pointer-events-none font-medium
                        ${(isActive || hasValue) ? 'top-0 text-[10px] text-primary' : 'top-1/2 -translate-y-1/2 text-sm text-on-surface-variant/80'}
                    `}
                >
                    {label}
                </label>
                <input 
                    className={`
                        w-full bg-transparent border-0 p-0 text-sm font-semibold text-on-surface focus:ring-0 placeholder-transparent
                        ${(isActive || hasValue) ? 'translate-y-2' : ''}
                    `}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setActiveField(id)}
                    onBlur={() => { setActiveField(null); onBlur && onBlur(); }}
                    inputMode={inputMode}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
};

const IdentificationForm: React.FC<Props> = ({ data, onChange, onSupplierBlur, onProductBlur }) => {
  const [activeField, setActiveField] = useState<string | null>(null);

  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, supplier: e.target.value });
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...data, product: e.target.value });
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      // Regex to allow typing decimal numbers (e.g., 10.50)
      // Allow empty string or match number pattern
      if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
        onChange({ ...data, targetWeight: val });
      }
  };

  return (
    <section className="flex flex-col gap-2">
        <InputField 
            id="supplier"
            label="Fornecedor"
            icon="local_shipping"
            value={data.supplier}
            onChange={handleSupplierChange}
            onBlur={onSupplierBlur}
            placeholder="Fornecedor"
            activeField={activeField}
            setActiveField={setActiveField}
        />
        
        <InputField 
            id="product"
            label="Produto"
            icon="category"
            value={data.product}
            onChange={handleProductChange}
            onBlur={onProductBlur}
            placeholder="Produto"
            activeField={activeField}
            setActiveField={setActiveField}
        />

        <InputField 
            id="target"
            label="Peso da Nota"
            icon="receipt_long"
            type="number"
            inputMode="decimal"
            value={data.targetWeight}
            onChange={handleTargetChange}
            placeholder="0.00"
            activeField={activeField}
            setActiveField={setActiveField}
        />
    </section>
  );
};

export default IdentificationForm;