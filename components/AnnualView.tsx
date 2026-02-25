import React, { useState } from 'react';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { Plus, ShieldCheck, Box } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { MonthlyData, Milestone, YearData } from '../types';
import { MilestoneModal } from './MilestoneModal';
import { iconMap } from '../utils/icons';

interface AnnualViewProps {
  currentMonthData: MonthlyData;
  fullFinancialData: YearData;
  currentYear: number;
  milestones: Milestone[];
  onAddMilestone: (m: Omit<Milestone, 'id'>) => void;
  onEditMilestone: (m: Milestone) => void;
  onDeleteMilestone: (id: string) => void;
}

export const AnnualView: React.FC<AnnualViewProps> = ({ 
  currentMonthData, 
  fullFinancialData,
  currentYear,
  milestones, 
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone
}) => {
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null | 'new'>(null);

  // Calculate historical savings (before current year)
  const historicalSavings = Object.entries(fullFinancialData).reduce((acc, [key, data]) => {
    const [yearStr] = key.split('-');
    const year = parseInt(yearStr);
    if (year < currentYear) {
      const expenses = data.categories.reduce((sum, cat) => {
        const isInvestment = cat.id === 'investments' || cat.id.startsWith('cat_meta_');
        return !isInvestment ? sum + cat.plannedAmount : sum;
      }, 0);
      return acc + (data.income - expenses);
    }
    return acc;
  }, 0);

  const baseStartValue = milestones.reduce((acc, m) => acc + m.initialAmount, 0) + historicalSavings;

  const currentMonthExpenses = currentMonthData.categories.reduce((acc, cat) => {
      const isInvestment = cat.id === 'investments' || cat.id.startsWith('cat_meta_');
      return !isInvestment ? acc + cat.plannedAmount : acc;
  }, 0);
  const baselineSavings = currentMonthData.income - currentMonthExpenses;

  let currentAccumulated = baseStartValue;
  
  const projectionData = Array.from({ length: 12 }, (_, i) => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthKey = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
    const data = fullFinancialData[monthKey];
    
    let monthlySavings = baselineSavings;
    if (data) {
        const expenses = data.categories.reduce((acc, cat) => {
            const isInvestment = cat.id === 'investments' || cat.id.startsWith('cat_meta_');
            return !isInvestment ? acc + cat.plannedAmount : acc;
        }, 0);
        monthlySavings = data.income - expenses;
    }

    currentAccumulated += monthlySavings;

    return {
      month: monthNames[i],
      value: currentAccumulated
    };
  });

  const finalAmount = projectionData[11]?.value || baseStartValue;
  const growth = baseStartValue > 0 ? ((finalAmount - baseStartValue) / baseStartValue) * 100 : 0;

  const milestonesWithProgress = milestones.map(m => {
      const accumulatedFromMonths = Object.values(fullFinancialData).reduce((acc, data) => {
          const cat = data.categories.find(c => c.id === `cat_meta_${m.id}`);
          return acc + (cat ? cat.plannedAmount : 0);
      }, 0);
      
      const currentAmount = m.initialAmount + accumulatedFromMonths;
      
      const currentMonthCat = currentMonthData.categories.find(c => c.id === `cat_meta_${m.id}`);
      const monthlyRate = currentMonthCat ? currentMonthCat.plannedAmount : 0;
      
      let monthsToReach = -1;
      if (m.targetAmount > currentAmount && monthlyRate > 0) {
          monthsToReach = Math.ceil((m.targetAmount - currentAmount) / monthlyRate);
      }

      return {
          ...m,
          currentAmount,
          monthsToReach
      };
  });

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const handleSaveMilestone = (data: Omit<Milestone, 'id'> & { id?: string }) => {
    if (data.id) {
        onEditMilestone(data as Milestone);
    } else {
        onAddMilestone(data);
    }
    setEditingMilestone(null);
  };

  const annualBudget = Array.from({ length: 12 }, (_, i) => {
    const monthKey = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
    const data = fullFinancialData[monthKey];
    
    if (!data) return { month: i, income: 0, expenses: 0, savings: 0, isEmpty: true };

    const expenses = data.categories.reduce((acc, cat) => {
        const isInvestment = cat.id === 'investments' || cat.id.startsWith('cat_meta_');
        return !isInvestment ? acc + cat.plannedAmount : acc;
    }, 0);
    
    const savings = (data.income - expenses); 

    return {
        month: i,
        income: data.income,
        expenses: expenses,
        savings: savings,
        isEmpty: false
    };
  });

  const monthNamesFull = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const getBarColor = (color: string) => {
    switch (color) {
      case 'gold': return 'bg-gold';
      case 'white': return 'bg-white';
      default: return 'bg-sage';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-500 pb-24">
      
      <MilestoneModal 
        isOpen={!!editingMilestone}
        onClose={() => setEditingMilestone(null)}
        initialData={editingMilestone === 'new' ? null : editingMilestone}
        onSave={handleSaveMilestone}
        onDelete={onDeleteMilestone}
      />

      {/* Chart Section */}
      <GlassCard className="p-0 overflow-hidden relative min-h-[300px] flex flex-col">
        <div className="p-6 relative z-10">
          <p className="text-white/60 text-sm font-medium mb-1">Patrimônio Projetado ({currentYear})</p>
          <h2 className="text-4xl font-bold tracking-tight text-white">{formatCurrency(finalAmount)}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gold-dim text-gold border border-gold/20">
              +{growth.toFixed(1)}% Crescimento
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData}>
                <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C0A769" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C0A769" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <YAxis hide domain={['dataMin', 'dataMax']} />
                <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#C0A769" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                />
            </AreaChart>
            </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Milestones Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-lg font-bold text-white tracking-tight">Metas Ativas</h3>
        <button 
            onClick={() => setEditingMilestone('new')}
            className="flex items-center gap-1 text-xs font-bold text-[#121212] bg-sage px-3 py-1.5 rounded-full hover:bg-sage/90 transition-colors"
        >
            <Plus size={14} /> Nova Meta
        </button>
      </div>

      {/* Milestones List */}
      <div className="grid gap-3">
        {milestonesWithProgress.length === 0 && (
            <div className="text-center py-8 text-white/30 text-sm">Nenhuma meta cadastrada.</div>
        )}

        {milestonesWithProgress.map((milestone, index) => {
            const progress = milestone.targetAmount > 0 ? (milestone.currentAmount / milestone.targetAmount) * 100 : 0;
            const Icon = iconMap[milestone.icon] || ShieldCheck;

            return (
                <GlassCard 
                    key={milestone.id} 
                    className="p-5 flex flex-col gap-4 group cursor-pointer hover:bg-white/10" 
                    delay={index * 100}
                    onClick={() => setEditingMilestone(milestone)}
                >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-surface border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <Icon size={20} />
                            </div>
                            <div>
                                <h4 className="text-base font-semibold text-white">{milestone.name}</h4>
                                <span className="text-xs text-white/50">Meta: {formatCurrency(milestone.targetAmount)}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-white">{formatCurrency(milestone.currentAmount)}</p>
                            <p className="text-[10px] text-sage">
                                {progress >= 100 
                                    ? 'Completa' 
                                    : milestone.monthsToReach > 0 
                                        ? `Faltam ~${milestone.monthsToReach} meses` 
                                        : 'Em andamento'}
                            </p>
                        </div>
                    </div>
                    <div className="relative h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                        <div className={`absolute top-0 left-0 h-full ${getBarColor(milestone.color)} rounded-full`} style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                </GlassCard>
            );
        })}
      </div>

       {/* Detalhamento Anual (Tabela) */}
       <div className="mt-4">
        <div className="flex items-center justify-between px-1 mb-3">
            <h3 className="text-lg font-bold text-white tracking-tight">Detalhamento Anual</h3>
        </div>
        
        <GlassCard className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-white/5 text-xs text-white/40 uppercase tracking-wider">
                        <tr>
                            <th className="py-4 pl-6 font-medium">Mês</th>
                            <th className="py-4 px-2 font-medium text-right">Receita</th>
                            <th className="py-4 px-2 font-medium text-right">Despesa</th>
                            <th className="py-4 pr-6 font-medium text-right">Saldo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {annualBudget.map((item, i) => (
                            <tr key={i} className="group hover:bg-white/5 transition-colors">
                                <td className="py-3 pl-6 font-medium text-white/90">
                                    {monthNamesFull[item.month]}
                                    {item.isEmpty && <span className="ml-2 text-[10px] text-white/20 italic font-normal">--</span>}
                                </td>
                                <td className="py-3 px-2 text-right text-white/60 font-mono">
                                    {item.isEmpty ? '-' : formatCurrency(item.income)}
                                </td>
                                <td className="py-3 px-2 text-right text-white/60 font-mono">
                                    {item.isEmpty ? '-' : formatCurrency(item.expenses)}
                                </td>
                                <td className={`py-3 pr-6 text-right font-bold font-mono ${item.savings >= 0 ? 'text-sage' : 'text-red-400'}`}>
                                    {item.isEmpty ? '-' : formatCurrency(item.savings)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Totais do Ano */}
            <div className="bg-white/5 border-t border-white/10 p-4 flex justify-between items-center text-sm">
                <span className="text-white/40 font-medium pl-2">Economia no Ano</span>
                <span className="text-white font-bold pr-2 text-lg">
                    {formatCurrency(annualBudget.reduce((acc, curr) => acc + curr.savings, 0))}
                </span>
            </div>
        </GlassCard>
      </div>
    </div>
  );
};