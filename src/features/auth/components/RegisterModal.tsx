import React, { useState } from 'react';
import { Modal } from 'antd';
import { RegisterForm } from './RegisterForm';
import { OtpVerification } from './OtpVerification';

interface RegisterModalProps {
  visible: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}



export const RegisterModal: React.FC<RegisterModalProps> = ({ 
  visible, 
  onClose, 
  onSwitchToLogin 
}) => {
const [userEmail, setUserEmail] = useState('');
const [userName, setUserName] = useState('');
const [userPassword, setUserPassword] = useState('');
const [currentStep, setCurrentStep] = useState<'register' | 'otp'>('register');


  const handleOtpSuccess = () => {
    // Registration and verification complete
    console.log('Registration completed for:', userEmail);
    handleClose();
    // You might want to auto-login the user here or show a success message
  };

  const handleBackToRegister = () => {
    setCurrentStep('register');
  };

  const handleClose = () => {
    setCurrentStep('register');
    setUserEmail('');
    onClose();
  };

  const getModalTitle = () => {
    switch (currentStep) {
      case 'register':
        return 'Đăng Ký';
      case 'otp':
        return 'Xác Minh Email';
      default:
        return 'Đăng Ký';
    }
  };

  return (
    <Modal
      title={getModalTitle()}
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={480}
      centered
      destroyOnClose
      className="register-modal"
    >
      {currentStep === 'register' && (
       <RegisterForm
      onSuccess={(email: string, name: string, password: string) => {
       setUserEmail(email);
      setUserName(name);
      setUserPassword(password);
     setCurrentStep('otp');
  }}
  onClose={handleClose}
  onSwitchToLogin={onSwitchToLogin}
/>
      )}
      
      {currentStep === 'otp' && (
        <OtpVerification
           email={userEmail}
    name={userName}
    password={userPassword}
    onSuccess={handleOtpSuccess}
    onBack={handleBackToRegister}
    onClose={handleClose}
        />
      )}
    </Modal>
  );
};
