import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FreshnessTag } from "@/components/FreshnessTag";
import {
  useApp,
  type Listing,
  type ProduceCategory,
} from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const CATEGORY_COLORS: Record<ProduceCategory, string> = {
  vegetables: "#16A34A",
  fruits: "#EA580C",
  grains: "#B45309",
  dairy: "#2563EB",
  herbs: "#7C3AED",
  seafood: "#0891B2",
  meat: "#DC2626",
  other: "#6B7280",
};
const CATEGORY_ICONS: Record<
  ProduceCategory,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  vegetables: "carrot",
  fruits: "fruit-grapes",
  grains: "grain",
  dairy: "cow",
  herbs: "leaf",
  seafood: "fish",
  meat: "food-drumstick-outline",
  other: "basket",
};

function MyListingCard({ listing }: { listing: Listing }) {
  const colors = useColors();
  const iconColor = CATEGORY_COLORS[listing.category];
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      {listing.imageUri ? (
        <Image
          source={
            typeof listing.imageUri === "string"
              ? { uri: listing.imageUri }
              : (listing.imageUri as number)
          }
          style={styles.cardThumb}
        />
      ) : (
        <View style={[styles.cardIcon, { backgroundColor: iconColor + "18" }]}>
          <MaterialCommunityIcons
            name={CATEGORY_ICONS[listing.category]}
            size={28}
            color={iconColor}
          />
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardTop}>
          <Text
            style={[styles.cardName, { color: colors.foreground }]}
            numberOfLines={1}
          >
            {listing.shortName ?? listing.produceName}
          </Text>
          <Text style={[styles.cardPrice, { color: colors.primary }]}>
            ₹{listing.price}/{listing.priceUnit}
          </Text>
        </View>
        <Text style={[styles.cardQty, { color: colors.mutedForeground }]}>
          {listing.quantity} {listing.quantityUnit} available
        </Text>
        <FreshnessTag harvestTime={listing.harvestTime} />
      </View>
      <View
        style={[
          styles.activeDot,
          { backgroundColor: listing.isAvailable ? "#16A34A" : "#9CA3AF" },
        ]}
      />
    </View>
  );
}

