"use client";

import { Button, Form, Input } from "antd";
import type { AuthMode } from "@/lib/auth/auth.types";

export type AuthFormValues = {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
};

type AuthFormProps = {
  mode: AuthMode;
  loading?: boolean;
  onSubmit: (values: AuthFormValues) => void | Promise<void>;
};

export default function AuthForm({ mode, loading, onSubmit }: AuthFormProps) {
  const isRegister = mode === "register";

  return (
    <Form layout="vertical" onFinish={onSubmit} requiredMark={false}>
      {isRegister ? (
        <Form.Item
          label="Full name"
          name="fullName"
          rules={[{ required: true, message: "Please enter your name" }]}
        >
          <Input autoComplete="name" />
        </Form.Item>
      ) : null}

      {isRegister ? (
        <Form.Item
          label="Phone"
          name="phone"
          rules={[{ required: true, message: "Please enter your phone" }]}
        >
          <Input autoComplete="tel" />
        </Form.Item>
      ) : null}

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Please enter your email" },
          { type: "email", message: "Invalid email" },
        ]}
      >
        <Input autoComplete="email" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please enter your password" }]}
      >
        <Input.Password autoComplete={isRegister ? "new-password" : "current-password"} />
      </Form.Item>

      <Button type="primary" htmlType="submit" loading={loading} block>
        {isRegister ? "Create account" : "Sign in"}
      </Button>
    </Form>
  );
}
