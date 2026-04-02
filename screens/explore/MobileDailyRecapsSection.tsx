import { DailyRecap, useDailyRecaps } from "@/hooks/useDailyRecaps";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
    ActivityIndicator,
    FlatList,
    Linking,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

function RecapDetailModal({
  recap,
  dark,
  onClose,
}: {
  recap: DailyRecap;
  dark: boolean;
  onClose: () => void;
}) {
  const s = makeStyles(dark);
  const date = recap.date
    ? new Date(recap.date.replace(" +0000 UTC", "Z").replace(" ", "T"))
        .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.modalContainer}>
        <View style={s.modalHeader}>
          <Text style={s.modalDate}>{date}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={dark ? "#EEEEEF" : "#111827"} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={s.modalContent}>
          {recap.items.map((item, index) => (
            <View key={index} style={s.itemCard}>
              <Text style={s.itemText}>{item.text}</Text>
              {item.sources.map((source, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => Linking.openURL(source.url)}
                >
                  <Text style={s.sourceLink} numberOfLines={1}>
                    🔗 {source.url.replace(/^https?:\/\//, "").split("/")[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function RecapCard({
  recap,
  isToday,
  dark,
  onPress,
}: {
  recap: DailyRecap;
  isToday: boolean;
  dark: boolean;
  onPress: () => void;
}) {
  const s = makeStyles(dark);
  const date = recap.date
    ? new Date(recap.date.replace(" +0000 UTC", "Z").replace(" ", "T"))
        .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      <View style={s.cardHeader}>
        <Text style={s.cardDate}>{date}</Text>
        {isToday && (
          <View style={s.todayBadge}>
            <Text style={s.todayText}>Today</Text>
          </View>
        )}
      </View>
      {recap.items.slice(0, 3).map((item, index) => (
        <Text key={index} style={s.cardItem} numberOfLines={2}>
          • {item.text}
        </Text>
      ))}
      {recap.items.length > 3 && (
        <Text style={s.moreText}>+{recap.items.length - 3} more</Text>
      )}
    </TouchableOpacity>
  );
}

export default function MobileDailyRecapsSection() {
  const dark = useColorScheme() === "dark";
  const s = makeStyles(dark);
  const { recaps, isLoading, isLoadingMore, hasMore, loadMore } = useDailyRecaps();
  const [selectedRecap, setSelectedRecap] = useState<DailyRecap | null>(null);

  if (isLoading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={dark ? "#00E5A0" : "#00A372"} />
      </View>
    );
  }

  if (recaps.length === 0) {
    return (
      <View style={s.centered}>
        <Text style={s.emptyText}>No recaps available.</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={recaps}
        keyExtractor={(item) => item.date}
        renderItem={({ item, index }) => (
          <RecapCard
            recap={item}
            isToday={index === 0}
            dark={dark}
            onPress={() => setSelectedRecap(item)}
          />
        )}
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
      {selectedRecap && (
        <RecapDetailModal
          recap={selectedRecap}
          dark={dark}
          onClose={() => setSelectedRecap(null)}
        />
      )}
    </>
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
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    cardDate: {
      fontSize: 12,
      color: dark ? "#666" : "#999",
    },
    todayBadge: {
      backgroundColor: dark ? "#00E5A020" : "#00A37220",
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderWidth: 1,
      borderColor: dark ? "#00E5A0" : "#00A372",
    },
    todayText: {
      fontSize: 11,
      fontWeight: "600",
      color: dark ? "#00E5A0" : "#00A372",
    },
    cardItem: {
      fontSize: 15,
      color: dark ? "#999" : "#555",
      lineHeight: 18,
      marginTop: 4,
    },
    moreText: {
      fontSize: 12,
      color: dark ? "#00E5A0" : "#00A372",
      marginTop: 6,
      fontWeight: "600",
    },
    modalContainer: {
      flex: 1,
      backgroundColor: dark ? "#050B14" : "#F3F4F6",
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: dark ? "#1A1A2E" : "#E5E7EB",
    },
    modalDate: {
      fontSize: 18,
      fontWeight: "700",
      color: dark ? "#EEEEEF" : "#111827",
    },
    modalContent: {
      padding: 16,
      gap: 12,
    },
    itemCard: {
      backgroundColor: dark ? "#0F1923" : "#FFFFFF",
      borderRadius: 12,
      padding: 14,
      gap: 8,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    itemText: {
      fontSize: 16,
      color: dark ? "#EEEEEF" : "#111827",
      lineHeight: 20,
    },
    sourceLink: {
      fontSize: 12,
      color: dark ? "#00E5A0" : "#00A372",
      marginTop: 4,
    },
  });