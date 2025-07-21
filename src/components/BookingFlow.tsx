import React from "react";
import { Steps, Result } from "antd";

const { Step } = Steps;

const BookingFlow: React.FC = () => {
  const currentStep = 1; // mock step

  return (
    <div>
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        <Step title="Select Flight" />
        <Step title="Enter Details" />
        <Step title="Confirm & Pay" />
        <Step title="Complete" />
      </Steps>
      <Result
        status="info"
        title="Booking In Progress"
        subTitle="This is a placeholder for booking flow. Integration in future steps."
      />
    </div>
  );
};

export default BookingFlow;
