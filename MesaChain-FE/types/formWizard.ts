import { z } from 'zod';

export interface WizardStep {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  validationSchema?: z.ZodSchema;
  condition?: (data: Record<string, any>) => boolean;
}

export interface FormWizardProps {
  steps: WizardStep[];
  initialData?: Record<string, any>;
  onComplete: (data: Record<string, any>) => void;
  onSaveDraft?: (data: Record<string, any>) => void;
}

export interface FormWizardContextValue {
  currentStep: number;
  steps: WizardStep[];
  data: Record<string, any>;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Record<string, any>) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  errors: Record<string, any>;
  setErrors: (errors: Record<string, any>) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}
