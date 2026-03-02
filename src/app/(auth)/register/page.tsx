"use client";

import { Alert } from "antd";
import AuthForm from "@/components/auth/AuthForm";
import { useAuthSubmit } from "@/hooks/useAuthSubmit";

export default function RegisterPage() {
  const { loading, error, handleSubmit } = useAuthSubmit("register");

  return (
    <>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}

      {/* Submit flows through auth service and redirects on success. */}
      <AuthForm mode="register" loading={loading} onSubmit={handleSubmit} />
    </>
  );
}
