"use client";

import { Alert } from "antd";
import AuthForm from "@/components/auth/AuthForm";
import { useAuthSubmit } from "@/hooks/useAuthSubmit";

export default function LoginPage() {
  const { loading, error, handleSubmit } = useAuthSubmit("login");

  return (
    <>
      {error ? <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} /> : null}

      {/* Submit flows through auth service and redirects on success. */}
      <AuthForm mode="login" loading={loading} onSubmit={handleSubmit} />
    </>
  );
}
