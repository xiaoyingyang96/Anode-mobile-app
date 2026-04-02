import MobileAssetsSection from "@/screens/explore/MobileAssetsSection";
import MobileDailyRecapsSection from "@/screens/explore/MobileDailyRecapsSection";
import MobilePolicyUpdatesSection from "@/screens/explore/MobilePolicyUpdatesSection";
import MobileSectionTabs, { MobileSectionId } from "@/screens/explore/MobileSectionTabs";
import MobileTopStoriesSection from "@/screens/explore/MobileTopStoriesSection";
import React, { useState } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function ExploreScreen() {
  const [activeSection, setActiveSection] = useState<MobileSectionId>("assets");
  const dark = useColorScheme() === "dark";
  const s = makeStyles(dark);

  const renderSection = () => {
    switch (activeSection) {
      case "assets":
        return <MobileAssetsSection />;
      case "top_stories":
        return <MobileTopStoriesSection />;
      case "daily_recaps":
        return <MobileDailyRecapsSection />;
      case "policy_updates":
        return <MobilePolicyUpdatesSection />;
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <Text style={s.title}>Explore</Text>
      <MobileSectionTabs value={activeSection} onChange={setActiveSection} />
      <View style={s.content}>
        {renderSection()}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: dark ? "#050B14" : "#F3F4F6",
    },
    title: {
      fontSize: 28,
      fontWeight: "800",
      color: dark ? "#EEEEEF" : "#111827",
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    content: {
      flex: 1,
    },
    placeholder: {
      fontSize: 16,
      color: dark ? "#888" : "#666",
    },
  });