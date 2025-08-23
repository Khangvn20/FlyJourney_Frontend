import React from "react";

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
  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white/90 backdrop-blur-sm p-5 shadow-sm mb-6">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-transparent to-indigo-50/70 opacity-60" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Đặt vé máy bay</h2>
          <span className="text-sm text-gray-600">
            Bước {currentStep} / {totalSteps}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <div key={step} className="flex items-center">
              <button
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                  step === currentStep
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg"
                    : step < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-600"
                } ${
                  allowStepNavigation && step < currentStep
                    ? "hover:scale-110 cursor-pointer"
                    : "cursor-default"
                }`}
                onClick={() =>
                  allowStepNavigation &&
                  step < currentStep &&
                  onStepClick?.(step)
                }
                disabled={!allowStepNavigation || step >= currentStep}>
                {step < currentStep ? "✓" : step}
              </button>
              {step < totalSteps && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    step < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 text-sm text-gray-600">
          {stepTitles[currentStep - 1]}
        </div>
      </div>
    </div>
  );
};
