"use client";
import { useRef, useEffect, type MutableRefObject } from "react";
import { useFormWizard } from "./useFormWizard";
import type { FormStepProps } from "./types";
import { cn } from "@/lib/utils";

/**
 * FormStep - A wrapper component for individual wizard steps
 *
 * Features:
 * - Only renders children when the step is active
 * - Handles focus management on step entry
 * - Provides proper ARIA attributes
 *
 * Usage:
 * ```tsx
 * <FormStep stepId="personal-info">
 *   <Input {...register("name")} />
 *   <Input {...register("email")} />
 * </FormStep>
 * ```
 */
export function FormStep({ stepId, children, className }: FormStepProps) {
  const { currentStep, focusRef, getStepAriaLabel, steps, currentStepIndex } =
    useFormWizard();
  const stepRef = useRef<HTMLDivElement | null>(null);

  const isActive = currentStep?.id === stepId;
  const stepIndex = steps.findIndex((s) => s.id === stepId);

  // Focus the step container when it becomes active
  useEffect(() => {
    if (isActive && stepRef.current) {
      const timeoutId = setTimeout(() => {
        stepRef.current?.focus();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <div
      ref={(node) => {
        stepRef.current = node;
        if (focusRef && "current" in focusRef) {
          (focusRef as MutableRefObject<HTMLElement | null>).current = node;
        }
      }}
      className={cn("outline-none", className)}
      tabIndex={-1}
      role="tabpanel"
      aria-label={stepIndex >= 0 ? getStepAriaLabel(stepIndex) : undefined}
      aria-hidden={!isActive}
      data-step-id={stepId}
      data-step-index={stepIndex}
      data-active={isActive}
    >
      {children}
    </div>
  );
}

FormStep.displayName = "FormStep";
