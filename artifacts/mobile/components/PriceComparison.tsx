import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  produceName: string;
  farmLinkPrice: number;
  priceUnit: string;
  category?: string;
}

// Keep the component contract stable; competitor prices require dated, comparable sources.
export function PriceComparison({ farmLinkPrice, priceUnit }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.row}>
        <MaterialCommunityIcons
          name="receipt-text-outline"
          size={22}
          color={colors.primary}
        />
        <Text style={[styles.title, { color: colors.foreground }]}>
          Know what you're paying
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.mutedForeground }]}>
          Listed produce price
        </Text>
        <Text style={[styles.price, { color: colors.primary }]}>
          ₹{farmLinkPrice}/{priceUnit}
        </Text>
      </View>
      <Text style={[styles.note, { color: colors.mutedForeground }]}>
        Delivery and any refundable packaging deposit are shown separately
        before you confirm your order.
      </Text>
      <Text style={[styles.note, { color: colors.mutedForeground }]}>
        Compare the same variety, grade and unit when shopping elsewhere. We
        don't have verified live market prices to promise a saving.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 14 },
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8 },
  title: { fontSize: 15, fontFamily: "Inter_600SemiBold", flexShrink: 1 },
  label: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  price: { fontSize: 20, fontFamily: "Inter_700Bold" },
  note: { fontSize: 12, lineHeight: 19, fontFamily: "Inter_400Regular" },
});
