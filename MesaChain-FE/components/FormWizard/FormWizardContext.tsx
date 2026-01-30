"use client";

import {
  createContext,
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { useForm, useWatch } from "react-hook-form";
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
  // Core state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [stepsWithErrors, setStepsWithErrors] = useState<number[]>([]);

  // Use a ref to store form data to avoid re-render loops
  // The ref holds the "source of truth" for conditional step evaluation
  const formDataRef = useRef<Record<string, any>>(initialData);

  // This state is only used to trigger re-renders when form data changes
  // It's updated in a controlled way to prevent infinite loops
  const [formDataVersion, setFormDataVersion] = useState(0);

  // Derived formData for context consumers (reads from ref)
  const formData = formDataRef.current;

  // Focus ref for accessibility
  const focusRef = useRef<HTMLElement>(null);

  // Get active steps based on conditions - uses ref to avoid loop
  const steps = useMemo(
    () => getActiveSteps(allSteps, formDataRef.current),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allSteps, formDataVersion],
  );

  const currentStep = steps[currentStepIndex] || steps[0];
  const totalSteps = steps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const progress = calculateProgress(currentStepIndex, totalSteps);

  // React Hook Form setup - use initialData directly, not formData state
  const form = useForm<Record<string, any>>({
    defaultValues: initialData,
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

  // Keep a ref to the latest reset() so draft-loading doesn't re-run due to reset identity changes.
  const resetRef = useRef(reset);
  resetRef.current = reset;

  // Prefer useWatch over form.watch() subscriptions to avoid re-subscribe loops.
  const watchedValues = useWatch({ control: form.control });

  useEffect(() => {
    const values = (watchedValues ?? {}) as Record<string, any>;
    const prevData = formDataRef.current;

    // Only update if values have actually changed (shallow comparison)
    const hasChanges = Object.keys(values).some(
      (key) => values[key] !== prevData[key],
    );
    if (!hasChanges) return;

    const nextData = { ...prevData, ...values };
    formDataRef.current = nextData;
    setIsDirty(true);

    // Only trigger re-render if step visibility changed
    const prevSteps = getActiveSteps(allSteps, prevData);
    const nextSteps = getActiveSteps(allSteps, nextData);
    if (
      prevSteps.length !== nextSteps.length ||
      prevSteps.some((s, i) => s.id !== nextSteps[i]?.id)
    ) {
      setFormDataVersion((v) => v + 1);
    }
  }, [watchedValues, allSteps]);

  // If a draft wants to restore a step index, we apply it once steps are known.
  const pendingDraftStepIndexRef = useRef<number | null>(null);

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraftFromStorage(draftKey);
    if (draft && Object.keys(draft.data).length > 0) {
      formDataRef.current = draft.data;
      pendingDraftStepIndexRef.current = draft.currentStepIndex;
      resetRef.current(draft.data);
      setFormDataVersion((v) => v + 1);
    }
  }, [draftKey]);

  // Clamp current step when conditional steps change, and apply draft step index once.
  useEffect(() => {
    setCurrentStepIndex((idx) => {
      const maxIndex = Math.max(totalSteps - 1, 0);
      const desired = pendingDraftStepIndexRef.current ?? idx;
      const clamped = Math.min(desired, maxIndex);

      if (pendingDraftStepIndexRef.current !== null) {
        pendingDraftStepIndexRef.current = null;
      }

      return clamped === idx ? idx : clamped;
    });
  }, [totalSteps]);

  useEffect(() => {
    if (!isDirty) return;
    const timeoutId = setTimeout(() => {
      saveDraftToStorage(draftKey, formDataRef.current, currentStepIndex);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [watchedValues, currentStepIndex, formDataVersion, isDirty, draftKey]);

  // Focus management on step change
  useEffect(() => {
    if (focusRef.current) {
      focusRef.current.focus();
    }
  }, [currentStepIndex]);

  // Validate current step
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    if (!currentStep?.validationSchema) {
      return true;
    }

    setIsValidating(true);
    try {
      const isValid = await trigger();

      if (!isValid) {
        // Track this step as having errors
        setStepsWithErrors((prev) =>
          prev.includes(currentStepIndex) ? prev : [...prev, currentStepIndex],
        );
      } else {
        // Remove from error list
        setStepsWithErrors((prev) =>
          prev.filter((idx) => idx !== currentStepIndex),
        );
      }

      return isValid;
    } finally {
      setIsValidating(false);
    }
  }, [currentStep?.validationSchema, trigger, currentStepIndex]);

  // Navigation: Next step
  const nextStep = useCallback(async (): Promise<boolean> => {
    if (totalSteps === 0) return false;
    const isValid = await validateCurrentStep();
    if (!isValid) return false;

    if (isLastStep) {
      // Final submission
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

    // Proceed to next step
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

  // Navigation: Previous step
  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Navigation: Go to specific step
  const goToStep = useCallback(
    async (index: number): Promise<boolean> => {
      if (index < 0 || index >= totalSteps) return false;

      // If going forward, validate current step first
      if (index > currentStepIndex) {
        const isValid = await validateCurrentStep();
        if (!isValid) return false;
      }

      setCurrentStepIndex(index);
      return true;
    },
    [totalSteps, currentStepIndex, validateCurrentStep],
  );

  // Check if can navigate to step
  const canGoToStep = useCallback(
    (index: number): boolean => {
      if (index < 0 || index >= totalSteps) return false;
      // Can always go back, but can only go forward one step at a time
      return index <= currentStepIndex + 1;
    },
    [totalSteps, currentStepIndex],
  );

  // Draft management
  const saveDraft = useCallback(() => {
    saveDraftToStorage(draftKey, formData, currentStepIndex);
    onSaveDraft?.(formData);
  }, [draftKey, formData, currentStepIndex, onSaveDraft]);

  const loadDraft = useCallback((): boolean => {
    const draft = loadDraftFromStorage(draftKey);
    if (draft) {
      formDataRef.current = draft.data;
      reset(draft.data);
      setFormDataVersion((v) => v + 1);
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
    formDataRef.current = initialData;
    reset(initialData);
    setFormDataVersion((v) => v + 1);
    setCurrentStepIndex(0);
    setIsDirty(false);
    setStepsWithErrors([]);
  }, [draftKey, initialData, reset]);

  // Accessibility helpers
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

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
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

  // Confirm exit helper
  const confirmExit = useCallback((): boolean => {
    if (!isDirty) return true;
    if (typeof window === "undefined") return true;
    const shouldExit = window.confirm(
      "You have unsaved changes. Save as draft and leave? (Cancel to stay)",
    );
    if (!shouldExit) return false;
    saveDraft();
    return true;
  }, [isDirty, saveDraft]);

  const contextValue: FormWizardContextValue = {
    // State
    currentStep,
    currentStepIndex,
    steps,
    totalSteps,
    formData,
    progress,

    // Flags
    isFirstStep,
    isLastStep,
    isDirty,
    isSubmitting,
    isValidating,
    stepsWithErrors,

    // Navigation
    nextStep,
    prevStep,
    goToStep,
    canGoToStep,

    // Draft management
    saveDraft,
    loadDraft,
    clearDraft,
    resetWizard,

    // Form integration
    register,
    watch,
    setValue,
    getValues,
    errors,

    // Accessibility
    getProgressAriaLabel,
    getStepAriaLabel,
    focusRef,
    handleKeyDown,

    // UX
    confirmExit,

    // Additional context
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
