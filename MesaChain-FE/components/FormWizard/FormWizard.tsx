import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { FormWizardProps, FormWizardContextValue } from '../../types/formWizard';
import { useFormWizard } from './useFormWizard';

const FormWizardContext = createContext<FormWizardContextValue | null>(null);

export const useFormWizardContext = () => {
  const context = useContext(FormWizardContext);
  if (!context) {
    throw new Error('useFormWizardContext must be used within a FormWizard');
  }
  return context;
};

export const FormWizard: React.FC<FormWizardProps> = ({
  steps,
  initialData = {},
  onComplete,
  onSaveDraft,
}) => {
  const wizard = useFormWizard(steps, initialData, onComplete, onSaveDraft);
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only handle keyboard navigation when the wizard is focused
    if (!isFocused) return;

    if (event.key === 'ArrowLeft' && wizard.canGoPrev) {
      event.preventDefault();
      wizard.prevStep();
    } else if (event.key === 'ArrowRight' && wizard.canGoNext) {
      event.preventDefault();
      wizard.nextStep();
    }
  }, [wizard, isFocused]);

  useEffect(() => {
    if (isFocused) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
    return undefined;
  }, [handleKeyDown, isFocused]);

  // Confirm before closing if data exists
  useEffect(() => {
    const hasData = Object.keys(wizard.data).length > 0;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasData) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return event.returnValue;
      }
    };

    if (hasData) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
    return undefined;
  }, [wizard.data]);

  // Safety check: ensure we have valid steps
  if (!steps || steps.length === 0) {
    console.error('FormWizard: No steps provided');
    return null;
  }

  return (
    <FormWizardContext.Provider value={wizard}>
      <div
        className="form-wizard max-w-4xl mx-auto p-6"
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        role="region"
        aria-label="Multi-step form wizard"
      >
        <WizardProgress />
        <WizardContent />
        <WizardNavigation onComplete={onComplete} onSaveDraft={onSaveDraft} />
      </div>
    </FormWizardContext.Provider>
  );
};

const WizardProgress: React.FC = () => {
  const { currentStep, steps, goToStep, errors } = useFormWizardContext();

  // Check if any step has errors (simplified - in real implementation, you'd track per-step errors)
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="wizard-progress mb-6" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={steps.length} aria-label={`Step ${currentStep + 1} of ${steps.length}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isError = hasErrors && isCurrent; // Highlight current step if there are errors

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => goToStep(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isError
                    ? 'bg-red-500 text-white'
                    : isCompleted
                    ? 'bg-blue-500 text-white'
                    : isCurrent
                    ? 'bg-blue-300 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
                aria-label={`Go to ${step.title}${isError ? ' (has errors)' : ''}`}
                disabled={index > currentStep}
              >
                {index + 1}
              </button>
              <span className={`ml-2 text-sm font-medium ${isError ? 'text-red-600' : ''}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    isCompleted ? 'bg-blue-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WizardContent: React.FC = () => {
  const { currentStep, steps, data, updateData, errors, setErrors } = useFormWizardContext();
  const currentStepData = steps[currentStep];

  if (!currentStepData) return null;

  const StepComponent = currentStepData.component;

  return (
    <div className="wizard-content">
      <StepComponent
        data={data}
        updateData={updateData}
        errors={errors}
        setErrors={setErrors}
      />
    </div>
  );
};

const WizardNavigation: React.FC<{
  onComplete: (data: Record<string, any>) => void;
  onSaveDraft?: (data: Record<string, any>) => void;
}> = ({ onComplete, onSaveDraft }) => {
  const {
    prevStep,
    nextStep,
    isLastStep,
    canGoNext,
    canGoPrev,
    data,
    isLoading,
    setIsLoading,
  } = useFormWizardContext();

  const handleNext = async () => {
    if (isLastStep) {
      setIsLoading(true);
      try {
        await onComplete(data);
      } finally {
        setIsLoading(false);
      }
    } else {
      await nextStep();
    }
  };

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(data);
    }
  };

  return (
    <div className="wizard-navigation flex justify-between mt-6">
      <button
        type="button"
        onClick={prevStep}
        disabled={!canGoPrev || isLoading}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
        aria-label="Go to previous step"
      >
        Previous
      </button>
      <div className="flex gap-2">
        {onSaveDraft && (
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isLoading}
            className="px-4 py-2 bg-yellow-500 text-white rounded disabled:opacity-50"
            aria-label="Save draft"
          >
            Save Draft
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={(!canGoNext && !isLastStep) || isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          aria-label={isLastStep ? 'Complete wizard' : 'Go to next step'}
        >
          {isLoading ? 'Loading...' : isLastStep ? 'Complete' : 'Next'}
        </button>
      </div>
    </div>
  );
};

export default FormWizard;