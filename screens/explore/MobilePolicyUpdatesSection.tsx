import { GovernmentPolicy, useGovPolicies } from "@/hooks/useGovPolicies";
import React from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function PolicyCard({ policy, dark }: { policy: GovernmentPolicy; dark: boolean }) {
  const s = makeStyles(dark);
  const date = policy.published_at
    ? new Date(policy.published_at.replace(" +0000 UTC", "Z").replace(" ", "T"))
        .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => Linking.canOpenURL(policy.url).then(supported => {
        if (supported) Linking.openURL(policy.url);
      })}
      activeOpacity={0.8}
    >
      <Text style={s.cardTitle} numberOfLines={2}>
        {policy.title}
      </Text>
      <Text style={s.cardSummary} numberOfLines={3}>
        {policy.summary}
      </Text>
      <View style={s.cardMeta}>
        <Text style={s.cardPublisher}>{policy.publisher}</Text>
        <Text style={s.cardDate}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MobilePolicyUpdatesSection() {
  const dark = useColorScheme() === "dark";
  const s = makeStyles(dark);
  const { govPolicies, isLoading, isLoadingMore, hasMore, loadMore } = useGovPolicies();

  if (isLoading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={dark ? "#00E5A0" : "#00A372"} />
      </View>
    );
  }

  if (govPolicies.length === 0) {
    return (
      <View style={s.centered}>
        <Text style={s.emptyText}>No policy updates available.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={govPolicies}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PolicyCard policy={item} dark={dark} />}
      contentContainerStyle={s.list}
      onEndReached={hasMore ? loadMore : undefined}
      onEndReachedThreshold={0.3}
      ListFooterComponent={
        isLoadingMore ? (
          <ActivityIndicator
            size="small"
            color={dark ? "#00E5A0" : "#00A372"}
            style={{ marginVertical: 16 }}
          />
        ) : null
      }
    />
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    emptyText: {
      fontSize: 15,
      color: dark ? "#888" : "#666",
    },
    list: {
      padding: 16,
      gap: 12,
    },
    card: {
      backgroundColor: dark ? "#0F1923" : "#FFFFFF",
      borderRadius: 12,
      padding: 14,
      gap: 6,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: dark ? "#EEEEEF" : "#111827",
      lineHeight: 20,
    },
    cardSummary: {
      fontSize: 14,
      color: dark ? "#999" : "#555",
      lineHeight: 18,
    },
    cardMeta: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 4,
    },
    cardPublisher: {
      fontSize: 12,
      fontWeight: "600",
      color: dark ? "#00E5A0" : "#00A372",
    },
    cardDate: {
      fontSize: 12,
      color: dark ? "#666" : "#999",
    },
  });