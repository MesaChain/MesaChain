import * as React from "react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  UseFormGetValues,
} from "react-hook-form";
import type { ZodSchema } from "zod";
export interface WizardStep {
  id: string;
  title: string;
  validationSchema?: ZodSchema;
  condition?: (formData: Record<string, any>) => boolean;
}

export interface FormWizardProps {
  steps: WizardStep[];
  initialData?: Record<string, any>;
  onComplete: (data: Record<string, any>) => void | Promise<void>;
  onSaveDraft?: (data: Record<string, any>) => void;
  draftKey?: string;
  children: React.ReactNode;
}

export interface WizardState {
  currentStepIndex: number;
  formData: Record<string, any>;
  isDirty: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  stepsWithErrors: number[];
}

export interface UseFormWizardReturn {
  currentStep: WizardStep;
  currentStepIndex: number;
  steps: WizardStep[];
  totalSteps: number;
  formData: Record<string, any>;
  progress: number;
  isFirstStep: boolean;
  isLastStep: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  stepsWithErrors: number[];
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  goToStep: (index: number) => Promise<boolean>;
  canGoToStep: (index: number) => boolean;
  saveDraft: () => void;
  loadDraft: () => boolean;
  clearDraft: () => void;
  resetWizard: () => void;
  register: UseFormRegister<Record<string, any>>;
  watch: UseFormWatch<Record<string, any>>;
  setValue: UseFormSetValue<Record<string, any>>;
  getValues: UseFormGetValues<Record<string, any>>;
  errors: FieldErrors<Record<string, any>>;
  getProgressAriaLabel: () => string;
  getStepAriaLabel: (index: number) => string;
  focusRef: React.MutableRefObject<HTMLElement | null>;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  confirmExit: () => boolean;
}
export interface FormStepProps {
  stepId: string;
  children: React.ReactNode;
  className?: string;
}
export interface FormWizardContextValue extends UseFormWizardReturn {
  allSteps: WizardStep[];
  draftKey: string;
  onSaveDraft?: (data: Record<string, any>) => void;
}
