import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

interface FormContainerProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const FormContainer = ({
  title,
  subtitle,
  children,
  style,
}: FormContainerProps) => {
  const scheme = useColorScheme();
  const dark = scheme === "dark";
  const styles = makeStyles(dark);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, style]}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: dark ? "#0A0A0A" : "#FFFFFF",
    },
    scroll: {
      flexGrow: 1,
      justifyContent: "center",
    },
    container: {
      paddingHorizontal: 24,
      paddingVertical: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: dark ? "#F0F0F0" : "#0A0A0A",
      marginBottom: 8,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 15,
      color: dark ? "#777777" : "#888888",
      marginBottom: 32,
      lineHeight: 22,
    },
  });
