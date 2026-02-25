import React, { useState } from 'react';
import { TrendingDown, TrendingUp, CheckCircle, X } from 'lucide-react';
import { PlanStatus } from '../types';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjust: (status: PlanStatus) => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose, onAdjust }) => {
  const [selected, setSelected] = useState<PlanStatus | null>(null);

  if (!isOpen) return null;

  const handleSelect = (status: PlanStatus) => {
    setSelected(status);
    setTimeout(() => {
        onAdjust(status);
        onClose();
        setSelected(null);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md glass-modal rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
        
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-semibold text-white tracking-tight">Ajuste de Rota</h2>
                <p className="text-white/40 text-sm font-medium">Como está sua execução?</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                <X size={20} className="text-white/60" />
            </button>
        </div>

        <div className="flex flex-col gap-3 mb-6">
            {/* Abaixo do Plano */}
            <button 
                onClick={() => handleSelect('below')}
                className={`group relative flex items-center p-5 rounded-3xl border transition-all duration-200 active:scale-[0.98]
                    ${selected === 'below' ? 'bg-white/10 border-white/20' : 'bg-[#2C2C2E] border-white/5 hover:border-white/10'}
                `}
            >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/40 group-hover:bg-white/10 transition-colors">
                    <TrendingDown size={28} />
                </div>
                <div className="ml-4 flex flex-col items-start">
                    <span className="text-lg font-bold text-white/90">Estourou</span>
                    <span className="text-sm font-medium text-white/40">Gastei mais que o planejado</span>
                </div>
            </button>

            {/* No Caminho */}
            <button 
                onClick={() => handleSelect('onTrack')}
                className={`group relative flex items-center p-5 rounded-3xl border transition-all duration-200 active:scale-[0.98]
                    ${selected === 'onTrack' ? 'bg-sage border-sage' : 'bg-[#2C2C2E] border-white/5 hover:border-sage/30'}
                `}
            >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors
                    ${selected === 'onTrack' ? 'bg-black/10 text-black/60' : 'bg-sage/10 text-sage'}
                `}>
                    <CheckCircle size={28} />
                </div>
                <div className="ml-4 flex flex-col items-start">
                    <span className={`text-lg font-bold ${selected === 'onTrack' ? 'text-[#121212]' : 'text-white/90'}`}>No Caminho</span>
                    <span className={`text-sm font-medium ${selected === 'onTrack' ? 'text-[#121212]/60' : 'text-white/40'}`}>Seguindo o plano</span>
                </div>
            </button>

             {/* Acima do Plano (Economia) */}
             <button 
                onClick={() => handleSelect('above')}
                className={`group relative flex items-center p-5 rounded-3xl border transition-all duration-200 active:scale-[0.98]
                    ${selected === 'above' ? 'bg-gold border-gold' : 'bg-[#2C2C2E] border-white/5 hover:border-gold/30'}
                `}
            >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors
                    ${selected === 'above' ? 'bg-black/10 text-black/60' : 'bg-gold/10 text-gold'}
                `}>
                    <TrendingUp size={28} />
                </div>
                <div className="ml-4 flex flex-col items-start">
                    <span className={`text-lg font-bold ${selected === 'above' ? 'text-[#121212]' : 'text-white/90'}`}>Sobrou Dinheiro</span>
                    <span className={`text-sm font-medium ${selected === 'above' ? 'text-[#121212]/60' : 'text-white/40'}`}>Gastei menos que o planejado</span>
                </div>
            </button>
        </div>
      </div>
    </div>
  );
};