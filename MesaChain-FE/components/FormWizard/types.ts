import * as React from "react";
import type {
  FieldErrors,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  UseFormGetValues,
} from "react-hook-form";
import type { ZodSchema } from "zod";

/**
 * Configuration for a single wizard step
 */
export interface WizardStep {
  id: string;
  title: string;
  validationSchema?: ZodSchema;
  condition?: (formData: Record<string, any>) => boolean;
}

/**
 * Props for the FormWizard provider component
 */
export interface FormWizardProps {
  steps: WizardStep[];
  initialData?: Record<string, any>;
  onComplete: (data: Record<string, any>) => void | Promise<void>;
  onSaveDraft?: (data: Record<string, any>) => void;
  draftKey?: string;
  children: React.ReactNode;
}

/**
 * Internal wizard state
 */
export interface WizardState {
  currentStepIndex: number;
  formData: Record<string, any>;
  isDirty: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  stepsWithErrors: number[];
}

/**
 * Return type of useFormWizard hook
 */
export interface UseFormWizardReturn {
  // State
  currentStep: WizardStep;
  currentStepIndex: number;
  steps: WizardStep[];
  totalSteps: number;
  formData: Record<string, any>;
  progress: number;

  // Flags
  isFirstStep: boolean;
  isLastStep: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  isValidating: boolean;
  stepsWithErrors: number[];

  // Navigation Actions
  nextStep: () => Promise<boolean>;
  prevStep: () => void;
  goToStep: (index: number) => Promise<boolean>;
  canGoToStep: (index: number) => boolean;

  // Data Actions
  saveDraft: () => void;
  loadDraft: () => boolean;
  clearDraft: () => void;
  resetWizard: () => void;

  // Form Integration (React Hook Form)
  register: UseFormRegister<Record<string, any>>;
  watch: UseFormWatch<Record<string, any>>;
  setValue: UseFormSetValue<Record<string, any>>;
  getValues: UseFormGetValues<Record<string, any>>;
  errors: FieldErrors<Record<string, any>>;

  // Accessibility
  getProgressAriaLabel: () => string;
  getStepAriaLabel: (index: number) => string;
  focusRef: React.RefObject<HTMLElement>;
  handleKeyDown: (e: React.KeyboardEvent) => void;

  // UX Helpers
  confirmExit: () => boolean;
}

/**
 * Props for the FormStep wrapper component
 */
export interface FormStepProps {
  stepId: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Context value for the wizard
 */
export interface FormWizardContextValue extends UseFormWizardReturn {
  allSteps: WizardStep[];
  draftKey: string;
  onSaveDraft?: (data: Record<string, any>) => void;
}
