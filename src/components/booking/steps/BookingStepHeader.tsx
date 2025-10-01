import React from "react";
import { Plane, CreditCard, CheckCircle2 } from "lucide-react";

interface BookingStepHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
  onStepClick?: (step: number) => void;
  allowStepNavigation?: boolean;
}

export const BookingStepHeader: React.FC<BookingStepHeaderProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
  onStepClick,
  allowStepNavigation = false,
}) => {
  const stepIcons = [Plane, CreditCard, CheckCircle2];

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Đặt vé máy bay</h2>
        <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
          Bước {currentStep} / {totalSteps}
        </span>
      </div>

      <div className="flex items-center justify-between mb-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const Icon = stepIcons[step - 1] || Plane;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center flex-1">
                <button
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-lg scale-110"
                      : isCompleted
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                  } ${
                    allowStepNavigation && isCompleted
                      ? "hover:scale-105 cursor-pointer hover:shadow-md"
                      : "cursor-default"
                  }`}
                  onClick={() =>
                    allowStepNavigation && isCompleted && onStepClick?.(step)
                  }
                  disabled={!allowStepNavigation || !isCompleted}
                  aria-label={`Bước ${step}: ${stepTitles[step - 1]}`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                  )}
                </button>

                <span
                  className={`mt-3 text-sm font-medium text-center transition-all duration-300 ${
                    isCurrent
                      ? "text-foreground font-semibold"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}>
                  {stepTitles[step - 1]}
                </span>
              </div>

              {step < totalSteps && (
                <div className="flex-1 h-0.5 mx-4 mb-8 relative">
                  <div className="absolute inset-0 bg-muted rounded-full" />
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-500 ${
                      isCompleted ? "bg-secondary" : "bg-transparent"
                    }`}
                    style={{
                      width: isCompleted ? "100%" : "0%",
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
