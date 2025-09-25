import { useState, useCallback, useMemo } from 'react';
import { WizardStep, FormWizardContextValue } from '../../types/formWizard';

export const useFormWizard = (
  steps: WizardStep[],
  initialData: Record<string, any> = {},
  _onComplete: (data: Record<string, any>) => void,
  _onSaveDraft?: (data: Record<string, any>) => void
): FormWizardContextValue => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);

  const filteredSteps = useMemo(() => {
    return steps.filter(step => !step.condition || step.condition(data));
  }, [steps, data]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === filteredSteps.length - 1;
  const canGoNext = !isLastStep && Object.keys(errors).length === 0;
  const canGoPrev = !isFirstStep;

  const validateCurrentStep = useCallback(async () => {
    const currentStepData = filteredSteps[currentStep];
    if (currentStepData?.validationSchema) {
      try {
        await currentStepData.validationSchema.parseAsync(data);
        setErrors({});
        return true;
      } catch (error: any) {
        const formattedErrors: Record<string, any> = {};
        error.errors.forEach((err: any) => {
          formattedErrors[err.path[0]] = err.message;
        });
        setErrors(formattedErrors);
        return false;
      }
    }
    return true;
  }, [filteredSteps, currentStep, data]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < filteredSteps.length) {
      setCurrentStep(step);
    }
  }, [filteredSteps.length]);

  const nextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (isValid && canGoNext) {
      setCurrentStep(prev => prev + 1);
    }
  }, [canGoNext, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (canGoPrev) {
      setCurrentStep(prev => prev - 1);
    }
  }, [canGoPrev]);

  const updateData = useCallback((newData: Record<string, any>) => {
    setData(prev => ({ ...prev, ...newData }));
  }, []);

  return {
    currentStep,
    steps: filteredSteps,
    data,
    goToStep,
    nextStep,
    prevStep,
    updateData,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrev,
    errors,
    setErrors,
    isLoading,
    setIsLoading,
  };
};
