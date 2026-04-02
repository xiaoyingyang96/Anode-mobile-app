import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";

import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { FormContainer } from "@/components/FormContainer";
import { Input } from "@/components/Input";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError("Password reset coming soon.");
  };

  return (
    <FormContainer
      title="Reset password"
      subtitle="Enter your email to receive a reset link"
    >
      <ErrorMessage message={error} />

      <Input
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Button label="Send Reset Link" onPress={handleReset} loading={loading} />
    </FormContainer>
  );
}
