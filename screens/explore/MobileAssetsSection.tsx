import { AssetRow, useMarketData } from "@/hooks/useMarketData";
import React, { useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

const RANGES = ["1d", "5d", "1mo", "3mo", "1y"];

function AssetCard({ row, dark }: { row: AssetRow; dark: boolean }) {
  const s = makeStyles(dark);
  const isPositive = row.changePct >= 0;

  return (
    <View style={s.card}>
      <View style={s.cardLeft}>
        <Text style={s.symbol}>{row.symbol.toUpperCase()}</Text>
        {row.name && <Text style={s.name}>{row.name}</Text>}
      </View>
      <View style={s.cardRight}>
        <Text style={s.price}>
          ${row.price < 1 ? row.price.toFixed(6) : row.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <View style={[s.changeBadge, isPositive ? s.positive : s.negative]}>
          <Text style={[s.changeText, isPositive ? s.positiveText : s.negativeText]}>
            {isPositive ? "+" : ""}{row.changePct.toFixed(2)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function MobileAssetsSection() {
  const dark = useColorScheme() === "dark";
  const s = makeStyles(dark);
  const [range, setRange] = useState("1d");
  const { rows, isLoading, error, refetch } = useMarketData(range);

  return (
    <View style={{ flex: 1 }}>
      {/* Range selector */}
      <View style={s.rangeRow}>
        {RANGES.map((r) => (
          <TouchableOpacity
            key={r}
            style={[s.rangeBtn, range === r && s.rangeBtnActive]}
            onPress={() => setRange(r)}
          >
            <Text style={[s.rangeText, range === r && s.rangeTextActive]}>
              {r.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={s.centered}>
          <ActivityIndicator size="large" color={dark ? "#00E5A0" : "#00A372"} />
        </View>
      ) : error ? (
        <View style={s.centered}>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={refetch}>
            <Text style={s.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.symbol}
          renderItem={({ item }) => <AssetCard row={item} dark={dark} />}
          contentContainerStyle={s.list}
        />
      )}
    </View>
  );
}

const makeStyles = (dark: boolean) =>
  StyleSheet.create({
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    rangeRow: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
    },
    rangeBtn: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: dark ? "#1A1A2E" : "#F0F0F0",
    },
    rangeBtnActive: {
      backgroundColor: dark ? "#00E5A020" : "#00A37220",
      borderWidth: 1,
      borderColor: dark ? "#00E5A0" : "#00A372",
    },
    rangeText: {
      fontSize: 12,
      color: dark ? "#888" : "#666",
      fontWeight: "600",
    },
    rangeTextActive: {
      color: dark ? "#00E5A0" : "#00A372",
    },
    list: {
      padding: 16,
      gap: 8,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: dark ? "#0F1923" : "#FFFFFF",
      borderRadius: 12,
      padding: 14,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    cardLeft: {
      gap: 2,
    },
    cardRight: {
      alignItems: "flex-end",
      gap: 4,
    },
    symbol: {
      fontSize: 16,
      fontWeight: "700",
      color: dark ? "#EEEEEF" : "#111827",
    },
    name: {
      fontSize: 12,
      color: dark ? "#666" : "#999",
    },
    price: {
      fontSize: 15,
      fontWeight: "600",
      color: dark ? "#EEEEEF" : "#111827",
    },
    changeBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },
    positive: {
      backgroundColor: dark ? "#00E5A020" : "#00A37220",
    },
    negative: {
      backgroundColor: dark ? "#FF3B3020" : "#FF3B3020",
    },
    changeText: {
      fontSize: 12,
      fontWeight: "600",
    },
    positiveText: {
      color: dark ? "#00E5A0" : "#00A372",
    },
    negativeText: {
      color: "#FF3B30",
    },
    errorText: {
      fontSize: 15,
      color: dark ? "#888" : "#666",
      marginBottom: 12,
    },
    retryBtn: {
      borderWidth: 1.5,
      borderColor: dark ? "#00E5A0" : "#00A372",
      borderRadius: 10,
      paddingHorizontal: 24,
      paddingVertical: 10,
    },
    retryText: {
      color: dark ? "#00E5A0" : "#00A372",
      fontWeight: "700",
      fontSize: 15,
    },
  });