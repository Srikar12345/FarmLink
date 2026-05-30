import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';

import { useApp } from '@/context/AppContext';
import { useColors } from '@/hooks/useColors';
import { UPICheckout } from '@/components/UPICheckout';

export default function QuickBuy() {
  const { crop } = useLocalSearchParams<{ crop: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { listings, currentUser, createOrder } = useApp();

  const [loadingLocation, setLoadingLocation] = useState(true);
  const [userLocName, setUserLocName] = useState('Detecting location...');
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutAmount, setCheckoutAmount] = useState(0);

  const topPad = Platform.OS === 'web' ? 40 : insets.top;

  // 1. Detect location automatically
  useEffect(() => {
    async function getLoc() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setUserLocName('East Godavari mandal (Default)');
          setLoadingLocation(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        
        // Reverse geocode to get name
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });

        if (geocode) {
          const locString = [geocode.district, geocode.city || geocode.subregion]
            .filter(Boolean)
            .join(', ');
          setUserLocName(locString || 'East Godavari, AP');
        } else {
          setUserLocName('East Godavari, AP');
        }
      } catch (err) {
        setUserLocName('East Godavari, AP');
      } finally {
        setLoadingLocation(false);
      }
    }
    getLoc();
  }, []);

  // Filter listings matching this crop name (or general search)
  const queryCrop = crop || 'Rice';
  const matchingListings = listings.filter((l) =>
    l.produceName.toLowerCase().includes(queryCrop.toLowerCase()) && l.isAvailable
  );

  // Mock distance calculations (since we represent locations as strings)
  const getMockDistance = (farmerLoc: string) => {
    if (farmerLoc.toLowerCase().includes('razole')) return 2.4;
    if (farmerLoc.toLowerCase().includes('amalapuram')) return 6.8;
    if (farmerLoc.toLowerCase().includes('rajamahendravaram') || farmerLoc.toLowerCase().includes('rajahmundry')) return 12.5;
    if (farmerLoc.toLowerCase().includes('kakinada')) return 18.2;
    return 8.5; // default fallback km
  };

  const handleQuickPurchase = (listingId: string, price: number) => {
    setSelectedListingId(listingId);
    // instant order for 1 unit (e.g. 1 bag or 1 kg depending on listing)
    const packagingDeposit = 25; // standard deposit
    const deliveryFee = 20; // flat rate for quick buy
    setCheckoutAmount(price + deliveryFee + packagingDeposit);
    setShowCheckout(true);
  };

  const handleSuccess = () => {
    setShowCheckout(false);
    if (selectedListingId) {
      createOrder({
        listingId: selectedListingId,
        consumerAddress: currentUser?.savedAddress?.fullAddress || 'Quick Buy Address, East Godavari',
        quantity: 1,
      });
      alert('⚡ Instant order placed! FarmLink rider dispatched to your location.');
      router.replace('/(tabs)/orders');
    }
  };

  const selectedListing = listings.find(l => l.id === selectedListingId);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>FarmLink Instant Buy</Text>
          <View style={{ width: 40 }} />
        </View>
        
        {/* Live Location Chip */}
        <View style={[styles.locRow, { backgroundColor: colors.secondary }]}>
          {loadingLocation ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MaterialCommunityIcons name="map-marker-radius" size={16} color={colors.primary} />
          )}
          <Text style={[styles.locText, { color: colors.mutedForeground }]}>
            {loadingLocation ? ' Locating you...' : ` Delivery to: ${userLocName}`}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Crop Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary + '08', borderColor: colors.primary + '20' }]}>
          <View style={[styles.heroBadge, { backgroundColor: colors.primary + '20' }]}>
            <MaterialCommunityIcons name="grain" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>{queryCrop}</Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>
            Comparing active farm stocks for your location
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Available Live Stocks & Delivery Options
        </Text>

        {matchingListings.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="store-off-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No active stock found for "{queryCrop}" nearby.
            </Text>
          </View>
        ) : (
          matchingListings.map((item) => {
            const dist = getMockDistance(item.farmerLocation);
            const deliveryMinutes = Math.round(15 + dist * 3);
            return (
              <View
                key={item.id}
                style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                {/* Farmer Info & Distance */}
                <View style={styles.itemHeader}>
                  <View>
                    <Text style={[styles.farmerName, { color: colors.foreground }]}>{item.farmerName}</Text>
                    <Text style={[styles.farmerLoc, { color: colors.mutedForeground }]}>
                      {item.farmerLocation} · {dist} km away
                    </Text>
                  </View>
                  <View style={[styles.stockBadge, { backgroundColor: '#16A34A12' }]}>
                    <Text style={[styles.stockText, { color: '#16A34A' }]}>
                      {item.quantity} {item.quantityUnit} left
                    </Text>
                  </View>
                </View>

                {/* Pricing & Speed comparison */}
                <View style={styles.specsRow}>
                  <View style={styles.spec}>
                    <Feather name="truck" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.specText, { color: colors.mutedForeground }]}>
                      Delivers in {deliveryMinutes} mins
                    </Text>
                  </View>
                  <View style={styles.spec}>
                    <MaterialCommunityIcons name="tag-outline" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.specText, { color: colors.mutedForeground }]}>
                      ₹{item.price}/{item.priceUnit}
                    </Text>
                  </View>
                </View>

                {/* Action Buttons Linktree-Style */}
                <View style={styles.actions}>
                  {/* Instant Order Button */}
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#072654' }]}
                    onPress={() => handleQuickPurchase(item.id, item.price)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name="flash" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Instant Buy (₹{item.price})</Text>
                  </TouchableOpacity>

                  {/* Pick up Direct / View Details Button */}
                  <TouchableOpacity
                    style={[styles.secondaryBtn, { borderColor: colors.border }]}
                    onPress={() => router.push(`/listing/${item.id}`)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>
                      View Farmer details & Eco-Packaging
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* UPI Checkout Drawer */}
      {selectedListing && (
        <UPICheckout
          visible={showCheckout}
          amount={checkoutAmount}
          produceName={selectedListing.produceName}
          onSuccess={handleSuccess}
          onDismiss={() => setShowCheckout(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
  },
  locText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  scroll: {
    padding: 20,
    gap: 16,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  heroSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 8,
  },
  itemCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  farmerName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  farmerLoc: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  specsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  spec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  actions: {
    gap: 8,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  secondaryBtn: {
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});
