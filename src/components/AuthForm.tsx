import React from "react";
import { Form, Input, Button } from "antd";

const AuthForm: React.FC = () => {
  const onFinish = (values: Record<string, string>) => {
    console.log("Auth values:", values);
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, type: "email" }]}>
        <Input placeholder="you@example.com" />
      </Form.Item>
      <Form.Item name="password" label="Password" rules={[{ required: true }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Login
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AuthForm;
