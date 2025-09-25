import React from 'react';
import { FormWizard, ExampleStep1, ExampleStep2, ExampleStep3 } from './index';
import { z } from 'zod';

// Basic Wizard Story
export const BasicWizard = () => {
  const steps = [
    {
      id: 'personal',
      title: 'Personal Info',
      component: ExampleStep1,
      validationSchema: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
      }),
    },
    {
      id: 'additional',
      title: 'Additional Info',
      component: ExampleStep2,
      validationSchema: z.object({
        age: z.number().min(18, 'Must be at least 18'),
        occupation: z.string().min(1, 'Occupation is required'),
      }),
    },
    {
      id: 'review',
      title: 'Review',
      component: ExampleStep3,
    },
  ];

  const handleComplete = (data: any) => {
    console.log('Wizard completed:', data);
    alert('Wizard completed! Check console for data.');
  };

  const handleSaveDraft = (data: any) => {
    console.log('Draft saved:', data);
    alert('Draft saved! Check console for data.');
  };

  return (
    <FormWizard
      steps={steps}
      initialData={{}}
      onComplete={handleComplete}
      onSaveDraft={handleSaveDraft}
    />
  );
};

// Conditional Steps Story
export const ConditionalSteps = () => {
  const steps = [
    {
      id: 'personal',
      title: 'Personal Info',
      component: ExampleStep1,
      validationSchema: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
      }),
    },
    {
      id: 'additional',
      title: 'Additional Info',
      component: ExampleStep2,
      validationSchema: z.object({
        age: z.number().min(18, 'Must be at least 18'),
        occupation: z.string().min(1, 'Occupation is required'),
      }),
      condition: (data: any) => data.age >= 21, // Only show if 21+
    },
    {
      id: 'review',
      title: 'Review',
      component: ExampleStep3,
    },
  ];

  const handleComplete = (data: any) => {
    console.log('Wizard completed:', data);
    alert('Wizard completed! Check console for data.');
  };

  return (
    <FormWizard
      steps={steps}
      initialData={{}}
      onComplete={handleComplete}
    />
  );
};

// Validation Story
export const ValidationExample = () => {
  const steps = [
    {
      id: 'personal',
      title: 'Personal Info',
      component: ExampleStep1,
      validationSchema: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
      }),
    },
    {
      id: 'additional',
      title: 'Additional Info',
      component: ExampleStep2,
      validationSchema: z.object({
        age: z.number().min(18, 'Must be at least 18').max(120, 'Age must be realistic'),
        occupation: z.string().min(1, 'Occupation is required'),
      }),
    },
  ];

  const handleComplete = (data: any) => {
    console.log('Wizard completed:', data);
    alert('Wizard completed! Check console for data.');
  };

  return (
    <FormWizard
      steps={steps}
      initialData={{}}
      onComplete={handleComplete}
    />
  );
};

// Error States Story
export const ErrorStates = () => {
  const steps = [
    {
      id: 'personal',
      title: 'Personal Info',
      component: ExampleStep1,
      validationSchema: z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email'),
      }),
    },
    {
      id: 'additional',
      title: 'Additional Info',
      component: ExampleStep2,
      validationSchema: z.object({
        age: z.number().min(18, 'Must be at least 18'),
        occupation: z.string().min(1, 'Occupation is required'),
      }),
    },
  ];

  const handleComplete = (data: any) => {
    console.log('Wizard completed:', data);
    alert('Wizard completed! Check console for data.');
  };

  return (
    <div className="p-4">
      <p className="mb-4 text-sm text-gray-600">
        Try submitting empty forms or invalid data to see error states and progress indicator highlighting.
      </p>
      <FormWizard
        steps={steps}
        initialData={{}}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default {
  title: 'FormWizard',
  component: FormWizard,
};