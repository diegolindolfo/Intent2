import React from 'react';
import { iconMap, availableIcons, availableColors } from '../utils/icons';
import { Check } from 'lucide-react';

interface AppearanceSelectorProps {
  selectedIcon: string;
  selectedColor: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
}

export const AppearanceSelector: React.FC<AppearanceSelectorProps> = ({ 
  selectedIcon, 
  selectedColor, 
  onIconChange, 
  onColorChange 
}) => {
  return (
    <div className="flex flex-col gap-4 py-2 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-medium">Cor do Cartão</label>
        <div className="flex flex-wrap gap-2">
            {availableColors.map(color => (
                <button
                    key={color}
                    type="button"
                    onClick={() => onColorChange(color)}
                    className={`size-8 rounded-full border flex items-center justify-center transition-transform active:scale-95 ${selectedColor === color ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                    <div className={`size-6 rounded-full bg-${color}`}>
                         {selectedColor === color && <Check size={14} className="text-black/50 mx-auto" />}
                    </div>
                </button>
            ))}
        </div>
      </div>

      <div>
        <label className="block text-white/40 text-xs uppercase tracking-widest mb-2 font-medium">Ícone Representativo</label>
        <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto no-scrollbar bg-white/5 p-2 rounded-xl">
            {availableIcons.map(iconName => {
                const Icon = iconMap[iconName];
                return (
                    <button
                        key={iconName}
                        type="button"
                        onClick={() => onIconChange(iconName)}
                        className={`size-8 rounded-lg flex items-center justify-center transition-colors ${selectedIcon === iconName ? 'bg-sage text-[#121212]' : 'text-white/40 hover:bg-white/10 hover:text-white'}`}
                    >
                        <Icon size={18} />
                    </button>
                );
            })}
        </div>
      </div>
    </div>
  );
};