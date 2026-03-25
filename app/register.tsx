import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, useColorScheme, View, StyleSheet } from "react-native";

import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { FormContainer } from "@/components/FormContainer";
import { Input } from "@/components/Input";

export default function RegisterScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const dark = scheme === "dark";
  const styles = makeStyles(dark);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("Registration coming soon.");
  };

  return (
    <FormContainer title="Create account" subtitle="Sign up for Anode">
      <ErrorMessage message={error} />

      <Input
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Password"
        placeholder="Choose a password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        label="Sign Up"
        onPress={handleRegister}
        loading={loading}
        style={styles.btn}
      />

      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.replace("/login")}>
          <Text style={styles.loginLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </FormContainer>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    btn: {
      marginBottom: 24,
    },
    loginRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    loginText: {
      fontSize: 14,
      color: dark ? "#777777" : "#888888",
    },
    loginLink: {
      fontSize: 14,
      fontWeight: "600",
      color: dark ? "#00E5A0" : "#00A372",
    },
  });
