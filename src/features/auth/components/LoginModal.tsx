import React from 'react';
import { Modal } from 'antd';
import { LoginForm } from './LoginForm';

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      open={visible} // Sử dụng prop 'open' thay vì 'visible' với Ant Design v5
      onCancel={onClose}
      footer={null}
      width={400}
      destroyOnClose
      className="auth-modal"
      maskClosable={true}
      bodyStyle={{ 
        padding: 0,
        background: '#1e293b',
        borderRadius: '8px'
      }}
      style={{
        top: '20%',
        zIndex: 1000
      }}
      wrapClassName="dark-theme-modal"
    >
      <LoginForm onClose={onClose} />
    </Modal>
  );
};
