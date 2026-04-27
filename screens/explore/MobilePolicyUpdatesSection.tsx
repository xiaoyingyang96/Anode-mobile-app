import { WatchlistColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { GovernmentPolicy, useGovPolicies } from "@/hooks/useGovPolicies";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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
  View
} from "react-native";

// function PolicyDetailModal({ policy, dark, onClose }: {
//   policy: GovernmentPolicy;
//   dark: boolean;
//   onClose: () => void;
// }) {
//   const bg = dark ? '#0D1117' : '#FFFFFF';
//   const textMain = dark ? '#EEEEEF' : '#111827';
//   const textSub = dark ? '#AEB0B4' : '#4B5563';
//   const border = dark ? '#1F2937' : '#E5E7EB';

//   const date = policy.published_at
//     ? new Date(policy.published_at.replace(" +0000 UTC", "Z").replace(" ", "T"))
//         .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
//     : "";

//   return (
//     <Modal visible animationType="slide" onRequestClose={onClose}>
//       <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
//         {/* Header */}
//         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: border }}>
//           <TouchableOpacity onPress={onClose}>
//             <Ionicons name="close" size={24} color={textSub} />
//           </TouchableOpacity>
//         </View>

//         <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
//           {/* Title */}
//           <Text style={{ fontSize: 20, fontWeight: '800', color: textMain, lineHeight: 28 }}>
//             {policy.title}
//           </Text>

//           {/* Meta */}
//           <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
//             {policy.publisher && (
//               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
//                 <Ionicons name="business-outline" size={12} color={textSub} />
//                 <Text style={{ fontSize: 12, color: textSub }}>{policy.publisher}</Text>
//               </View>
//             )}
//             {date ? (
//               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
//                 <Ionicons name="calendar-outline" size={12} color={textSub} />
//                 <Text style={{ fontSize: 12, color: textSub }}>{date}</Text>
//               </View>
//             ) : null}
//           </View>

//           {/* Summary */}
//           {policy.summary && (
//             <View style={{ borderRadius: 12, borderWidth: 1, borderColor: border, backgroundColor: dark ? '#111827' : '#F9FAFB', padding: 14, gap: 8 }}>
//               <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
//                 <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: WatchlistColors.primary }} />
//                 <Text style={{ fontSize: 15, fontWeight: '700', color: textMain }}>Summary</Text>
//               </View>
//               <Text style={{ fontSize: 14, color: textSub, lineHeight: 22 }}>{policy.summary}</Text>
//             </View>
//           )}

