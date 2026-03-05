import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  ViewStyle,
  TextStyle,
} from "react-native";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button = ({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
}: ButtonProps) => {
  const scheme = useColorScheme();
  const dark = scheme === "dark";
  const styles = makeStyles(dark);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#fff" : dark ? "#00E5A0" : "#00A372"}
          size="small"
        />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label` as keyof typeof styles] as TextStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    base: {
      height: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    primary: {
      backgroundColor: dark ? "#00E5A0" : "#00A372",
    },
    secondary: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: dark ? "#00E5A0" : "#00A372",
    },
    ghost: {
      backgroundColor: "transparent",
    },
    disabled: {
      opacity: 0.4,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    primaryLabel: {
      color: dark ? "#0A0A0A" : "#ffffff",
    },
    secondaryLabel: {
      color: dark ? "#00E5A0" : "#00A372",
    },
    ghostLabel: {
      color: dark ? "#aaaaaa" : "#555555",
    },
  });
