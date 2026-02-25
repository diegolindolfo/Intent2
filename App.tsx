import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { MonthlyView } from './components/MonthlyView';
import { AnnualView } from './components/AnnualView';
import { CheckInModal } from './components/CheckInModal';
import { EditModal } from './components/EditModal';
import { ViewState, PlanStatus, YearData, MonthlyData, Category, Milestone } from './types';
import { Compass, Download } from 'lucide-react';

const defaultCategories: Category[] = [
  { id: 'fixed', name: 'Gastos Fixos', plannedAmount: 0, icon: 'Zap', color: 'white' },
  { id: 'housing', name: 'Moradia', plannedAmount: 0, icon: 'Home', color: 'blue' },
  { id: 'food', name: 'Alimentação', plannedAmount: 0, icon: 'Coffee', color: 'orange' },
  { id: 'health', name: 'Saúde & Família', plannedAmount: 0, icon: 'HeartPulse', color: 'sage' },
  { id: 'school', name: 'Escola/Educação', plannedAmount: 0, icon: 'Box', color: 'pink' },
  { id: 'transport', name: 'Carro/Transporte', plannedAmount: 0, icon: 'Car', color: 'blue' },
  { id: 'insurance', name: 'Seguros', plannedAmount: 0, icon: 'ShieldCheck', color: 'sage' },
  { id: 'diapers', name: 'Fraldas/Farmácia', plannedAmount: 0, icon: 'ShoppingBag', color: 'cyan' },
  { id: 'therapies', name: 'Terapias', plannedAmount: 0, icon: 'HeartPulse', color: 'purple' },
  { id: 'maintenance', name: 'Manutenção Casa', plannedAmount: 0, icon: 'Home', color: 'white' },
  { id: 'subs', name: 'Assinaturas/TV', plannedAmount: 0, icon: 'Sparkles', color: 'purple' },
  { id: 'leisure', name: 'Lazer', plannedAmount: 0, icon: 'Sparkles', color: 'purple' },
  { id: 'gifts', name: 'Presentes', plannedAmount: 0, icon: 'ShoppingBag', color: 'pink' },
  { id: 'shopping', name: 'Compras', plannedAmount: 0, icon: 'ShoppingBag', color: 'white' },
  { id: 'others', name: 'Outros', plannedAmount: 0, icon: 'Box', color: 'white' },
  { id: 'gym', name: 'Academia', plannedAmount: 150, icon: 'Dumbbell', color: 'cyan' },
  { id: 'investments', name: 'Investimentos', plannedAmount: 0, icon: 'TrendingUp', color: 'gold' },
];

