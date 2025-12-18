import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  onClick, 
  hoverable = false,
  padding = 'md'
}) => {
  const baseStyles = 'bg-white rounded-lg shadow-md transition-all duration-200';
  const hoverStyles = hoverable ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' : '';
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div
      onClick={onClick}
      className={`${baseStyles} ${hoverStyles} ${paddingStyles[padding]} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
