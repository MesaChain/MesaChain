import type { WizardStep } from "./types";

interface DraftData {
  data: Record<string, any>;
  timestamp: number;
  currentStepIndex: number;
}

export function loadDraftFromStorage(key: string): DraftData | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as DraftData;

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "data" in parsed &&
      "timestamp" in parsed
    ) {
      return parsed;
    }

    return null;
  } catch (error) {
    console.warn(`[FormWizard] Failed to load draft from "${key}":`, error);
    return null;
  }
}

export function saveDraftToStorage(
  key: string,
  data: Record<string, any>,
  currentStepIndex: number,
): boolean {
  if (typeof window === "undefined") return false;
  try {
    const draftData: DraftData = {
      data,
      timestamp: Date.now(),
      currentStepIndex,
    };
    localStorage.setItem(key, JSON.stringify(draftData));
    return true;
  } catch (error) {
    console.warn(`[FormWizard] Failed to save draft to "${key}":`, error);
    return false;
  }
}

export function clearDraftFromStorage(key: string): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[FormWizard] Failed to clear draft from "${key}":`, error);
  }
}
export function getActiveSteps(
  steps: WizardStep[],
  formData: Record<string, any>,
): WizardStep[] {
  return steps.filter((step) => {
    if (!step.condition) return true;
    return step.condition(formData);
  });
}
export function calculateProgress(
  currentIndex: number,
  totalSteps: number,
): number {
  if (totalSteps <= 1) return 100;
  return Math.round((currentIndex / (totalSteps - 1)) * 100);
}

export function getProgressAriaLabel(
  currentIndex: number,
  totalSteps: number,
  currentStepTitle: string,
): string {
  return `Step ${currentIndex + 1} of ${totalSteps}: ${currentStepTitle}. Progress: ${calculateProgress(currentIndex, totalSteps)}%`;
}
export function getStepAriaLabel(
  step: WizardStep,
  index: number,
  currentIndex: number,
  hasError: boolean,
): string {
  const status =
    index < currentIndex
      ? "completed"
      : index === currentIndex
        ? "current"
        : "upcoming";

  const errorSuffix = hasError ? ", has validation errors" : "";

  return `Step ${index + 1}: ${step.title}, ${status}${errorSuffix}`;
}

export function findStepIndexById(steps: WizardStep[], stepId: string): number {
  return steps.findIndex((step) => step.id === stepId);
}
export function isStepActive(stepId: string, currentStep: WizardStep): boolean {
  return currentStep.id === stepId;
}
