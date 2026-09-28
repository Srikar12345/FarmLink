import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  ImageBackground,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ListingCard } from "@/components/ListingCard";
import { useApp, type ProduceCategory } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const categories: {
  key: ProduceCategory | "all";
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}[] = [
  { key: "all", label: "Everything", icon: "basket-outline" },
  { key: "vegetables", label: "Vegetables", icon: "carrot" },
  { key: "fruits", label: "Fruits", icon: "fruit-grapes" },
  { key: "grains", label: "Rice & grains", icon: "grain" },
  { key: "dairy", label: "Dairy", icon: "cow" },
  { key: "herbs", label: "Herbs & spices", icon: "leaf" },
  { key: "seafood", label: "Seafood", icon: "fish" },
  { key: "meat", label: "Meat", icon: "food-drumstick-outline" },
  { key: "other", label: "More", icon: "dots-horizontal" },
];

export default function ConsumerHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { listings, currentUser, getUserOrders } = useApp();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ProduceCategory | "all">("all");
  const [sort, setSort] = useState<"recent" | "name">("recent");
  const columns = width >= 1000 ? 4 : width >= 650 ? 3 : 2;
  const query = search.trim().toLocaleLowerCase();
  const filtered = listings
    .filter(
      (l) =>
        l.isAvailable &&
        l.quantity > 0 &&
        (category === "all" || category === l.category) &&
        [l.produceName, l.shortName, l.farmerName, l.farmerLocation].some(
          (value) => value?.toLocaleLowerCase().includes(query),
        ),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.produceName.localeCompare(b.produceName)
        : (Date.parse(b.harvestTime) || 0) - (Date.parse(a.harvestTime) || 0),
    );
  const activeOrders = getUserOrders().filter(
    (o) => o.status === "pending" || o.status === "picked_up",
  );
  const reset = () => {
    setSearch("");
    setCategory("all");
  };

  return (
    <View
      style={[
        s.root,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === "web" ? 16 : insets.top,
        },
      ]}
    >
      <View style={s.shell}>
        <View style={s.header}>
          <View style={s.brand}>
            <MaterialCommunityIcons
              name="sprout"
              size={30}
              color={colors.primary}
            />
            <Text style={[s.logo, { color: colors.foreground }]}>
              farmlink<Text style={{ color: colors.primary }}>.</Text>
            </Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="View profile and location"
            onPress={() => router.push("/(tabs)/profile")}
            style={s.location}
          >
            <Feather name="map-pin" size={16} color={colors.primary} />
            <View style={{ flexShrink: 1 }}>
              <Text style={[s.eyebrow, { color: colors.mutedForeground }]}>
                YOUR COMMUNITY
              </Text>
              <Text
                numberOfLines={1}
                style={[s.locationText, { color: colors.foreground }]}
              >
                {currentUser?.location || "East Godavari"}
              </Text>
            </View>
            <Feather
              name="chevron-right"
              size={16}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>
        <View
          style={[
            s.search,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="search" size={20} color={colors.primary} />
          <TextInput
            accessibilityLabel="Search produce, farmer or village"
            value={search}
            onChangeText={setSearch}
            placeholder="Find produce, a farmer, or a village"
            placeholderTextColor={colors.mutedForeground}
            style={[s.input, { color: colors.foreground }]}
            returnKeyType="search"
          />
          {!!search && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              onPress={() => setSearch("")}
              style={s.clear}
            >
              <Feather name="x" size={20} color={colors.foreground} />
            </TouchableOpacity>
          )}
        </View>
        <FlatList
          key={columns}
          numColumns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={s.row}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={s.sections}>
              {!query && category === "all" && (
                <ImageBackground
                  source={require("../../assets/images/produce_hero.png")}
                  imageStyle={s.heroImage}
                  style={s.hero}
                >
                  <View style={s.heroShade}>
                    <Text style={s.heroKicker}>ROOTED IN EAST GODAVARI</Text>
                    <Text style={s.heroTitle}>
                      Good food.{"\n"}Closer to its roots.
                    </Text>
                    <Text style={s.heroBody}>
                      Meet the people behind your produce. Choose what belongs
                      on your table.
                    </Text>
                    <View style={s.heroTag}>
                      <MaterialCommunityIcons
                        name="sprout"
                        size={16}
                        color="#DDF3BF"
                      />
                      <Text style={s.heroTagText}>
                        From local growers, with care
                      </Text>
                    </View>
                  </View>
                </ImageBackground>
              )}
              <Text style={[s.demo, { color: colors.mutedForeground }]}>
                Pilot experience · Sample listings and demo checkout
              </Text>
              {activeOrders.length > 0 && (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => router.push("/(tabs)/orders")}
                  style={[s.order, { backgroundColor: colors.secondary }]}
                >
                  <Feather name="package" size={22} color={colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.bold, { color: colors.foreground }]}>
                      {activeOrders.length} active{" "}
                      {activeOrders.length === 1 ? "order" : "orders"}
                    </Text>
                    <Text style={[s.small, { color: colors.mutedForeground }]}>
                      See the latest status and order details
                    </Text>
                  </View>
                  <Feather
                    name="arrow-right"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              )}
              <View>
                <Text style={[s.heading, { color: colors.foreground }]}>
                  What's cooking today?
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.categories}
                >
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      accessibilityRole="button"
                      accessibilityState={{ selected: category === cat.key }}
                      onPress={() => setCategory(cat.key)}
                      style={[
                        s.category,
                        {
                          backgroundColor:
                            category === cat.key ? colors.primary : colors.card,
                          borderColor:
                            category === cat.key
                              ? colors.primary
                              : colors.border,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={cat.icon}
                        size={21}
                        color={category === cat.key ? "#fff" : colors.primary}
                      />
                      <Text
                        style={[
                          s.categoryLabel,
                          {
                            color:
                              category === cat.key ? "#fff" : colors.foreground,
                          },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={s.productHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.heading, { color: colors.foreground }]}>
                    {query
                      ? "Your search results"
                      : category === "all"
                        ? "From our growers"
                        : categories.find((c) => c.key === category)?.label}
                  </Text>
                  <Text
                    accessibilityLiveRegion="polite"
                    style={[s.small, { color: colors.mutedForeground }]}
                  >
                    {filtered.length} available{" "}
                    {filtered.length === 1 ? "listing" : "listings"} · harvest
                    times reported by growers
                  </Text>
                </View>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={`Sort: ${sort === "recent" ? "Latest harvest" : "Name A to Z"}. Tap to change`}
                  onPress={() => setSort(sort === "recent" ? "name" : "recent")}
                  style={[s.sort, { borderColor: colors.border }]}
                >
                  <Feather name="sliders" size={15} color={colors.primary} />
                  <Text style={[s.small, { color: colors.foreground }]}>
                    {sort === "recent" ? "Latest harvest" : "Name A–Z"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={{ width: `${100 / columns}%`, padding: 5 }}>
              <ListingCard listing={item} />
            </View>
          )}
          ListEmptyComponent={
            <View style={[s.empty, { backgroundColor: colors.card }]}>
              <MaterialCommunityIcons
                name="basket-outline"
                size={42}
                color={colors.primary}
              />
              <Text style={[s.heading, { color: colors.foreground }]}>
                Let's find something else
              </Text>
              <Text style={[s.emptyText, { color: colors.mutedForeground }]}>
                No available produce matches these filters. Try another name, or
                tell growers what you need.
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={reset}
                style={[s.action, { backgroundColor: colors.primary }]}
              >
                <Text style={s.actionText}>Clear filters</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => router.push("/(tabs)/requests")}
                style={s.clear}
              >
                <Text style={{ color: colors.primary }}>Request produce →</Text>
              </TouchableOpacity>
            </View>
          }
          ListFooterComponent={
            <View style={s.footer}>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => router.push("/(tabs)/requests")}
                style={[s.request, { backgroundColor: colors.secondary }]}
              >
                <MaterialCommunityIcons
                  name="sprout-outline"
                  size={30}
                  color={colors.primary}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[s.heading, { color: colors.foreground }]}>
                    Your next meal starts with a grower.
                  </Text>
                  <Text style={[s.small, { color: colors.mutedForeground }]}>
                    Can't find an ingredient? Share your demand so farmers can
                    plan what to grow.
                  </Text>
                  <Text style={[s.link, { color: colors.primary }]}>
                    Request produce →
                  </Text>
                </View>
              </TouchableOpacity>
              <View style={s.services}>
                {[
                  {
                    label: "Pickup stations",
                    note: "Explore station availability",
                    route: "/machines",
                    icon: "map-pin",
                  },
                  {
                    label: "Weekly baskets",
                    note: "Plan your regular essentials",
                    route: "/baskets",
                    icon: "calendar",
                  },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.route}
                    accessibilityRole="button"
                    onPress={() => router.push(item.route as any)}
                    style={[
                      s.service,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Feather
                      name={item.icon as "map-pin" | "calendar"}
                      size={22}
                      color={colors.primary}
                    />
                    <Text style={[s.bold, { color: colors.foreground }]}>
                      {item.label}
                    </Text>
                    <Text style={[s.small, { color: colors.mutedForeground }]}>
                      {item.note}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  shell: { flex: 1, width: "100%", maxWidth: 1180, alignSelf: "center" },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 5 },
  logo: { fontSize: 27, fontFamily: "Inter_700Bold", letterSpacing: -1.3 },
  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexShrink: 1,
    minHeight: 44,
  },
  eyebrow: { fontSize: 9, letterSpacing: 1, fontFamily: "Inter_600SemiBold" },
  locationText: { fontSize: 12, fontFamily: "Inter_600SemiBold", marginTop: 3 },
  search: {
    marginHorizontal: 20,
    marginBottom: 16,
    paddingLeft: 15,
    paddingRight: 5,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    paddingVertical: 14,
  },
  clear: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  content: { paddingHorizontal: 15, paddingBottom: 110 },
  row: { alignItems: "stretch" },
  sections: { gap: 20, marginHorizontal: 5, marginBottom: 12 },
  hero: {
    minHeight: 260,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#193D2D",
  },
  heroImage: { borderRadius: 24 },
  heroShade: {
    flex: 1,
    padding: 25,
    backgroundColor: "rgba(8,35,23,0.78)",
    alignItems: "flex-start",
  },
  heroKicker: {
    color: "#DDF3BF",
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: "Inter_600SemiBold",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 34,
    lineHeight: 39,
    letterSpacing: -1.2,
    fontFamily: "Inter_700Bold",
    marginTop: 15,
  },
  heroBody: {
    color: "#F0F3ED",
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 370,
    marginTop: 10,
    fontFamily: "Inter_400Regular",
  },
  heroTag: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    marginTop: 20,
  },
  heroTagText: {
    color: "#DDF3BF",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  heading: {
    fontSize: 19,
    lineHeight: 25,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.4,
  },
  categories: { gap: 8, paddingTop: 13 },
  category: {
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  categoryLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  productHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
  },
  small: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "Inter_400Regular",
    marginTop: 3,
  },
  sort: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    minHeight: 44,
  },
  order: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  bold: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  empty: { padding: 25, alignItems: "center", gap: 12, borderRadius: 20 },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 400,
  },
  action: {
    paddingHorizontal: 24,
    minHeight: 46,
    justifyContent: "center",
    borderRadius: 24,
  },
  actionText: { color: "#fff", fontFamily: "Inter_600SemiBold" },
  footer: { marginHorizontal: 5, gap: 20, marginTop: 28 },
  request: { flexDirection: "row", gap: 15, padding: 22, borderRadius: 20 },
  link: { marginTop: 14, fontFamily: "Inter_700Bold", fontSize: 13 },
  services: { flexDirection: "row", gap: 12 },
  service: { flex: 1, padding: 18, borderRadius: 18, borderWidth: 1, gap: 8 },
  demo: { fontSize: 11, lineHeight: 17, textAlign: "center" },
});
