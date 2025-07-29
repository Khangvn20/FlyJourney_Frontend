import React from "react";
import { Button } from "./ui/button";
import { Code, ArrowLeft } from "lucide-react";
import { shouldShowDevControls } from "../shared/config/devConfig";

interface DevControlsProps {
  showSkipToOTP?: boolean;
  showBackButton?: boolean;
  onSkipToOTP?: () => void;
  onBack?: () => void;
  disabled?: boolean;
}

const DevControls: React.FC<DevControlsProps> = ({
  showSkipToOTP = false,
  showBackButton = false,
  onSkipToOTP,
  onBack,
  disabled = false,
}) => {
  // Don't render anything if dev controls are hidden
  if (!shouldShowDevControls()) {
    return null;
  }

  return (
    <>
      {/* DEV Skip Button */}
      {showSkipToOTP && onSkipToOTP && (
        <div className="mb-4">
          <Button
            onClick={onSkipToOTP}
            variant="outline"
            size="sm"
            disabled={disabled}
            className="bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100">
            <Code className="h-4 w-4 mr-2" />
            DEV: Skip to OTP
          </Button>
        </div>
      )}

      {/* Back Button */}
      {showBackButton && onBack && (
        <div className="mb-4 flex justify-start">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="text-gray-600 hover:text-gray-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      )}
    </>
  );
};

export default DevControls;
