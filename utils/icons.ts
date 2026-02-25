import { Wallet, Home, Coffee, TrendingUp, Copy, ShoppingBag, HeartPulse, Sparkles, Box, Zap, Plus, X, Car, ShieldCheck, Plane, GraduationCap, Dumbbell, Utensils, Wifi, Smartphone, Gift, Briefcase, Anchor, Sun, Moon, Umbrella } from 'lucide-react';

export const iconMap: Record<string, any> = {
  Home, Zap, Coffee, HeartPulse, Sparkles, ShoppingBag, Box, TrendingUp, Car, ShieldCheck, Plane,
  GraduationCap, Dumbbell, Utensils, Wifi, Smartphone, Gift, Briefcase, Wallet, Anchor, Sun, Moon, Umbrella
};

export const availableIcons = Object.keys(iconMap);

export const availableColors = ['sage', 'gold', 'white', 'blue', 'purple', 'orange', 'pink', 'cyan'] as const;