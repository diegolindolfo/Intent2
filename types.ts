export type ViewState = 'monthly' | 'annual';

export interface Category {
  id: string;
  name: string;
  plannedAmount: number;
  icon: string; // nome do ícone lucide
  color: 'sage' | 'gold' | 'white' | 'blue' | 'purple' | 'orange' | 'pink' | 'cyan';
}

export interface Milestone {
  id: string;
  name: string;
  targetAmount: number;
  initialAmount: number;
  icon: string;
  color: 'sage' | 'gold' | 'white';
}

export interface MonthlyData {
  income: number;
  categories: Category[];
}

export interface YearData {
  [monthKey: string]: MonthlyData; // Formato "YYYY-MM"
}

export type PlanStatus = 'below' | 'onTrack' | 'above';
