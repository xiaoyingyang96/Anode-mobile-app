import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

export type MobileSectionId = "assets" | "top_stories" | "daily_recaps" | "policy_updates";

type Section = {
  id: MobileSectionId;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const MOBILE_SECTIONS: Section[] = [
  { id: "assets", label: "Assets", icon: "cash-outline" },
  { id: "top_stories", label: "Top Stories", icon: "newspaper-outline" },
  { id: "daily_recaps", label: "Daily Recaps", icon: "reader-outline" },
  { id: "policy_updates", label: "Policy Updates", icon: "rocket-outline" },
];

type Props = {
  value: MobileSectionId;
  onChange: (id: MobileSectionId) => void;
};

export default function MobileSectionTabs({ value, onChange }: Props) {
  const dark = useColorScheme() === "dark";
  const s = makeStyles(dark);

  return (
    <View style={s.container}>
      {MOBILE_SECTIONS.map((section) => {
        const active = value === section.id;
        return (
          <TouchableOpacity
            key={section.id}
            onPress={() => onChange(section.id)}
            style={[s.tab, active && s.tabActive]}
          >
            <Ionicons
              name={section.icon}
              size={15}
              color={active ? (dark ? "#00E5A0" : "#00A372") : (dark ? "#888" : "#666")}
            />
            <Text style={[s.label, active && s.labelActive]}>
              {section.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 4,
      gap: 6,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: dark ? "#1A1A2E" : "#F0F0F0",
    },
    tabActive: {
      backgroundColor: dark ? "#00E5A020" : "#00A37220",
      borderWidth: 1,
      borderColor: dark ? "#00E5A0" : "#00A372",
    },
    label: {
      fontSize: 12,
      color: dark ? "#888" : "#666",
    },
    labelActive: {
      fontWeight: "600",
      color: dark ? "#00E5A0" : "#00A372",
    },
  });