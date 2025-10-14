import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  footer,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {title && (
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
      )}
      <div>{children}</div>
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};
