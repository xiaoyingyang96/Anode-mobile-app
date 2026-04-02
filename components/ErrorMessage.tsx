import React from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { View, Text, StyleSheet } from "react-native";

interface ErrorMessageProps {
  message: string | null | undefined;
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  const scheme = useColorScheme();
  const dark = scheme === "dark";
  const styles = makeStyles(dark);

  if (!message) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: dark ? "#2A1010" : "#FFF0F0",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: dark ? "#5A2020" : "#FFD0D0",
      paddingHorizontal: 14,
      paddingVertical: 12,
      marginBottom: 16,
      gap: 8,
    },
    icon: {
      fontSize: 14,
    },
    message: {
      flex: 1,
      fontSize: 13,
      color: dark ? "#FF8080" : "#CC0000",
      lineHeight: 18,
    },
  });
