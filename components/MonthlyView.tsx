import React, { useState } from 'react';
import { Wallet, Box, Plus, X, Copy } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { MonthlyData, Category } from '../types';
import { EditModal } from './EditModal';
import { iconMap } from '../utils/icons';

interface MonthlyViewProps {
  data: MonthlyData;
  onUpdateIncome: (val: number) => void;
  onUpdateCategory: (id: string, val: number) => void;
  onUpdateCategoryMeta?: (id: string, updates: Partial<Category>) => void;
  onQuickClone: () => void;
}

export const MonthlyView: React.FC<MonthlyViewProps> = ({ 
  data, 
  onUpdateIncome, 
  onUpdateCategory, 
  onUpdateCategoryMeta,
  onQuickClone 
}) => {
  const [editingItem, setEditingItem] = useState<{ type: 'income' | 'category', id?: string, currentVal: number, name: string, category?: Category } | null>(null);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const totalAllocated = data.categories.reduce((acc, cat) => acc + cat.plannedAmount, 0);
  const remaining = data.income - totalAllocated;

  // Filtrar categorias ativas (valor > 0)
  const activeCategories = data.categories.filter(cat => cat.plannedAmount > 0);
  const inactiveCategories = data.categories.filter(cat => cat.plannedAmount === 0);

  const handleEditIncome = () => {
    setEditingItem({ type: 'income', currentVal: data.income, name: 'Renda Mensal' });
  };

  const handleEditCategory = (cat: Category) => {
    setEditingItem({ 
        type: 'category', 
        id: cat.id, 
        currentVal: cat.plannedAmount, 
        name: cat.name,
        category: cat 
    });
  };

  const handleActivateCategory = (cat: Category) => {
    // Abre o editor diretamente ao ativar
    setEditingItem({ 
        type: 'category', 
        id: cat.id, 
        currentVal: 0, 
        name: cat.name,
        category: cat
    });
    setIsAddCategoryOpen(false);
  };

  const handleSaveEdit = (val: number) => {
    if (editingItem?.type === 'income') {
      onUpdateIncome(val);
    } else if (editingItem?.type === 'category' && editingItem.id) {
      onUpdateCategory(editingItem.id, val);
    }
    setEditingItem(null);
  };

  const handleMetaUpdate = (updates: Partial<Category>) => {
    if (editingItem?.id && onUpdateCategoryMeta) {
        onUpdateCategoryMeta(editingItem.id, updates);
        // Atualiza estado local do modal para refletir mudanças instantaneamente se necessário
        if (editingItem.category) {
             setEditingItem(prev => prev ? { ...prev, category: { ...prev.category!, ...updates } } : null);
        }
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24">
      
      {/* Edit Modal */}
      <EditModal 
        isOpen={!!editingItem} 
        onClose={() => setEditingItem(null)} 
        title={editingItem?.name || ''} 
        initialValue={editingItem?.currentVal || 0}
        onSave={handleSaveEdit}
        category={editingItem?.category}
        onUpdateMeta={onUpdateCategoryMeta ? handleMetaUpdate : undefined}
      />

      {/* Add Category Selection Modal */}
      {isAddCategoryOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsAddCategoryOpen(false)} />
            <div className="relative w-full max-w-sm glass-modal rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 border border-white/10 max-h-[80vh] overflow-y-auto no-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-white">Adicionar Categoria</h3>
                    <button onClick={() => setIsAddCategoryOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                        <X size={20} className="text-white/60" />
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {inactiveCategories.length > 0 ? (
                        inactiveCategories.map(cat => {
                            const Icon = iconMap[cat.icon] || Box;
                            return (
                                <button 
                                    key={cat.id}
                                    onClick={() => handleActivateCategory(cat)}
                                    className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-[#2C2C2E] border border-white/5 hover:border-sage/50 hover:bg-white/10 transition-all active:scale-95"
                                >
                                    <div className={`text-${cat.color}`}>
                                        <Icon size={24} />
                                    </div>
                                    <span className="text-sm font-medium text-white/80">{cat.name}</span>
                                </button>
                            );
                        })
                    ) : (
                        <p className="col-span-2 text-center text-white/40 text-sm py-4">Todas as categorias já estão em uso.</p>
                    )}
                </div>
            </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        
        {/* Income Card - Large */}
        <GlassCard 
          onClick={handleEditIncome}
          className="col-span-2 relative overflow-hidden min-h-[160px] flex flex-col justify-between group cursor-pointer border-dashed border border-white/10 hover:border-sage/50 animate-in fade-in slide-in-from-bottom-8 duration-700"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-sage/10 rounded-full blur-3xl pointer-events-none group-hover:bg-sage/20 transition-all duration-700"></div>
          
          <div className="flex justify-between items-start z-10">
            <div className="flex flex-col gap-1">
              <span className="text-white/50 text-xs font-medium tracking-wide uppercase">Renda Planejada</span>
              {data.income === 0 ? (
                <span className="text-white/30 text-2xl font-medium italic mt-1">Toque para definir</span>
              ) : (
                <h3 className="text-white text-4xl font-bold tracking-tight">{formatCurrency(data.income)}</h3>
              )}
            </div>
            <div className="bg-white/5 p-3 rounded-full border border-white/5">
              <Wallet className="text-sage" size={24} />
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between z-10">
            <div>
              <p className="text-white/40 text-xs">Defina o teto do seu mês</p>
            </div>
            {data.income > 0 && (
                <div className="flex gap-1 items-end h-8 opacity-80">
                    <div className="w-1 bg-sage/30 h-[40%] rounded-sm"></div>
                    <div className="w-1 bg-sage/50 h-[60%] rounded-sm"></div>
                    <div className="w-1 bg-sage h-[80%] rounded-sm"></div>
                </div>
            )}
          </div>
        </GlassCard>

        {/* Dynamic Categories Grid - Only Active */}
        {activeCategories.map((cat, index) => {
          const Icon = iconMap[cat.icon] || Box;
          const percentage = data.income > 0 ? (cat.plannedAmount / data.income) * 100 : 0;
          
          // Investimentos ou se for o único/último item para alinhar
          const isFullWidth = cat.id === 'investments' || (index === activeCategories.length - 1 && activeCategories.length % 2 !== 0); 
          const isInvestment = cat.id === 'investments';

          return (
            <GlassCard 
              key={cat.id} 
              onClick={() => handleEditCategory(cat)}
              delay={(index + 1) * 100}
              className={`${isFullWidth ? 'col-span-2 flex-row items-center justify-between gap-4' : 'col-span-1 flex-col justify-between h-40'} flex hover:border-${cat.color}/40 animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-both`}
            >
                {isFullWidth ? (
                   <>
                     <div className="flex items-center gap-4">
                        <div className="bg-[#2C2C2E] p-3 rounded-2xl h-12 w-12 flex items-center justify-center shrink-0">
                            <Icon className={`text-${cat.color}`} size={24} />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-white/60 text-xs font-medium">{cat.name}</p>
                            <p className="text-white text-xl font-bold tracking-tight">{formatCurrency(cat.plannedAmount)}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 min-w-[100px]">
                        <span className={`text-${cat.color} text-sm font-semibold`}>{percentage.toFixed(0)}%</span>
                        <div className="w-24 bg-white/10 rounded-full h-1.5 overflow-hidden">
                            <div className={`bg-${cat.color} h-full rounded-full ${isInvestment ? 'animate-pulse' : ''}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                    </div>
                   </>
                ) : (
                    <>
                        <div className="flex justify-between items-start">
                            <div className="bg-[#2C2C2E] p-2 rounded-2xl">
                                <Icon className={`text-${cat.color === 'white' ? 'white' : cat.color}`} size={20} />
                            </div>
                            <span className="text-white/40 text-xs font-semibold">{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div>
                                <p className="text-white/60 text-xs font-medium mb-1 truncate">{cat.name}</p>
                                <p className="text-white text-lg font-bold tracking-tight">{formatCurrency(cat.plannedAmount)}</p>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                <div className={`bg-${cat.color === 'white' ? 'white' : cat.color} h-full rounded-full`} style={{ width: `${percentage}%` }}></div>
                            </div>
                        </div>
                    </>
                )}
            </GlassCard>
          );
        })}

        {/* Add Category Button */}
        <button 
            onClick={() => setIsAddCategoryOpen(true)}
            className="col-span-2 flex items-center justify-center gap-2 p-4 border border-dashed border-white/10 rounded-3xl text-white/40 hover:text-white/80 hover:bg-white/5 transition-all active:scale-[0.98] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-both"
        >
            <Plus size={20} />
            <span className="text-sm font-medium">Adicionar Categoria</span>
        </button>

        {/* Unallocated / Remaining */}
        <div className="col-span-2 px-2 py-2 flex justify-between items-center bg-white/5 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
            <p className="text-xs text-white/50 uppercase tracking-widest pl-2">Intenção Livre</p>
            <p className={`text-sm font-bold pr-2 ${remaining < 0 ? 'text-red-400' : 'text-sage'}`}>
                {remaining < 0 ? 'Excedido em ' : ''}{formatCurrency(Math.abs(remaining))} {remaining >= 0 ? 'restante' : ''}
            </p>
        </div>

      </div>

      {/* Floating Action Button for Clone */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-30 px-6 pointer-events-none animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-700 fill-mode-both">
        <button 
            onClick={onQuickClone}
            className="pointer-events-auto bg-sage text-[#121212] w-full max-w-sm h-14 rounded-full shadow-[0_8px_32px_rgba(125,161,134,0.3)] flex items-center justify-center gap-3 group active:scale-95 transition-transform hover:bg-sage/90"
        >
            <Copy size={20} className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-bold text-base tracking-wide">Repetir Mês Anterior</span>
        </button>
      </div>
    </div>
  );
};