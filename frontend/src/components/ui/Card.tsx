import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  padding = 'md',
  hover = false 
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hover ? 'hover:bg-gray-750 hover:scale-105 cursor-pointer' : '';

  return (
    <div className={`bg-gray-800 rounded-xl border border-gray-700 ${paddingClasses[padding]} ${hoverClasses} transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
};

export default Card;