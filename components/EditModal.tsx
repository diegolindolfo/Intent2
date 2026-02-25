import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Calculator, Plus, Settings } from 'lucide-react';
import { Category } from '../types';
import { AppearanceSelector } from './AppearanceSelector';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialValue: number;
  onSave: (value: number) => void;
  category?: Category;
  onUpdateMeta?: (updates: Partial<Category>) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  initialValue, 
  onSave, 
  category, 
  onUpdateMeta 
}) => {
  const [inputValue, setInputValue] = useState(initialValue.toString());
  const [calculatedPreview, setCalculatedPreview] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'value' | 'appearance'>('value');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(initialValue === 0 ? '' : initialValue.toString());
      setCalculatedPreview(null);
      setViewMode('value');
      // Focar no input após abrir
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialValue]);

  const calculateExpression = (expression: string): number => {
    try {
      const sanitized = expression.replace(/[^0-9.+,]/g, '').replace(',', '.');
      if (!sanitized) return 0;
      
      const parts = sanitized.split('+');
      const sum = parts.reduce((acc, part) => {
        const num = parseFloat(part);
        return acc + (isNaN(num) ? 0 : num);
      }, 0);
      
      return sum;
    } catch (e) {
      return 0;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (val.includes('+')) {
      setCalculatedPreview(calculateExpression(val));
    } else {
      setCalculatedPreview(null);
    }
  };

  const handleAddOperator = (op: string) => {
    setInputValue(prev => prev + op);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalValue = calculateExpression(inputValue);
    onSave(finalValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-sm glass-modal rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            {category && onUpdateMeta && (
                <button 
                    type="button"
                    onClick={() => setViewMode(prev => prev === 'value' ? 'appearance' : 'value')}
                    className={`p-1.5 rounded-full transition-colors ${viewMode === 'appearance' ? 'bg-sage text-[#121212]' : 'bg-white/5 text-white/40 hover:text-white'}`}
                >
                    <Settings size={14} />
                </button>
            )}
          </div>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
            <X size={20} className="text-white/60" />
          </button>
        </div>

        {viewMode === 'value' ? (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="flex justify-between text-white/40 text-xs uppercase tracking-widest mb-2 font-medium">
                  <span>Valor ou Soma</span>
                  {calculatedPreview !== null && (
                    <span className="text-sage flex items-center gap-1">
                      <Calculator size={12} /> = R$ {calculatedPreview}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-white/40 text-2xl font-light">R$</span>
                  <input 
                    ref={inputRef}
                    type="text" 
                    inputMode="decimal" 
                    value={inputValue}
                    onChange={handleChange}
                    className="w-full bg-transparent border-b border-white/20 text-4xl font-bold text-white py-2 pl-10 focus:outline-none focus:border-sage transition-colors placeholder-white/10"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Barra de Ferramentas Auxiliar */}
              <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
                <button 
                    type="button"
                    onClick={() => handleAddOperator('+')}
                    className="flex items-center gap-1 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-white hover:bg-sage/20 hover:border-sage/50 transition-colors active:scale-95"
                >
                    <Plus size={16} /> 
                    <span className="text-sm font-medium">Somar</span>
                </button>
                 <button 
                    type="button"
                    onClick={() => handleAddOperator('00')}
                    className="flex items-center gap-1 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-white hover:bg-white/10 transition-colors active:scale-95"
                >
                    <span className="text-sm font-medium">+00</span>
                </button>
              </div>

              <button 
                type="submit"
                className="w-full bg-sage text-[#121212] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-sage/90 transition-colors active:scale-95"
              >
                <Check size={20} />
                Confirmar
              </button>
            </form>
        ) : (
             <div className="flex flex-col gap-4">
                {category && onUpdateMeta && (
                    <AppearanceSelector 
                        selectedIcon={category.icon}
                        selectedColor={category.color}
                        onIconChange={(icon) => onUpdateMeta({ icon })}
                        onColorChange={(color) => onUpdateMeta({ color: color as any })}
                    />
                )}
                <button 
                    type="button"
                    onClick={() => setViewMode('value')}
                    className="w-full bg-white/10 text-white font-bold py-3 rounded-xl hover:bg-white/20 transition-colors mt-2"
                >
                    Voltar
                </button>
             </div>
        )}
      </div>
    </div>
  );
};