import React from 'react';

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', className = '', icon, ...props 
}) => {
  const baseStyle = "font-mono font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-offset-black focus:ring-space-neon";
  
  const variants = {
    primary: "bg-space-neon text-black border border-space-neon hover:bg-white hover:border-white",
    secondary: "bg-transparent text-space-neon border border-space-neon hover:bg-space-neon hover:text-black",
    danger: "bg-transparent text-space-alert border border-space-alert hover:bg-space-alert hover:text-black",
    ghost: "bg-transparent text-space-muted hover:text-space-text"
  };

  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-5 py-2 text-sm",
    lg: "px-8 py-3 text-base"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </button>
  );
};

// --- CARD ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-space-dark border border-space-steel p-6 relative ${className}`}>
    {title && (
      <div className="absolute -top-3 left-4 bg-space-black px-2 border-l border-r border-space-steel">
        <span className="text-xs font-mono text-space-muted tracking-widest uppercase">{title}</span>
      </div>
    )}
    {children}
    {/* Decorative corner */}
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-space-neon"></div>
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-space-neon"></div>
  </div>
);

// --- BADGE ---
export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-space-steel' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wide text-white ${color}`}>
    {children}
  </span>
);

// --- INPUT ---
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props}
    className={`w-full bg-black border border-space-steel px-4 py-2 text-space-text font-mono focus:border-space-neon focus:outline-none placeholder-space-muted transition-colors ${props.className}`}
  />
);
