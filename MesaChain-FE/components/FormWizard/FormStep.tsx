import React from 'react';

interface FormStepProps {
  children: React.ReactNode;
  className?: string;
}

export const FormStep: React.FC<FormStepProps> = ({ children, className = '' }) => {
  return (
    <div className={`form-step ${className}`}>
      {children}
    </div>
  );
};

export default FormStep;