import { NewsStory, useTopStories } from "@/hooks/useTopStories";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

function NewsCard({ story, dark }: { story: NewsStory; dark: boolean }) {
  const s = makeStyles(dark);
  const raw = story.published_at;
  const date = raw
    ? new Date(raw.replace(" +0000 UTC", "Z").replace(" ", "T")).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  return (
    <TouchableOpacity
      style={s.card}
      onPress={() => Linking.openURL(story.url)}
      activeOpacity={0.8}
    >
      <Text style={s.cardTitle} numberOfLines={2}>
        {story.title}
      </Text>
      <Text style={s.cardSummary} numberOfLines={3}>
        {story.summary}
      </Text>
      <View style={s.cardMeta}>
        <Text style={s.cardPublisher}>{story.publisher}</Text>
        <Text style={s.cardDate}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MobileTopStoriesSection() {
  const dark = useColorScheme() === "dark";
  const s = makeStyles(dark);
  const { news, isLoading, isLoadingMore, hasMore, loadMore } = useTopStories();

  if (isLoading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={dark ? "#00E5A0" : "#00A372"} />
      </View>
    );
  }

  if (news.length === 0) {
    return (
      <View style={s.centered}>
        <Text style={s.emptyText}>No stories available.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={news}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <NewsCard story={item} dark={dark} />}
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
      fontSize: 13,
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