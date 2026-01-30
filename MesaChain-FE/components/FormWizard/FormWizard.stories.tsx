import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { z } from "zod";
import { FormWizard, FormStep, useFormWizard } from "./index";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";

const meta: Meta<typeof FormWizard> = {
  title: "Components/FormWizard",
  component: FormWizard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A headless wizard/stepper component with validation, draft persistence, and accessibility support.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FormWizard>;

// ============================================================================
// Shared Components
// ============================================================================

function StepIndicator() {
  const { steps, currentStepIndex, stepsWithErrors, goToStep, canGoToStep } =
    useFormWizard();

  return (
    <div className="flex gap-2 mb-6">
      {steps.map((step, index) => {
        const isActive = index === currentStepIndex;
        const hasError = stepsWithErrors.includes(index);
        const isCompleted = index < currentStepIndex;

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => goToStep(index)}
            disabled={!canGoToStep(index)}
            className={`
              flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
              transition-colors
              ${isActive ? "bg-primary text-primary-foreground" : ""}
              ${isCompleted && !hasError ? "bg-green-500 text-white" : ""}
              ${hasError ? "bg-destructive text-destructive-foreground" : ""}
              ${!isActive && !isCompleted && !hasError ? "bg-muted text-muted-foreground" : ""}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
}

function WizardNavigation() {
  const {
    currentStepIndex,
    totalSteps,
    progress,
    isFirstStep,
    isLastStep,
    isSubmitting,
    nextStep,
    prevStep,
    getProgressAriaLabel,
  } = useFormWizard();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Progress value={progress} aria-label={getProgressAriaLabel()} />
        <p className="text-sm text-muted-foreground text-center">
          Step {currentStepIndex + 1} of {totalSteps}
        </p>
      </div>
      <div className="flex gap-2 justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={isFirstStep}
        >
          Previous
        </Button>
        <Button
          type="button"
          onClick={() => nextStep()}
          disabled={isSubmitting}
        >
          {isLastStep ? (isSubmitting ? "Submitting..." : "Submit") : "Next"}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Validation Schemas
// ============================================================================

const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

const addressSchema = z.object({
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  zipCode: z.string().regex(/^\d{5}$/, "Please enter a valid 5-digit zip code"),
});

const preferencesSchema = z.object({
  newsletter: z.boolean().optional(),
  notifications: z.boolean().optional(),
});

// ============================================================================
// Story 1: Basic Wizard
// ============================================================================

const BasicWizardContent = () => {
  const { register, currentStep } = useFormWizard();

  return (
    <div className="w-full max-w-md p-6 border rounded-lg">
      <StepIndicator />
      <h2 className="text-xl font-semibold mb-4">{currentStep.title}</h2>

      <FormStep stepId="step1" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" placeholder="John" {...register("firstName")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" placeholder="Doe" {...register("lastName")} />
        </div>
      </FormStep>

      <FormStep stepId="step2" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register("email")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="555-123-4567"
            {...register("phone")}
          />
        </div>
      </FormStep>

      <FormStep stepId="step3" className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Review & Confirm</h3>
          <p className="text-sm text-muted-foreground">
            Click Submit to complete the wizard.
          </p>
        </div>
      </FormStep>

      <div className="mt-6">
        <WizardNavigation />
      </div>
    </div>
  );
};

/**
 * Basic three-step wizard without validation.
 * Demonstrates simple step navigation with progress indicator.
 */
export const BasicWizard: Story = {
  args: {
    onComplete: fn(),
  },
  render: (args) => (
    <FormWizard
      steps={[
        { id: "step1", title: "Personal Info" },
        { id: "step2", title: "Contact Details" },
        { id: "step3", title: "Review" },
      ]}
      onComplete={args.onComplete}
      draftKey="storybook-basic-wizard"
    >
      <BasicWizardContent />
    </FormWizard>
  ),
};

// ============================================================================
// Story 2: Validation
// ============================================================================

const ValidationContent = () => {
  const { register, errors, currentStep } = useFormWizard();

  return (
    <div className="w-full max-w-md p-6 border rounded-lg">
      <StepIndicator />
      <h2 className="text-xl font-semibold mb-4">{currentStep.title}</h2>

      <FormStep stepId="personal" className="space-y-4">
        <p className="text-sm text-muted-foreground mb-2">
          All fields are required. Try clicking Next without filling them.
        </p>
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            {...register("firstName")}
            aria-invalid={!!errors.firstName}
            className={errors.firstName ? "border-destructive" : ""}
          />
          {errors.firstName && (
            <p className="text-sm text-destructive">
              {errors.firstName.message as string}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            {...register("lastName")}
            aria-invalid={!!errors.lastName}
            className={errors.lastName ? "border-destructive" : ""}
          />
          {errors.lastName && (
            <p className="text-sm text-destructive">
              {errors.lastName.message as string}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register("email")}
            aria-invalid={!!errors.email}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-sm text-destructive">
              {errors.email.message as string}
            </p>
          )}
        </div>
      </FormStep>

      <FormStep stepId="address" className="space-y-4">
        <p className="text-sm text-muted-foreground mb-2">
          Address validation with specific format requirements.
        </p>
        <div className="space-y-2">
          <Label htmlFor="street">Street Address *</Label>
          <Input
            id="street"
            {...register("street")}
            aria-invalid={!!errors.street}
            className={errors.street ? "border-destructive" : ""}
          />
          {errors.street && (
            <p className="text-sm text-destructive">
              {errors.street.message as string}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            {...register("city")}
            aria-invalid={!!errors.city}
            className={errors.city ? "border-destructive" : ""}
          />
          {errors.city && (
            <p className="text-sm text-destructive">
              {errors.city.message as string}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="zipCode">Zip Code * (5 digits)</Label>
          <Input
            id="zipCode"
            {...register("zipCode")}
            placeholder="12345"
            aria-invalid={!!errors.zipCode}
            className={errors.zipCode ? "border-destructive" : ""}
          />
          {errors.zipCode && (
            <p className="text-sm text-destructive">
              {errors.zipCode.message as string}
            </p>
          )}
        </div>
      </FormStep>

      <FormStep stepId="confirm" className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-medium text-green-800 mb-2"> All Valid</h3>
          <p className="text-sm text-green-700">
            All validation passed. You can now submit the form.
          </p>
        </div>
      </FormStep>

      <div className="mt-6">
        <WizardNavigation />
      </div>
    </div>
  );
};

/**
 * Wizard with per-step Zod validation.
 * Users cannot proceed until all fields pass validation.
 */
export const Validation: Story = {
  args: {
    onComplete: fn(),
  },
  render: (args) => (
    <FormWizard
      steps={[
        {
          id: "personal",
          title: "Personal Info",
          validationSchema: personalInfoSchema,
        },
        {
          id: "address",
          title: "Address",
          validationSchema: addressSchema,
        },
        {
          id: "confirm",
          title: "Confirmation",
        },
      ]}
      onComplete={args.onComplete}
      draftKey="storybook-validation-wizard"
    >
      <ValidationContent />
    </FormWizard>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Per-step Zod validation prevents navigation until all required fields are valid. Error messages appear inline.",
      },
    },
  },
};

// ============================================================================
// Story 3: Error States
// ============================================================================

const ErrorStatesContent = () => {
  const { register, errors, currentStep, stepsWithErrors } = useFormWizard();

  return (
    <div className="w-full max-w-md p-6 border rounded-lg">
      <StepIndicator />
      <h2 className="text-xl font-semibold mb-4">{currentStep.title}</h2>

      {stepsWithErrors.length > 0 && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm font-medium text-destructive">
            Steps with errors: {stepsWithErrors.map((i) => i + 1).join(", ")}
          </p>
        </div>
      )}

      <FormStep stepId="required" className="space-y-4">
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mb-4">
          <p className="text-sm text-amber-800">
            Click "Next" without filling fields to see error states. The step
            indicator will turn red.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="requiredField">Required Field *</Label>
          <Input
            id="requiredField"
            {...register("requiredField")}
            aria-invalid={!!errors.requiredField}
            className={
              errors.requiredField
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
          {errors.requiredField && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <span>✕</span> {errors.requiredField.message as string}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="emailField">Email *</Label>
          <Input
            id="emailField"
            type="email"
            {...register("emailField")}
            aria-invalid={!!errors.emailField}
            className={
              errors.emailField
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
          {errors.emailField && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <span>✕</span> {errors.emailField.message as string}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="minLength">Min 10 Characters *</Label>
          <Input
            id="minLength"
            {...register("minLength")}
            aria-invalid={!!errors.minLength}
            className={
              errors.minLength
                ? "border-destructive focus-visible:ring-destructive"
                : ""
            }
          />
          {errors.minLength && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <span>✕</span> {errors.minLength.message as string}
            </p>
          )}
        </div>
      </FormStep>

      <FormStep stepId="optional" className="space-y-4">
        <div className="p-3 bg-muted rounded-md mb-4">
          <p className="text-sm text-muted-foreground">
            This step has no validation - all fields are optional.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="optional1">Optional Field 1</Label>
          <Input id="optional1" {...register("optional1")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="optional2">Optional Field 2</Label>
          <Input id="optional2" {...register("optional2")} />
        </div>
      </FormStep>

      <FormStep stepId="summary" className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Summary</h3>
          <p className="text-sm text-muted-foreground">
            If you see this step, all previous validations passed!
          </p>
        </div>
      </FormStep>

      <div className="mt-6">
        <WizardNavigation />
      </div>
    </div>
  );
};

/**
 * Demonstrates error state handling and visual feedback.
 * Shows how validation errors affect step indicators.
 */
export const ErrorStates: Story = {
  args: {
    onComplete: fn(),
  },
  render: (args) => (
    <FormWizard
      steps={[
        {
          id: "required",
          title: "Required Fields",
          validationSchema: z.object({
            requiredField: z.string().min(1, "This field is required"),
            emailField: z.string().email("Please enter a valid email address"),
            minLength: z.string().min(10, "Must be at least 10 characters"),
          }),
        },
        {
          id: "optional",
          title: "Optional Fields",
        },
        {
          id: "summary",
          title: "Summary",
        },
      ]}
      onComplete={args.onComplete}
      draftKey="storybook-error-states"
    >
      <ErrorStatesContent />
    </FormWizard>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Error states are tracked per step. The step indicator shows red for steps with validation errors. An error summary banner appears when errors exist.",
      },
    },
  },
};

// ============================================================================
// Story 4: Conditional Steps
// ============================================================================

const ConditionalStepsContent = () => {
  const { register, errors, currentStep, watch, steps, setValue } =
    useFormWizard();
  const needsShipping = watch("needsShipping");
  const hasCoupon = watch("hasCoupon");

  return (
    <div className="w-full max-w-md p-6 border rounded-lg">
      <StepIndicator />
      <h2 className="text-xl font-semibold mb-4">{currentStep.title}</h2>

      <div className="mb-4 p-3 bg-secondary border border-border rounded-md">
        <p className="text-sm text-secondary-foreground">
          Active steps: {steps.length} ({steps.map((s) => s.title).join(" → ")})
        </p>
      </div>

      <FormStep stepId="order-type" className="space-y-4">
        <p className="text-sm text-muted-foreground mb-4">
          Toggle the checkboxes to see steps appear/disappear dynamically.
        </p>
        <div className="space-y-2">
          <Label htmlFor="productName">Product Name *</Label>
          <Input
            id="productName"
            {...register("productName")}
            placeholder="Widget Pro"
            className={errors.productName ? "border-destructive" : ""}
          />
          {errors.productName && (
            <p className="text-sm text-destructive">
              {errors.productName.message as string}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="needsShipping"
            checked={!!needsShipping}
            onCheckedChange={(checked) =>
              setValue("needsShipping", checked === true)
            }
          />
          <Label htmlFor="needsShipping" className="font-normal cursor-pointer">
            I need physical shipping
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasCoupon"
            checked={!!hasCoupon}
            onCheckedChange={(checked) =>
              setValue("hasCoupon", checked === true)
            }
          />
          <Label htmlFor="hasCoupon" className="font-normal cursor-pointer">
            I have a coupon code
          </Label>
        </div>
      </FormStep>

      <FormStep stepId="shipping" className="space-y-4">
        <div className="p-3 bg-accent border border-border rounded-md mb-4">
          <p className="text-sm text-accent-foreground">
            This step only appears when "I need physical shipping" is checked.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="street">Street Address *</Label>
          <Input
            id="street"
            {...register("street")}
            className={errors.street ? "border-destructive" : ""}
          />
          {errors.street && (
            <p className="text-sm text-destructive">
              {errors.street.message as string}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            {...register("city")}
            className={errors.city ? "border-destructive" : ""}
          />
          {errors.city && (
            <p className="text-sm text-destructive">
              {errors.city.message as string}
            </p>
          )}
        </div>
      </FormStep>

      <FormStep stepId="coupon" className="space-y-4">
        <div className="p-3 bg-accent border border-border rounded-md mb-4">
          <p className="text-sm text-accent-foreground">
            This step only appears when "I have a coupon code" is checked.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="couponCode">Coupon Code *</Label>
          <Input
            id="couponCode"
            {...register("couponCode")}
            placeholder="SAVE20"
            className={errors.couponCode ? "border-destructive" : ""}
          />
          {errors.couponCode && (
            <p className="text-sm text-destructive">
              {errors.couponCode.message as string}
            </p>
          )}
        </div>
      </FormStep>

      <FormStep stepId="review" className="space-y-4">
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h3 className="font-medium">Order Summary</h3>
          <p className="text-sm">
            <span className="text-muted-foreground">Shipping:</span>{" "}
            {needsShipping ? "Physical delivery" : "Digital only"}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Coupon:</span>{" "}
            {hasCoupon ? "Applied" : "None"}
          </p>
        </div>
      </FormStep>

      <div className="mt-6">
        <WizardNavigation />
      </div>
    </div>
  );
};

/**
 * Steps can be conditionally shown/hidden based on form data.
 * Toggle checkboxes to see steps dynamically appear/disappear.
 */
export const ConditionalSteps: Story = {
  args: {
    onComplete: fn(),
  },
  render: (args) => (
    <FormWizard
      steps={[
        {
          id: "order-type",
          title: "Order Type",
          validationSchema: z.object({
            productName: z.string().min(1, "Product name is required"),
            needsShipping: z.boolean().optional(),
            hasCoupon: z.boolean().optional(),
          }),
        },
        {
          id: "shipping",
          title: "Shipping",
          validationSchema: z.object({
            street: z.string().min(5, "Street address required"),
            city: z.string().min(2, "City required"),
          }),
          condition: (data) => data.needsShipping === true,
        },
        {
          id: "coupon",
          title: "Coupon",
          validationSchema: z.object({
            couponCode: z.string().min(3, "Enter a valid coupon code"),
          }),
          condition: (data) => data.hasCoupon === true,
        },
        {
          id: "review",
          title: "Review",
        },
      ]}
      onComplete={args.onComplete}
      draftKey="storybook-conditional-steps"
    >
      <ConditionalStepsContent />
    </FormWizard>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Steps with a `condition` function are dynamically shown/hidden based on form data. The step indicator and progress update automatically.",
      },
    },
  },
};
