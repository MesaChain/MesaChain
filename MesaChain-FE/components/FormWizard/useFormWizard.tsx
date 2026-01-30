"use client";
import { useContext } from "react";

import { FormWizardContext } from "./FormWizardContext";
import type { UseFormWizardReturn } from "./types";

export function useFormWizard(): UseFormWizardReturn {
  const context = useContext(FormWizardContext);

  if (!context) {
    throw new Error(
      "useFormWizard must be used within a <FormWizard> provider. " +
        "Make sure your component is wrapped with <FormWizard>.",
    );
  }

  const {
    currentStep,
    currentStepIndex,
    steps,
    totalSteps,
    formData,
    progress,
    isFirstStep,
    isLastStep,
    isDirty,
    isSubmitting,
    isValidating,
    stepsWithErrors,
    nextStep,
    prevStep,
    goToStep,
    canGoToStep,
    saveDraft,
    loadDraft,
    clearDraft,
    resetWizard,
    register,
    watch,
    setValue,
    getValues,
    errors,
    getProgressAriaLabel,
    getStepAriaLabel,
    focusRef,
    handleKeyDown,
    confirmExit,
  } = context;

  return {
    currentStep,
    currentStepIndex,
    steps,
    totalSteps,
    formData,
    progress,
    isFirstStep,
    isLastStep,
    isDirty,
    isSubmitting,
    isValidating,
    stepsWithErrors,
    nextStep,
    prevStep,
    goToStep,
    canGoToStep,
    saveDraft,
    loadDraft,
    clearDraft,
    resetWizard,
    register,
    watch,
    setValue,
    getValues,
    errors,
    getProgressAriaLabel,
    getStepAriaLabel,
    focusRef,
    handleKeyDown,
    confirmExit,
  };
}