export default function FarmerHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    currentUser,
    getFarmerListings,
    getFarmerOrders,
    logout,
    updateRole,
    machines,
    restockMachine,
    getFarmerPayouts,
    cropRequests,
  } = useApp();

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/phone");
  };

  const handleSwitchRole = () => {
    Alert.alert("Switch Role", "Choose a different role to use FarmLink as:", [
      {
        text: "🛒 Consumer — Buy Fresh",
        onPress: async () => {
          await updateRole("consumer");
          router.replace("/(tabs)" as any);
        },
      },
      {
        text: "🏍️ Rider — Deliver & Earn",
        onPress: async () => {
          await updateRole("rider");
          router.replace("/(rider)" as any);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const myListings = getFarmerListings();
  const myOrders = getFarmerOrders();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const pendingOrders = myOrders.filter((o) => o.status === "pending").length;
  const deliveredOrders = myOrders.filter(
    (o) => o.status === "delivered",
  ).length;
  const totalRevenue = myOrders
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + o.totalPrice, 0);

  const openRequests = cropRequests.filter(
    (request) => request.status === "open",
  );

  // This month
  const now = new Date();
  const thisMonthRevenue = myOrders
    .filter((o) => {
      const d = new Date(o.createdAt ?? Date.now());
      return (
        o.status === "delivered" &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, o) => s + o.totalPrice, 0);
  const payout = getFarmerPayouts();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <FlatList
        data={myListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingTop: topPad + 16, paddingBottom: 110 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            {/* Name + actions */}
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.greeting, { color: colors.mutedForeground }]}
                >
                  Farmer Dashboard
                </Text>
                <Text style={[styles.name, { color: colors.foreground }]}>
                  {currentUser?.name}
                </Text>
                {currentUser?.location && (
                  <View style={styles.locRow}>
                    <Feather
                      name="map-pin"
                      size={12}
                      color={colors.mutedForeground}
                    />
                    <Text
                      style={[styles.loc, { color: colors.mutedForeground }]}
                    >
                      {currentUser.location}
                    </Text>
                  </View>
                )}
              </View>
              <View style={styles.headerActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.switchBtn,
                    { borderColor: colors.border, opacity: pressed ? 0.6 : 1 },
                  ]}
                  onPress={handleSwitchRole}
                >
                  <MaterialCommunityIcons
                    name="swap-horizontal"
                    size={14}
                    color={colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.switchBtnText,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    Switch
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.logoutBtn,
                    {
                      borderColor: colors.destructive + "50",
                      backgroundColor: colors.destructive + "08",
                      opacity: pressed ? 0.6 : 1,
                    },
                  ]}
                  onPress={handleLogout}
                >
                  <MaterialCommunityIcons
                    name="logout"
                    size={14}
                    color={colors.destructive}
                  />
                </Pressable>
              </View>
            </View>

            {/* ── Zero-commission hero banner ── */}
            <View style={[styles.zeroBanner, { backgroundColor: "#052E16" }]}>
              <View style={styles.zeroBannerTop}>
                <View style={[styles.zeroChip, { backgroundColor: "#16A34A" }]}>
                  <MaterialCommunityIcons
                    name="percent-circle-outline"
                    size={13}
                    color="#fff"
                  />
                  <Text style={styles.zeroChipText}>
                    YOUR FARM. YOUR CUSTOMERS.
                  </Text>
                </View>
              </View>
              <Text style={styles.zeroTitle}>
                ₹{totalRevenue > 0 ? totalRevenue.toLocaleString("en-IN") : "—"}
              </Text>
              <Text style={styles.zeroSub}>
                Completed produce value · demo ledger
              </Text>
              <View style={styles.zeroDivider} />
              <View style={styles.zeroRow}>
                <View style={styles.zeroStat}>
                  <Text style={styles.zeroStatVal}>{deliveredOrders}</Text>
                  <Text style={styles.zeroStatLabel}>Completed orders</Text>
                </View>
                <View style={[styles.zeroStatDivider]} />
                <View style={styles.zeroStat}>
                  <Text style={styles.zeroStatVal}>{openRequests.length}</Text>
                  <Text style={styles.zeroStatLabel}>Open buyer requests</Text>
                </View>
                <View style={[styles.zeroStatDivider]} />
                <View style={styles.zeroStat}>
                  <Text style={styles.zeroStatVal}>
                    ₹
                    {thisMonthRevenue > 0
                      ? thisMonthRevenue.toLocaleString("en-IN")
                      : "0"}
                  </Text>
                  <Text style={styles.zeroStatLabel}>This month</Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.directPayCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.directPayTop}>
                <View style={styles.directPayTitleRow}>
                  <MaterialCommunityIcons
                    name="bank-transfer-in"
                    size={19}
                    color={colors.freshGreen}
                  />
                  <Text
                    style={[
                      styles.directPayTitle,
                      { color: colors.foreground },
                    ]}
                  >
                    Produce value ledger
                  </Text>
                </View>
                <View
                  style={[
                    styles.zeroPill,
                    { backgroundColor: colors.freshGreenBg },
                  ]}
                >
                  <Text
                    style={[styles.zeroPillText, { color: colors.freshGreen }]}
                  >
                    0% platform fee
                  </Text>
                </View>
              </View>
              <Text
                style={[styles.directPayAmount, { color: colors.freshGreen }]}
              >
                ₹{payout.gross.toLocaleString("en-IN")}
              </Text>
              <Text
                style={[styles.directPaySub, { color: colors.mutedForeground }]}
              >
                recorded produce value · bank settlement not verified ·{" "}
                {payout.orders} completed order{payout.orders === 1 ? "" : "s"}
              </Text>
              <View
                style={[styles.paymentLine, { borderColor: colors.border }]}
              >
                <Text
                  style={[
                    styles.paymentLineText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Pilot ledger · payment confirmation pending
                </Text>
                <Text
                  style={[
                    styles.paymentLineValue,
                    { color: colors.foreground },
                  ]}
                >
                  Demo
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.restockCard,
                { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.restockTitle}>
                  🏧 Fresh Station operations
                </Text>
                <Text style={styles.restockSub}>
                  Complete a hygiene check before every smart restock. Low stock
                  is prioritised using demand and shelf-life.
                </Text>
              </View>
              <View style={{ gap: 6 }}>
                {machines.filter((machine) => machine.status === "low")
                  .length === 0 ? (
                  <Text style={styles.restockOk}>All stocked</Text>
                ) : (
                  machines
                    .filter((machine) => machine.status === "low")
                    .map((machine) => (
                      <TouchableOpacity
                        key={machine.id}
                        style={styles.restockAction}
                        onPress={() => restockMachine(machine.id)}
                      >
                        <Text style={styles.restockActionText}>
                          Restock {machine.name}
                        </Text>
                      </TouchableOpacity>
                    ))
                )}
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.statNum, { color: colors.primary }]}>
                  {myListings.length}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.mutedForeground }]}
                >
                  Listings
                </Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.statNum, { color: "#D97706" }]}>
                  {pendingOrders}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.mutedForeground }]}
                >
                  Pending
                </Text>
              </View>
              <View
                style={[
                  styles.statCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.statNum, { color: "#16A34A" }]}>
                  {deliveredOrders}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.mutedForeground }]}
                >
                  Delivered
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.statCard,
                  { backgroundColor: "#0C4A6E", borderColor: "#0369A1" },
                ]}
                onPress={() => router.push("/machines" as any)}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 20 }}>🏧</Text>
                <Text style={[styles.statLabel, { color: "#7DD3FC" }]}>
                  Machines
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Predictive demand section ── */}
            <View
              style={[
                styles.predictCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <View style={styles.predictHeader}>
                <MaterialCommunityIcons
                  name="chart-line"
                  size={18}
                  color="#7C3AED"
                />
                <Text
                  style={[styles.predictTitle, { color: colors.foreground }]}
                >
                  Find your next customer
                </Text>
                <View style={[styles.aiBadge, { backgroundColor: "#EDE9FE" }]}>
                  <Text style={[styles.aiBadgeText, { color: "#7C3AED" }]}>
                    Buyer requests
                  </Text>
                </View>
              </View>
              <Text
                style={[styles.predictSub, { color: colors.mutedForeground }]}
              >
                Requests in this pilot, including sample demand. Confirm
                quantity and timing with buyers before planting.
              </Text>
              <View style={styles.predictList}>
                {openRequests.slice(0, 3).map((request) => (
                  <TouchableOpacity
                    key={request.id}
                    accessibilityRole="button"
                    onPress={() => router.push("/(farmer)/demand")}
                    style={[styles.predictItem, { borderColor: colors.border }]}
                  >
                    <MaterialCommunityIcons
                      name="sprout"
                      size={25}
                      color={colors.primary}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.predictCrop,
                          { color: colors.foreground },
                        ]}
                      >
                        {request.produceName}
                      </Text>
                      <Text
                        style={[
                          styles.predictReason,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {request.quantityNeeded} {request.quantityUnit} ·{" "}
                        {request.requesterLocation}
                      </Text>
                      <Text
                        style={[
                          styles.predictReason,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        Budget ₹{request.maxPricePerUnit}/{request.priceUnit} ·{" "}
                        {request.frequency}
                      </Text>
                    </View>
                    <Feather
                      name="arrow-right"
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                ))}
                {openRequests.length === 0 && (
                  <Text
                    style={[
                      styles.predictSub,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    No open requests yet. Keep your listings up to date so
                    buyers can find your harvest.
                  </Text>
                )}
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => router.push("/(farmer)/demand")}
                  style={{ minHeight: 44, justifyContent: "center" }}
                >
                  <Text
                    style={{
                      color: colors.primary,
                      fontFamily: "Inter_600SemiBold",
                    }}
                  >
                    Explore buyer demand →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* My Listings header */}
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                My Listings
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(farmer)/add")}
                activeOpacity={0.8}
              >
                <Text style={[styles.addBtn, { color: colors.primary }]}>
                  + Add New
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="sprout"
              size={52}
              color={colors.border}
            />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No listings yet
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Start by adding your first produce listing
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(farmer)/add")}
              activeOpacity={0.85}
            >
              <Text style={[styles.emptyBtnText, { color: "#fff" }]}>
                Add First Listing
              </Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => <MyListingCard listing={item} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 20 },
  headerContent: { gap: 16, marginBottom: 8 },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginTop: 4,
  },
  switchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  switchBtnText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  logoutBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  greeting: { fontSize: 12, fontFamily: "Inter_400Regular" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", marginTop: 2 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  loc: { fontSize: 12, fontFamily: "Inter_400Regular" },

  /* zero banner */
  zeroBanner: { borderRadius: 20, padding: 18, gap: 6 },
  zeroBannerTop: { marginBottom: 4 },
  zeroChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  zeroChipText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 0.8,
  },
  zeroTitle: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#fff" },
  zeroSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "#86EFAC" },
  zeroDivider: { height: 1, backgroundColor: "#166534", marginVertical: 8 },
  zeroRow: { flexDirection: "row", justifyContent: "space-between" },
  zeroStat: { flex: 1, alignItems: "center", gap: 2 },
  zeroStatVal: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#BBF7D0" },
  zeroStatLabel: {
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    color: "#86EFAC",
    textAlign: "center",
  },
  zeroStatDivider: { width: 1, backgroundColor: "#166534", marginVertical: 2 },
  directPayCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 6 },
  directPayTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  directPayTitleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  directPayTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  zeroPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16 },
  zeroPillText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  directPayAmount: { fontSize: 24, fontFamily: "Inter_700Bold" },
  directPaySub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  paymentLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    paddingTop: 9,
    marginTop: 3,
  },
  paymentLineText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  paymentLineValue: { fontSize: 11, fontFamily: "Inter_700Bold" },
  restockCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 15,
    borderWidth: 1,
    padding: 13,
  },
  restockTitle: { color: "#1E3A8A", fontSize: 13, fontFamily: "Inter_700Bold" },
  restockSub: {
    color: "#1D4ED8",
    fontSize: 10,
    lineHeight: 15,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
  },
  restockOk: { color: "#166534", fontSize: 11, fontFamily: "Inter_700Bold" },
  restockAction: {
    backgroundColor: "#2563EB",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  restockActionText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },

  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  statNum: { fontSize: 24, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },

  /* predict */
  predictCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  predictHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  predictTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  aiBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  aiBadgeText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  predictSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  predictList: { gap: 10 },
  predictItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  predictCrop: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  predictReason: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  growChip: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20 },
  growChipText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  addBtn: { fontSize: 14, fontFamily: "Inter_600SemiBold" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  cardThumb: { width: 56, height: 56, borderRadius: 10 },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardContent: { flex: 1, gap: 4 },
  cardTop: { flexDirection: "row", justifyContent: "space-between" },
  cardName: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  cardPrice: { fontSize: 14, fontFamily: "Inter_700Bold" },
  cardQty: { fontSize: 12, fontFamily: "Inter_400Regular" },
  activeDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },

  empty: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyDesc: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  emptyBtn: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
