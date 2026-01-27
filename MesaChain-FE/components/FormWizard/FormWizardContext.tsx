"use client";

import {
  createContext,
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type {
  FormWizardProps,
  FormWizardContextValue,
  WizardStep,
} from "./types";
import {
  loadDraftFromStorage,
  saveDraftToStorage,
  clearDraftFromStorage,
  getActiveSteps,
  calculateProgress,
  getProgressAriaLabel as getProgressAriaLabelUtil,
  getStepAriaLabel as getStepAriaLabelUtil,
} from "./utils";

const FormWizardContext = createContext<FormWizardContextValue | null>(null);

FormWizardContext.displayName = "FormWizardContext";

const DEFAULT_DRAFT_KEY = "form-wizard-draft";

export function FormWizard({
  steps: allSteps,
  initialData = {},
  onComplete,
  onSaveDraft,
  draftKey = DEFAULT_DRAFT_KEY,
  children,
}: FormWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [stepsWithErrors, setStepsWithErrors] = useState<number[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>(initialData);

  const focusRef = useRef<HTMLElement | null>(null);

  const steps = useMemo(
    () => getActiveSteps(allSteps, formData),
    [allSteps, formData],
  );

  const currentStep = steps[currentStepIndex] || steps[0];
  const totalSteps = steps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const progress = calculateProgress(currentStepIndex, totalSteps);

  const form = useForm<Record<string, any>>({
    defaultValues: formData,
    ...(currentStep?.validationSchema
      ? {
          resolver: zodResolver(currentStep.validationSchema as any) as any,
        }
      : {}),
    mode: "onBlur",
  });

  const {
    register,
    watch,
    setValue,
    getValues,
    formState: { errors },
    trigger,
    reset,
  } = form;

  useEffect(() => {
    const subscription = watch((values) => {
      setFormData((prev) => ({ ...prev, ...values }));
      setIsDirty(true);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    const draft = loadDraftFromStorage(draftKey);
    if (draft && Object.keys(draft.data).length > 0) {
      setFormData(draft.data);
      reset(draft.data);
      if (draft.currentStepIndex < totalSteps) {
        setCurrentStepIndex(draft.currentStepIndex);
      }
    }
  }, [draftKey, reset, totalSteps]);

  useEffect(() => {
    if (isDirty) {
      saveDraftToStorage(draftKey, formData, currentStepIndex);
    }
  }, [currentStepIndex, formData, isDirty, draftKey]);

  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, [currentStepIndex]);

  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    if (!currentStep?.validationSchema) {
      return true;
    }

    setIsValidating(true);
    try {
      const isValid = await trigger();

      if (!isValid) {
        setStepsWithErrors((prev) =>
          prev.includes(currentStepIndex) ? prev : [...prev, currentStepIndex],
        );
      } else {
        setStepsWithErrors((prev) =>
          prev.filter((idx) => idx !== currentStepIndex),
        );
      }

      return isValid;
    } finally {
      setIsValidating(false);
    }
  }, [currentStep?.validationSchema, trigger, currentStepIndex]);

  const nextStep = useCallback(async (): Promise<boolean> => {
    const isValid = await validateCurrentStep();
    if (!isValid) return false;

    if (isLastStep) {
      setIsSubmitting(true);
      try {
        await onComplete(formData);
        clearDraftFromStorage(draftKey);
        setIsDirty(false);
        return true;
      } catch (error) {
        console.error("[FormWizard] Submission failed:", error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    }

    setCurrentStepIndex((prev) => Math.min(prev + 1, totalSteps - 1));
    return true;
  }, [
    validateCurrentStep,
    isLastStep,
    onComplete,
    formData,
    draftKey,
    totalSteps,
  ]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback(
    async (index: number): Promise<boolean> => {
      if (index < 0 || index >= totalSteps) return false;

      if (index > currentStepIndex) {
        const isValid = await validateCurrentStep();
        if (!isValid) return false;
      }

      setCurrentStepIndex(index);
      return true;
    },
    [totalSteps, currentStepIndex, validateCurrentStep],
  );

  const canGoToStep = useCallback(
    (index: number): boolean => {
      if (index < 0 || index >= totalSteps) return false;
      return index <= currentStepIndex + 1;
    },
    [totalSteps, currentStepIndex],
  );

  const saveDraft = useCallback(() => {
    saveDraftToStorage(draftKey, formData, currentStepIndex);
    onSaveDraft?.(formData);
  }, [draftKey, formData, currentStepIndex, onSaveDraft]);

  const loadDraft = useCallback((): boolean => {
    const draft = loadDraftFromStorage(draftKey);
    if (draft) {
      setFormData(draft.data);
      reset(draft.data);
      if (draft.currentStepIndex < totalSteps) {
        setCurrentStepIndex(draft.currentStepIndex);
      }
      return true;
    }
    return false;
  }, [draftKey, reset, totalSteps]);

  const clearDraft = useCallback(() => {
    clearDraftFromStorage(draftKey);
  }, [draftKey]);

  const resetWizard = useCallback(() => {
    clearDraftFromStorage(draftKey);
    setFormData(initialData);
    reset(initialData);
    setCurrentStepIndex(0);
    setIsDirty(false);
    setStepsWithErrors([]);
  }, [draftKey, initialData, reset]);

  const getProgressAriaLabel = useCallback(
    () =>
      getProgressAriaLabelUtil(
        currentStepIndex,
        totalSteps,
        currentStep?.title || "",
      ),
    [currentStepIndex, totalSteps, currentStep?.title],
  );

  const getStepAriaLabel = useCallback(
    (index: number) => {
      const step = steps[index];
      if (!step) return "";
      return getStepAriaLabelUtil(
        step,
        index,
        currentStepIndex,
        stepsWithErrors.includes(index),
      );
    },
    [steps, currentStepIndex, stepsWithErrors],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        nextStep();
      } else if (e.key === "Escape") {
        if (isDirty) {
          const shouldExit = window.confirm(
            "You have unsaved changes. Are you sure you want to exit?",
          );
          if (shouldExit) {
            saveDraft();
          }
        }
      }
    },
    [nextStep, isDirty, saveDraft],
  );

  const confirmExit = useCallback((): boolean => {
    if (!isDirty) return true;
    if (typeof window === "undefined") return true;
    const shouldExit = window.confirm(
      "You have unsaved changes. Would you like to save as draft before leaving?",
    );
    if (shouldExit) {
      saveDraft();
    }
    return true;
  }, [isDirty, saveDraft]);

  const contextValue: FormWizardContextValue = {
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
    allSteps,
    draftKey,
    onSaveDraft,
  };

  return (
    <FormWizardContext.Provider value={contextValue}>
      {children}
    </FormWizardContext.Provider>
  );
}

export { FormWizardContext };