//           {/* View source button */}
//           <TouchableOpacity
//             onPress={() => Linking.openURL(policy.url)}
//             style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: WatchlistColors.primary, borderRadius: 12, paddingVertical: 14 }}
//             activeOpacity={0.8}
//           >
//             <Ionicons name="open-outline" size={16} color={WatchlistColors.primary} />
//             <Text style={{ fontSize: 15, fontWeight: '700', color: WatchlistColors.primary }}>
//               View source · {policy.url.replace(/https?:\/\//, '').split('/')[0]}
//             </Text>
//           </TouchableOpacity>
//         </ScrollView>
//       </SafeAreaView>
//     </Modal>
//   );
// }
function PolicyDetailModal({ policy, dark, onClose }: {
  policy: GovernmentPolicy;
  dark: boolean;
  onClose: () => void;
}) {
  const bg = dark ? '#0D1117' : '#FFFFFF';
  const textMain = dark ? '#EEEEEF' : '#111827';
  const textSub = dark ? '#AEB0B4' : '#4B5563';
  const border = dark ? '#1F2937' : '#E5E7EB';

  const date = policy.published_at
    ? new Date(policy.published_at.replace(" +0000 UTC", "Z").replace(" ", "T"))
        .toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: border }}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={textSub} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
          {/* Title */}
          <Text style={{ fontSize: 20, fontWeight: '800', color: textMain, lineHeight: 28 }}>
            {policy.title}
          </Text>

          {/* Meta */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {policy.agency_long && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Ionicons name="business-outline" size={12} color={textSub} />
                <Text style={{ fontSize: 12, color: textSub }}>{policy.agency_long}</Text>
              </View>
            )}
            {policy.region && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Ionicons name="location-outline" size={12} color={textSub} />
                <Text style={{ fontSize: 12, color: textSub }}>{policy.region}</Text>
              </View>
            )}
            {date ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: border, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Ionicons name="calendar-outline" size={12} color={textSub} />
                <Text style={{ fontSize: 12, color: textSub }}>{date}</Text>
              </View>
            ) : null}
          </View>

          {/* Content */}
          {policy.content && (
            <View style={{ borderRadius: 12, borderWidth: 1, borderColor: border, backgroundColor: dark ? '#111827' : '#F9FAFB', padding: 14, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: WatchlistColors.primary }} />
                <Text style={{ fontSize: 15, fontWeight: '700', color: textMain }}>Summary</Text>
              </View>
              <Text style={{ fontSize: 14, color: textSub, lineHeight: 22 }}>{policy.content}</Text>
            </View>
          )}

          {/* Tags */}
          {policy.tags && policy.tags.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {policy.tags.map(tag => (
                <View key={tag} style={{ backgroundColor: WatchlistColors.primaryMuted, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: WatchlistColors.primary }}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* View source button */}
          <TouchableOpacity
            onPress={() => Linking.openURL(policy.url)}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderColor: WatchlistColors.primary, borderRadius: 12, paddingVertical: 14 }}
            activeOpacity={0.8}
          >
            <Ionicons name="open-outline" size={16} color={WatchlistColors.primary} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: WatchlistColors.primary }}>
              View source · {policy.url.replace(/https?:\/\//, '').split('/')[0]}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function PolicyCard({ policy, dark, onPress }: {
  policy: GovernmentPolicy;
  dark: boolean;
  onPress: () => void;
}) {
  const s = makeStyles(dark);
  const date = policy.published_at
    ? new Date(policy.published_at.replace(" +0000 UTC", "Z").replace(" ", "T"))
        .toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "";

  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.8}>
      <Text style={s.cardTitle} numberOfLines={2}>{policy.title}</Text>
      <Text style={s.cardSummary} numberOfLines={3}>{policy.content}</Text>
      <View style={s.cardMeta}>
        <Text style={s.cardPublisher}>{policy.agency_short}</Text>
        <Text style={s.cardDate}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MobilePolicyUpdatesSection() {
  const dark = useColorScheme() === "dark";
  const s = makeStyles(dark);
  const { govPolicies, isLoading, isLoadingMore, hasMore, loadMore } = useGovPolicies();
  const [selected, setSelected] = useState<GovernmentPolicy | null>(null);

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
    <>
      <FlatList
        data={govPolicies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PolicyCard policy={item} dark={dark} onPress={() => setSelected(item)} />
        )}
        contentContainerStyle={s.list}
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator size="small" color={dark ? "#00E5A0" : "#00A372"} style={{ marginVertical: 16 }} />
          ) : null
        }
      />
      {selected && (
        <PolicyDetailModal policy={selected} dark={dark} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    centered: { flex: 1, alignItems: "center", justifyContent: "center" },
    emptyText: { fontSize: 15, color: dark ? "#888" : "#666" },
    list: { padding: 16, gap: 12 },
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
    cardTitle: { fontSize: 15, fontWeight: "700", color: dark ? "#EEEEEF" : "#111827", lineHeight: 20 },
    cardSummary: { fontSize: 14, color: dark ? "#999" : "#555", lineHeight: 18 },
    cardMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
    cardPublisher: { fontSize: 12, fontWeight: "600", color: dark ? "#00E5A0" : "#00A372" },
    cardDate: { fontSize: 12, color: dark ? "#666" : "#999" },
  });