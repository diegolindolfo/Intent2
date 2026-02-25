import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, delay = 0 }) => {
  return (
    <div 
      onClick={onClick}
      style={{ 
        animationDelay: `${delay}ms`,
        animationFillMode: 'both' // Garante que o estado inicial (invisível/deslocado) seja mantido durante o delay
      }}
      className={`glass-card rounded-3xl p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/5 ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
    >
      {children}
    </div>
  );
};