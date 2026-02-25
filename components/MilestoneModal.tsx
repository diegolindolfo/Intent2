import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import { Milestone } from '../types';
import { AppearanceSelector } from './AppearanceSelector';

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Milestone | null;
  onSave: (milestone: Omit<Milestone, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({ isOpen, onClose, initialData, onSave, onDelete }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [icon, setIcon] = useState('ShieldCheck');
  const [color, setColor] = useState('gold');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setTargetAmount(initialData.targetAmount.toString());
        setCurrentAmount(initialData.currentAmount.toString());
        setIcon(initialData.icon);
        setColor(initialData.color);
      } else {
        setName('');
        setTargetAmount('');
        setCurrentAmount('');
        setIcon('ShieldCheck');
        setColor('gold');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id,
      name,
      targetAmount: parseFloat(targetAmount) || 0,
      currentAmount: parseFloat(currentAmount) || 0,
      icon,
      color: color as any
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-sm glass-modal rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">{initialData ? 'Editar Meta' : 'Nova Meta'}</h3>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
            <X size={20} className="text-white/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Nome */}
          <div>
            <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-medium">Nome da Meta</label>
            <input 
              type="text" 
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-sage transition-colors placeholder-white/20"
              placeholder="Ex: Viagem 2026"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Valor Alvo */}
            <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-medium">Meta Total</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">R$</span>
                    <input 
                    type="number" 
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-3 text-white focus:outline-none focus:border-sage transition-colors placeholder-white/20 text-sm"
                    placeholder="0"
                    />
                </div>
            </div>

            {/* Valor Atual */}
            <div>
                <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-medium">Guardado</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">R$</span>
                    <input 
                    type="number" 
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-3 text-white focus:outline-none focus:border-sage transition-colors placeholder-white/20 text-sm"
                    placeholder="0"
                    />
                </div>
            </div>
          </div>

          <div className="border-t border-white/10 my-1"></div>
          
          <AppearanceSelector 
            selectedIcon={icon}
            selectedColor={color}
            onIconChange={setIcon}
            onColorChange={setColor}
          />

          <div className="flex gap-3 mt-4">
            {initialData && onDelete && (
                 <button 
                 type="button"
                 onClick={() => { onDelete(initialData.id); onClose(); }}
                 className="flex-1 bg-red-500/10 text-red-400 font-bold py-4 rounded-xl flex items-center justify-center hover:bg-red-500/20 transition-colors"
               >
                 <Trash2 size={20} />
               </button>
            )}
            <button 
                type="submit"
                className="flex-[3] bg-sage text-[#121212] font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-sage/90 transition-colors active:scale-95"
            >
                <Check size={20} />
                Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};