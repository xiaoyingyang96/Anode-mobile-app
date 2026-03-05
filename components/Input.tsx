import React, { useState } from "react";
import {
  View,
  TextInput as RNTextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ViewStyle,
} from "react-native";

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  error?: string;
  style?: ViewStyle;
}

export const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  error,
  style,
}: InputProps) => {
  const scheme = useColorScheme();
  const dark = scheme === "dark";
  const styles = makeStyles(dark);

  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.wrapper, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, focused && styles.focused, error ? styles.errorBorder : null]}>
        <RNTextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={dark ? "#555" : "#aaa"}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: "500",
      color: dark ? "#aaaaaa" : "#555555",
      marginBottom: 8,
      letterSpacing: 0.4,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: dark ? "#1A1A1A" : "#F5F5F5",
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: dark ? "#2A2A2A" : "#E0E0E0",
      paddingHorizontal: 16,
      height: 52,
    },
    focused: {
      borderColor: dark ? "#00E5A0" : "#00A372",
    },
    errorBorder: {
      borderColor: "#FF4D4D",
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: dark ? "#F0F0F0" : "#1A1A1A",
    },
    eyeBtn: {
      padding: 4,
    },
    eyeText: {
      fontSize: 16,
    },
    errorText: {
      marginTop: 6,
      fontSize: 12,
      color: "#FF4D4D",
    },
  });
