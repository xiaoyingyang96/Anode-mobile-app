import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

import { Button } from "@/components/Button";
import { ErrorMessage } from "@/components/ErrorMessage";
import { FormContainer } from "@/components/FormContainer";
import { Input } from "@/components/Input";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const scheme = useColorScheme();
  const dark = scheme === "dark";
  const styles = makeStyles(dark);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      // TODO: Step 3 - replace signIn with supabase.auth.signInWithPassword
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer
      title="Welcome back"
      subtitle="Sign in to your Anode account"
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

      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={() => router.push("/forgot-password")}
        style={styles.forgotBtn}
      >
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <Button
        label="Sign In"
        onPress={handleLogin}
        loading={loading}
        style={styles.loginBtn}
      />

      <View style={styles.registerRow}>
        <Text style={styles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.registerLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </FormContainer>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    forgotBtn: {
      alignSelf: "flex-end",
      marginBottom: 24,
      marginTop: -8,
    },
    forgotText: {
      fontSize: 13,
      color: dark ? "#00E5A0" : "#00A372",
    },
    loginBtn: {
      marginBottom: 24,
    },
    registerRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    registerText: {
      fontSize: 14,
      color: dark ? "#777777" : "#888888",
    },
    registerLink: {
      fontSize: 14,
      fontWeight: "600",
      color: dark ? "#00E5A0" : "#00A372",
    },
  });
