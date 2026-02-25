import React from 'react';
import { ChevronDown, Calendar, Grid, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  financialStatus: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  setView, 
  currentDate, 
  onPrevMonth, 
  onNextMonth,
  financialStatus
}) => {
  // Formatação de data em PT-BR
  const formattedMonth = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(currentDate);
  const formattedYear = currentDate.getFullYear();
  const capitalizedMonth = formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1);

  return (
    <header className="sticky top-0 z-40 bg-[#121212]/80 backdrop-blur-md pt-6 pb-2 px-6 border-b border-white/5">
      <div className="flex items-center justify-between mb-2">
        {/* Alternar Visualização */}
        <button 
          onClick={() => setView(currentView === 'monthly' ? 'annual' : 'monthly')}
          className="flex items-center justify-center size-10 rounded-full hover:bg-white/5 transition text-white/60"
          title={currentView === 'monthly' ? "Ir para Visão Anual" : "Ir para Visão Mensal"}
        >
          {currentView === 'monthly' ? <Calendar size={20} /> : <Grid size={20} />}
        </button>

        {/* Seletor de Mês/Ano */}
        <div className="flex items-center bg-white/5 rounded-full px-2">
          <button onClick={onPrevMonth} className="p-2 hover:text-sage transition text-white/40">
            <ChevronLeft size={16} />
          </button>
          
          <div className="flex items-center gap-2 px-2 py-2">
            <span className="text-lg font-semibold tracking-tight text-white min-w-[140px] text-center">
              {currentView === 'monthly' ? `${capitalizedMonth} ${formattedYear}` : `Projeção ${formattedYear}`}
            </span>
          </div>

          <button onClick={onNextMonth} className="p-2 hover:text-sage transition text-white/40">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Placeholder (pode ser Perfil) */}
        <div className="size-10 rounded-full bg-gradient-to-tr from-sage to-transparent opacity-50"></div>
      </div>

      {/* Status de Intenção com Tooltip */}
      <div className="text-center pb-2 relative z-50">
        <div className="group relative inline-flex items-center justify-center cursor-help">
            <p className="text-white/60 text-xs font-medium tracking-wide animate-fade-in uppercase">
                {financialStatus}
            </p>
            
            {/* Tooltip */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-4 py-3 bg-[#1C1C1E] border border-white/10 rounded-xl text-xs text-white/80 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none w-56 shadow-2xl backdrop-blur-xl translate-y-1 group-hover:translate-y-0">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1C1C1E] border-t border-l border-white/10 rotate-45"></div>
                <p className="leading-relaxed text-center">
                    Isso indica a proporção da sua renda que já foi destinada a despesas e investimentos. Mantenha abaixo de 100% para ter margem de manobra.
                </p>
            </div>
        </div>
      </div>
    </header>
  );
};