const defaultMilestones: Milestone[] = [
    { id: '1', name: 'Reserva de Emergência', targetAmount: 50000, initialAmount: 0, icon: 'ShieldCheck', color: 'gold' },
    { id: '2', name: 'Viagem 2026', targetAmount: 20000, initialAmount: 0, icon: 'Plane', color: 'sage' }
];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('monthly');
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [checkInStep, setCheckInStep] = useState<{ type: 'surplus' | 'deficit', isOpen: boolean }>({ type: 'surplus', isOpen: false });
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const [financialData, setFinancialData] = useState<YearData>(() => {
    const saved = localStorage.getItem('intent_financialData');
    return saved ? JSON.parse(saved) : {};
  });

  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    const saved = localStorage.getItem('intent_milestones');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old data
      return parsed.map((m: any) => ({
        ...m,
        initialAmount: m.initialAmount !== undefined ? m.initialAmount : (m.currentAmount || 0)
      }));
    }
    return defaultMilestones;
  });

  useEffect(() => {
    localStorage.setItem('intent_financialData', JSON.stringify(financialData));
  }, [financialData]);

  useEffect(() => {
    localStorage.setItem('intent_milestones', JSON.stringify(milestones));
  }, [milestones]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const getMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthKey = getMonthKey(currentDate);
  
  const currentData: MonthlyData = useMemo(() => {
    const baseCategories = [...defaultCategories];
    milestones.forEach(m => {
      if (!baseCategories.find(c => c.id === `cat_meta_${m.id}`)) {
        baseCategories.push({
          id: `cat_meta_${m.id}`,
          name: m.name,
          plannedAmount: 0,
          icon: m.icon || 'TrendingUp',
          color: 'gold'
        });
      }
    });

    if (financialData[currentMonthKey]) {
      const existingData = financialData[currentMonthKey];
      const mergedCategories = [...existingData.categories];
      baseCategories.forEach(bc => {
        if (!mergedCategories.find(c => c.id === bc.id)) {
          mergedCategories.push({ ...bc });
        }
      });
      return { ...existingData, categories: mergedCategories };
    }
    return {
      income: 0,
      categories: JSON.parse(JSON.stringify(baseCategories))
    };
  }, [financialData, currentMonthKey, milestones]);

  const handleAddMilestone = (m: Omit<Milestone, 'id'>) => {
    const newId = Date.now().toString();
    const newMilestone = { ...m, id: newId };
    setMilestones(prev => [...prev, newMilestone]);
  };

  const handleEditMilestone = (m: Milestone) => {
    setMilestones(prev => prev.map(item => item.id === m.id ? m : item));
    setFinancialData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(key => {
            if (newData[key].categories) {
                newData[key].categories = newData[key].categories.map(c => {
                    if (c.id === `cat_meta_${m.id}`) {
                        return { ...c, name: m.name, icon: m.icon };
                    }
                    return c;
                });
            }
        });
        return newData;
    });
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateIncome = (val: number) => {
    setFinancialData(prev => ({
      ...prev,
      [currentMonthKey]: { ...currentData, income: val }
    }));
  };

  const handleUpdateCategory = (id: string, val: number) => {
    setFinancialData(prev => {
      const newData = { ...currentData };
      const catIndex = newData.categories.findIndex(c => c.id === id);
      if (catIndex >= 0) {
        newData.categories[catIndex].plannedAmount = val;
      }
      return { ...prev, [currentMonthKey]: newData };
    });
  };

  const handleUpdateCategoryMeta = (id: string, updates: Partial<Category>) => {
    setFinancialData(prev => {
        const newData = { ...currentData };
        const catIndex = newData.categories.findIndex(c => c.id === id);
        if (catIndex >= 0) {
            newData.categories[catIndex] = { ...newData.categories[catIndex], ...updates };
        }
        return { ...prev, [currentMonthKey]: newData };
    });
  };

  const handleQuickClone = () => {
    const prevDate = new Date(currentDate);
    prevDate.setMonth(currentDate.getMonth() - 1);
    const prevKey = getMonthKey(prevDate);
    if (financialData[prevKey]) {
      setFinancialData(prev => ({
        ...prev,
        [currentMonthKey]: JSON.parse(JSON.stringify(financialData[prevKey]))
      }));
    } else {
      alert("Não há dados do mês anterior para copiar.");
    }
  };

  const handleRouteAdjustment = (status: PlanStatus) => {
    if (status === 'above') {
        setCheckInStep({ type: 'surplus', isOpen: true });
    } else if (status === 'below') {
        setCheckInStep({ type: 'deficit', isOpen: true });
    }
  };

  const handleCheckInValue = (amount: number) => {
    const investmentCat = currentData.categories.find(c => c.id === 'investments');
    if (!investmentCat) return;

    let newVal = investmentCat.plannedAmount;
    if (checkInStep.type === 'surplus') {
        newVal += amount;
    } else {
        newVal -= amount;
        if (newVal < 0) newVal = 0;
    }

    handleUpdateCategory('investments', newVal);
    setCheckInStep({ ...checkInStep, isOpen: false });
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const getFinancialStatus = () => {
    const total = currentData.categories.reduce((acc, c) => acc + c.plannedAmount, 0);
    if (currentData.income === 0) return "Defina sua renda para começar";
    const ratio = (total / currentData.income) * 100;
    
    if (ratio > 100) return "Atenção: Você planejou mais do que ganha.";
    if (ratio < 80) return "Você tem margem para investir mais.";
    return `${ratio.toFixed(0)}% da sua renda está alocada.`;
  };

  const installApp = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') setInstallPrompt(null);
    }
  };

  return (
    <div 
        className="min-h-screen bg-[#121212] font-sans selection:bg-sage selection:text-white flex justify-center overflow-hidden"
        onMouseMove={handleMouseMove}
    >
      <div className="w-full max-w-md relative flex flex-col z-10">
        
        <Header 
          currentView={currentView} 
          setView={setCurrentView} 
          currentDate={currentDate}
          onPrevMonth={() => changeMonth(currentView === 'monthly' ? -1 : -12)}
          onNextMonth={() => changeMonth(currentView === 'monthly' ? 1 : 12)}
          financialStatus={getFinancialStatus()}
        />

        <main className="flex-1 p-6 relative overflow-y-auto no-scrollbar pb-32">
            {currentView === 'monthly' ? (
                <MonthlyView 
                  data={currentData} 
                  onUpdateIncome={handleUpdateIncome}
                  onUpdateCategory={handleUpdateCategory}
                  onUpdateCategoryMeta={handleUpdateCategoryMeta}
                  onQuickClone={handleQuickClone}
                />
            ) : (
                <AnnualView 
                    currentMonthData={currentData} 
                    fullFinancialData={financialData}
                    currentYear={currentDate.getFullYear()}
                    milestones={milestones}
                    onAddMilestone={handleAddMilestone}
                    onEditMilestone={handleEditMilestone}
                    onDeleteMilestone={handleDeleteMilestone}
                />
            )}
        </main>

        {/* Floating Controls */}
        <div className="fixed bottom-28 right-6 z-20 flex flex-col gap-3">
            {installPrompt && (
                <button 
                    onClick={installApp}
                    className="size-14 rounded-full bg-sage text-[#121212] shadow-lg flex items-center justify-center animate-bounce"
                >
                    <Download size={24} />
                </button>
            )}
            {currentView === 'monthly' && (
                <button 
                    onClick={() => setIsCheckInOpen(true)}
                    className="size-14 rounded-full bg-[#1C1C1E] border border-white/10 text-white shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
                >
                    <Compass size={28} className="text-sage group-hover:rotate-45 transition-transform duration-500" />
                </button>
            )}
        </div>

        {/* Parallax Background */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
            <div 
                className="absolute top-[10%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] opacity-20 transition-transform duration-75 ease-out"
                style={{ transform: `translate(calc(-50% + ${mousePos.x * 0.02}px), ${mousePos.y * 0.02}px)` }}
            ></div>
            <div 
                className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-sage/5 rounded-full blur-[100px] opacity-10 transition-transform duration-100 ease-out"
                style={{ transform: `translate(${-mousePos.x * 0.03}px, ${-mousePos.y * 0.03}px)` }}
            ></div>
        </div>

        <CheckInModal 
            isOpen={isCheckInOpen} 
            onClose={() => setIsCheckInOpen(false)} 
            onAdjust={handleRouteAdjustment}
        />

        <EditModal 
            isOpen={checkInStep.isOpen}
            onClose={() => setCheckInStep({ ...checkInStep, isOpen: false })}
            title={checkInStep.type === 'surplus' ? "Quanto Sobrou?" : "Qual foi o Excesso?"}
            initialValue={0}
            onSave={handleCheckInValue}
        />

      </div>
    </div>
  );
}