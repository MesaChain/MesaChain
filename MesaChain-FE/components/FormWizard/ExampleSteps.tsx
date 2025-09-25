import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormWizardContext } from './FormWizard';

const step1Schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type Step1Data = z.infer<typeof step1Schema>;

export const ExampleStep1: React.FC = () => {
  const { data, updateData, setErrors } = useFormWizardContext();

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    watch,
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
    defaultValues: {
      name: data.name || '',
      email: data.email || '',
    },
  });

  React.useEffect(() => {
    const subscription = watch(values => {
      updateData(values);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateData]);

  const onSubmit = (formData: Step1Data) => {
    updateData(formData);
    setErrors({});
  };

  // Update errors in context
  React.useEffect(() => {
    setErrors(formErrors);
  }, [formErrors, setErrors]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Personal Information</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            {...register('name')}
            className="w-full p-2 border rounded"
            placeholder="Enter your name"
          />
          {formErrors.name && (
            <p className="text-red-500 text-sm mt-1">{formErrors.name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            {...register('email')}
            type="email"
            className="w-full p-2 border rounded"
            placeholder="Enter your email"
          />
          {formErrors.email && (
            <p className="text-red-500 text-sm mt-1">{formErrors.email.message}</p>
          )}
        </div>
      </form>
    </div>
  );
};

const step2Schema = z.object({
  age: z.number().min(18, 'Must be at least 18'),
  occupation: z.string().min(1, 'Occupation is required'),
});

type Step2Data = z.infer<typeof step2Schema>;

export const ExampleStep2: React.FC = () => {
  const { data, updateData, setErrors } = useFormWizardContext();

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
    watch,
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    mode: 'onChange',
    defaultValues: {
      age: typeof data.age === 'number' ? data.age : (undefined as unknown as number),
      occupation: data.occupation || '',
    },
  });

  React.useEffect(() => {
    const subscription = watch(values => {
      updateData({
        ...values,
        age: Number.isNaN(values.age) ? undefined : values.age,
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, updateData]);

  const onSubmit = (formData: Step2Data) => {
    updateData(formData);
    setErrors({});
  };

  React.useEffect(() => {
    setErrors(formErrors);
  }, [formErrors, setErrors]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Additional Information</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Age</label>
          <input
            {...register('age', { valueAsNumber: true })}
            type="number"
            className="w-full p-2 border rounded"
            placeholder="Enter your age"
          />
          {formErrors.age && (
            <p className="text-red-500 text-sm mt-1">{formErrors.age.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Occupation</label>
          <input
            {...register('occupation')}
            className="w-full p-2 border rounded"
            placeholder="Enter your occupation"
          />
          {formErrors.occupation && (
            <p className="text-red-500 text-sm mt-1">{formErrors.occupation.message}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export const ExampleStep3: React.FC = () => {
  const { data } = useFormWizardContext();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Review</h2>
      <div className="bg-gray-50 p-4 rounded">
        <p><strong>Name:</strong> {data.name}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Age:</strong> {data.age}</p>
        <p><strong>Occupation:</strong> {data.occupation}</p>
      </div>
    </div>
  );
};