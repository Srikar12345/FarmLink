import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiPost } from '@/utils/api';

export type UserRole = 'farmer' | 'consumer' | 'rider' | 'business';
export type OrderStatus = 'pending' | 'picked_up' | 'delivered' | 'cancelled';
export type ProduceCategory = 'vegetables' | 'fruits' | 'grains' | 'dairy' | 'herbs' | 'seafood' | 'meat' | 'other';
export type VehicleType = 'bike' | 'auto' | 'cab';
export type RequestFrequency = 'once' | 'weekly' | 'monthly' | 'seasonal';
export type RequesterType = 'home' | 'restaurant' | 'business';
export type RequestStatus = 'open' | 'pledged' | 'fulfilled';
export type PackagingType = 'jute_bag' | 'glass_jar' | 'leaf_basket' | 'cloth_bag' | 'steel_tin' | 'paper_bag';
export type ProcessingStatus = 'raw_harvest' | 'mill_processed' | 'value_added';

export const PACKAGING_INFO: Record<PackagingType, { label: string; material: string; deposit: number; icon: string; color: string; returnNote: string }> = {
  jute_bag: { label: 'Jute Bag', material: 'Natural jute fibre — 100% biodegradable', deposit: 25, icon: 'bag-personal-outline', color: '#B45309', returnNote: 'Return for full ₹25 deposit refund. Rider picks up on next delivery.' },
  glass_jar: { label: 'Glass Jar', material: 'Food-grade glass — endlessly reusable', deposit: 50, icon: 'bottle-soda-outline', color: '#2563EB', returnNote: 'Return clean glass jar for ₹50 refund. Washed and refilled at farm.' },
  leaf_basket: { label: 'Leaf Basket', material: 'Sal or banana leaf — fully compostable', deposit: 0, icon: 'leaf', color: '#16A34A', returnNote: 'Compost it at home — no return needed. Zero waste.' },
  cloth_bag: { label: 'Cloth Bag', material: 'Unbleached cotton — reusable 200+ times', deposit: 20, icon: 'tshirt-crew-outline', color: '#7C3AED', returnNote: 'Return for ₹20 refund. Washed and reused for next delivery.' },
  steel_tin: { label: 'Steel Tin', material: 'Food-grade stainless steel — lifetime use', deposit: 80, icon: 'pot-outline', color: '#6B7280', returnNote: 'Return for ₹80 refund. Sanitised and refilled. Lasts decades.' },
  paper_bag: { label: 'Paper Bag', material: 'Recycled kraft paper — biodegradable', deposit: 0, icon: 'bag-outline', color: '#92400E', returnNote: 'Compost it — no return needed. Made from recycled material.' },
};

export const PROCESSING_INFO: Record<ProcessingStatus, { label: string; color: string; icon: string; desc: string }> = {
  raw_harvest: { label: 'Raw Harvest', color: '#DC2626', icon: 'sprout', desc: 'Freshly harvested. Needs processing before consumption.' },
  mill_processed: { label: 'Mill Processed', color: '#16A34A', icon: 'cog-outline', desc: 'Processed at local mill. Ready to cook and consume.' },
  value_added: { label: 'Value Added', color: '#7C3AED', icon: 'star-circle-outline', desc: 'Further processed — pickle, oil, flour, or dried product.' },
};

export interface SavedAddress {
  label: 'Home' | 'Work' | 'Other';
  doorNo: string;
  landmark: string;
  area: string;
  fullAddress: string;
  lat?: number;
  lng?: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  location?: string;
  idVerified?: boolean;
  idProofUri?: string;
  vehicleType?: VehicleType;
  savedAddress?: SavedAddress;
  hasFarmPass?: boolean;
  farmPassPlan?: 'monthly' | 'yearly';
  farmPassStartedAt?: string;
  dailyEarningGoal?: number;
}

export interface Listing {
  shortName?: string;
  id: string;
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  farmerPhone: string;
  farmerRating: number;
  produceName: string;
  category: ProduceCategory;
  description: string;
  price: number;
  priceUnit: string;
  quantity: number;
  quantityUnit: string;
  imageUri?: number | string;
  harvestTime: string;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
  packagingType?: PackagingType;
  packagingDeposit?: number;
  processingStatus?: ProcessingStatus;
  processingNote?: string;
}

export interface Order {
  id: string;
  listingId: string;
  produceName: string;
  farmerName: string;
  farmerLocation: string;
  farmerPhone: string;
  consumerId: string;
  consumerName: string;
  consumerAddress: string;
  consumerPhone: string;
  quantity: number;
  pricePerUnit: number;
  priceUnit: string;
  quantityUnit: string;
  totalPrice: number;
  deliveryFee: number;
  packagingDeposit: number;
  packagingType?: PackagingType;
  packagingReturnRequested?: boolean;
  packagingReturned?: boolean;
  status: OrderStatus;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  vehicleType?: VehicleType;
  fulfilmentType?: 'machine_pickup' | 'home_delivery';
  machineId?: string;
  farmerPayout?: number;
  platformCommission?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MachineBatch {
  id: string;
  listingId: string;
  produceName: string;
  quantity: number;
  capacity: number;
  harvestTime: string;
  packedAt: string;
  expiresAt: string;
  temperature: number;
  temperatureOk: boolean;
}

export interface VendingMachine {
  id: string;
  name: string;
  apartment: string;
  area: string;
  distance: string;
  status: 'online' | 'low' | 'restocking';
  nextRestockAt: string;
  lastSanitisedAt: string;
  hygieneScore: number;
  solar: boolean;
  temperatureControlled: boolean;
  batches: MachineBatch[];
}

export interface FreshSubscription {
  id: string;
  name: string;
  frequency: 'weekly' | 'monthly';
  price: number;
  nextDelivery: string;
  status: 'active' | 'paused';
}

const SEED_MACHINES: VendingMachine[] = [
  {
    id: 'm1',
    name: 'FL-001',
    apartment: 'Sai Residency',
    area: 'Kakinada Road, Block B Parking',
    distance: '0.2 km',
    status: 'online',
    nextRestockAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    lastSanitisedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    hygieneScore: 98,
    solar: true,
    temperatureControlled: true,
    batches: [
      { id: 'batch1', listingId: 'listing1', produceName: 'Sona Masuri Rice', quantity: 22, capacity: 30, harvestTime: new Date(Date.now() - 48 * 3600000).toISOString(), packedAt: new Date(Date.now() - 8 * 3600000).toISOString(), expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(), temperature: 23, temperatureOk: true },
      { id: 'batch2', listingId: 'listing4', produceName: 'Tender Coconuts', quantity: 12, capacity: 20, harvestTime: new Date(Date.now() - 5 * 3600000).toISOString(), packedAt: new Date(Date.now() - 3 * 3600000).toISOString(), expiresAt: new Date(Date.now() + 2 * 86400000).toISOString(), temperature: 11, temperatureOk: true },
      { id: 'batch3', listingId: 'listing6', produceName: 'Monthan Banana', quantity: 16, capacity: 24, harvestTime: new Date(Date.now() - 8 * 3600000).toISOString(), packedAt: new Date(Date.now() - 5 * 3600000).toISOString(), expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(), temperature: 14, temperatureOk: true },
    ],
  },
  {
    id: 'm2',
    name: 'FL-002',
    apartment: 'Vijaya Towers',
    area: 'Rajahmundry Bypass, Lift Lobby',
    distance: '0.5 km',
    status: 'online',
    nextRestockAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    lastSanitisedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    hygieneScore: 96,
    solar: true,
    temperatureControlled: true,
    batches: [
      { id: 'batch4', listingId: 'listing5', produceName: 'Tiger Prawns', quantity: 8, capacity: 16, harvestTime: new Date(Date.now() - 9 * 3600000).toISOString(), packedAt: new Date(Date.now() - 4 * 3600000).toISOString(), expiresAt: new Date(Date.now() + 1 * 86400000).toISOString(), temperature: 3, temperatureOk: true },
      { id: 'batch5', listingId: 'listing2', produceName: 'BPT Boiled Rice', quantity: 18, capacity: 30, harvestTime: new Date(Date.now() - 72 * 3600000).toISOString(), packedAt: new Date(Date.now() - 12 * 3600000).toISOString(), expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(), temperature: 22, temperatureOk: true },
    ],
  },
];

export interface CropRequest {
  imageUri?: number | string;
  id: string;
  requesterId: string;
  requesterName: string;
  requesterType: RequesterType;
  requesterLocation: string;
  produceName: string;
  category: ProduceCategory;
  quantityNeeded: number;
  quantityUnit: string;
  maxPricePerUnit: number;
  priceUnit: string;
  frequency: RequestFrequency;
  description: string;
  createdAt: string;
  pledgedFarmerIds: string[];
  pledgedFarmerNames: string[];
  status: RequestStatus;
}

// East Godavari, Andhra Pradesh — primary produce region
const SEED_LISTINGS: Listing[] = [
  {
    id: 'listing1',
    farmerId: 'farmer_demo1',
    farmerName: 'Ravi Reddy',
    farmerLocation: 'Razole, East Godavari',
    farmerPhone: '+91 98765 43210',
    farmerRating: 4.8,
    produceName: 'Sona Masuri Raw Rice',
    shortName: 'Sona Masuri Rice',
    category: 'grains',
    imageUri: require('../assets/images/listing_sona_masuri_rice.jpg'),
    description: 'GI-tagged Sona Masuri from Razole mandal. Medium-grain, low-starch. Milled fresh at Rajam Rice Mill, Kakinada Road. Chemical-free paddy cultivation. Ideal for daily cooking, light on stomach.',
    price: 52,
    priceUnit: 'kg',
    quantity: 500,
    quantityUnit: 'kg',
    harvestTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isAvailable: true,
    rating: 4.8,
    totalReviews: 34,
    packagingType: 'jute_bag',
    packagingDeposit: 25,
    processingStatus: 'mill_processed',
    processingNote: 'Milled at Rajam Rice Mill, Kakinada Road, Razole',
  },
  {
    id: 'listing2',
    farmerId: 'farmer_demo2',
    farmerName: 'Krishna Agro Farms',
    farmerLocation: 'Amalapuram, East Godavari',
    farmerPhone: '+91 87654 32109',
    farmerRating: 4.9,
    produceName: 'BPT 5204 Boiled Rice',
    shortName: 'BPT Boiled Rice',
    category: 'grains',
    imageUri: require('../assets/images/listing_bpt_boiled_rice.jpg'),
    description: 'Traditional BPT Samba boiled rice from Amalapuram. Parboiled for better nutrition. Mild aroma, firm texture. Milled and sorted at regulated mill. Preferred for andhra meals and biryani base.',
    price: 48,
    priceUnit: 'kg',
    quantity: 800,
    quantityUnit: 'kg',
    harvestTime: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    isAvailable: true,
    rating: 4.9,
    totalReviews: 51,
    packagingType: 'jute_bag',
    packagingDeposit: 25,
    processingStatus: 'mill_processed',
    processingNote: 'Milled and parboiled at Pattabhi Rice Mill, Amalapuram',
  },
  {
    id: 'listing3',
    farmerId: 'farmer_demo3',
    farmerName: 'Suresh Kakarla',
    farmerLocation: 'Rajamahendravaram, East Godavari',
    farmerPhone: '+91 76543 21098',
    farmerRating: 4.7,
    produceName: 'Raw Turmeric Fingers',
    shortName: 'Turmeric Fingers',
    category: 'herbs',
    imageUri: require('../assets/images/listing_raw_turmeric.jpg'),
    description: 'Freshly harvested turmeric rhizomes from Rajam. Deep orange inside — high curcumin content. Can be consumed raw, dried, or juiced. Naturally grown without any chemical fertiliser.',
    price: 60,
    priceUnit: 'kg',
    quantity: 80,
    quantityUnit: 'kg',
    harvestTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isAvailable: true,
    rating: 4.7,
    totalReviews: 19,
    packagingType: 'paper_bag',
    packagingDeposit: 0,
    processingStatus: 'raw_harvest',
    processingNote: 'Fresh harvest — wash and dry before grinding',
  },
  {
    id: 'listing4',
    farmerId: 'farmer_demo4',
    farmerName: 'Lakshmi Coconut Farm',
    farmerLocation: 'Kakinada, East Godavari',
    farmerPhone: '+91 65432 10987',
    farmerRating: 4.9,
    produceName: 'Fresh Tender Coconuts',
    shortName: 'Tender Coconuts',
    category: 'fruits',
    imageUri: require('../assets/images/listing_tender_coconuts.jpg'),
    description: 'Sweet tender coconuts from Kakinada coastal belt. Thick malai, sweet water. Picked this morning from 15-year-old palms. Order 6+ for bulk pricing. No preservatives, naturally fresh.',
    price: 30,
    priceUnit: 'piece',
    quantity: 200,
    quantityUnit: 'pieces',
    harvestTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isAvailable: true,
    rating: 4.9,
    totalReviews: 67,
    packagingType: 'leaf_basket',
    packagingDeposit: 0,
    processingStatus: 'raw_harvest',
    processingNote: 'Freshly climbed, no processing needed — drink directly',
  },
  {
    id: 'listing5',
    farmerId: 'farmer_demo5',
    farmerName: 'Coastal Aqua - Murthy',
    farmerLocation: 'Kakinada Port, East Godavari',
    farmerPhone: '+91 54321 09876',
    farmerRating: 4.8,
    produceName: 'Godavari Tiger Prawns',
    shortName: 'Tiger Prawns',
    category: 'seafood',
    imageUri: require('../assets/images/listing_tiger_prawns.jpg'),
    description: 'Fresh tiger prawns from Kakinada coastal aquaculture. Zero preservatives, iced immediately after harvest. Cleaned and deveined on request. Morning catch — available till stock lasts.',
    price: 380,
    priceUnit: 'kg',
    quantity: 30,
    quantityUnit: 'kg',
    harvestTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isAvailable: true,
    rating: 4.8,
    totalReviews: 23,
    packagingType: 'steel_tin',
    packagingDeposit: 80,
    processingStatus: 'mill_processed',
    processingNote: 'Cleaned, deveined and iced at Kakinada Fish Processing Centre',
  },
  {
    id: 'listing6',
    farmerId: 'farmer_demo6',
    farmerName: 'Anand Banana Farm',
    farmerLocation: 'Kovvur, West Godavari',
    farmerPhone: '+91 43210 98765',
    farmerRating: 4.6,
    produceName: 'Monthan Banana (Balekai)',
    shortName: 'Monthan Banana',
    category: 'fruits',
    imageUri: require('../assets/images/listing_monthan_banana.jpg'),
    description: 'Thick Monthan (cooking) bananas from Kovvur. Best for bajji, kura, and chips. Not sweet — starchy, firm. Naturally ripened, no ethylene gas. Ideal for frying and curries.',
    price: 40,
    priceUnit: 'dozen',
    quantity: 100,
    quantityUnit: 'dozens',
    harvestTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isAvailable: true,
    rating: 4.6,
    totalReviews: 14,
    packagingType: 'leaf_basket',
    packagingDeposit: 0,
    processingStatus: 'raw_harvest',
    processingNote: 'Freshly cut — naturally ripened, no gas treatment',
  },
];

const SEED_REQUESTS: CropRequest[] = [
  {
    id: 'req1',
    requesterId: 'consumer_demo1',
    requesterName: 'Hotel Annapurna (Rajam)',
    requesterType: 'restaurant',
    requesterLocation: 'Rajamahendravaram, East Godavari',
    produceName: 'HMT Rice (Hand-Pounded)',
    category: 'grains',
    quantityNeeded: 25,
    quantityUnit: 'kg',
    maxPricePerUnit: 70,
    priceUnit: 'kg',
    frequency: 'monthly',
    description: 'Our hotel needs old-variety HMT rice, hand-pounded (not machine polished). Customers specifically request this for the bran content. Will take 25kg monthly with advance payment.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    pledgedFarmerIds: [],
    pledgedFarmerNames: [],
    status: 'open',
  },
  {
    id: 'req2',
    requesterId: 'consumer_demo2',
    requesterName: 'Sravanthi (Home)',
    requesterType: 'home',
    requesterLocation: 'Kakinada, East Godavari',
    produceName: 'Cold-Pressed Coconut Oil',
    imageUri: require('../assets/images/produce_cold_pressed_oil.jpg'),
    category: 'other',
    quantityNeeded: 5,
    quantityUnit: 'litre',
    maxPricePerUnit: 250,
    priceUnit: 'litre',
    frequency: 'monthly',
    description: 'Looking for pure wood-pressed (ghani) coconut oil from Kakinada area. Not the refined supermarket oil. For cooking and hair. Glass bottle preferred.',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    pledgedFarmerIds: ['farmer_demo4'],
    pledgedFarmerNames: ['Lakshmi Coconut Farm'],
    status: 'pledged',
  },
  {
    id: 'req3',
    requesterId: 'consumer_demo3',
    requesterName: 'Ramana Murthy',
    requesterType: 'home',
    requesterLocation: 'Rajahmundry, East Godavari',
    produceName: 'Sona Masuri Raw Rice (50kg)',
    category: 'grains',
    quantityNeeded: 50,
    quantityUnit: 'kg',
    maxPricePerUnit: 58,
    priceUnit: 'kg',
    frequency: 'monthly',
    description: 'Monthly rice requirement for family of 6. Currently buying from kirana at ₹75/kg. Direct from farmer is preferred — can meet at mill or take home delivery.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    pledgedFarmerIds: [],
    pledgedFarmerNames: [],
    status: 'open',
  },
  {
    id: 'req4',
    requesterId: 'consumer_demo4',
    requesterName: 'Meena Catering',
    requesterType: 'business',
    requesterLocation: 'Amalapuram, East Godavari',
    produceName: 'Fresh Curry Leaves',
    imageUri: require('../assets/images/produce_curry_leaves.jpg'),
    category: 'herbs',
    quantityNeeded: 2,
    quantityUnit: 'kg',
    maxPricePerUnit: 120,
    priceUnit: 'kg',
    frequency: 'weekly',
    description: 'Catering business needs 2kg fresh curry leaves weekly. Must be fresh, not dried. Consistent supply is critical. We\'ll commit to 1-year contract with right farmer.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    pledgedFarmerIds: [],
    pledgedFarmerNames: [],
    status: 'open',
  },
  {
    id: 'req5',
    requesterId: 'consumer_demo5',
    requesterName: 'Ravi Kumar (NRI - USA)',
    requesterType: 'home',
    requesterLocation: 'Ships to: Kakinada (family)',
    produceName: 'BPT Samba Rice (100kg)',
    category: 'grains',
    quantityNeeded: 100,
    quantityUnit: 'kg',
    maxPricePerUnit: 55,
    priceUnit: 'kg',
    frequency: 'seasonal',
    description: 'I\'m an NRI sending money for my parents\' annual rice purchase. They need 100kg BPT rice for the year. My parents (Kakinada) will receive. Direct farm supply preferred — better quality than local shop.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    pledgedFarmerIds: [],
    pledgedFarmerNames: [],
    status: 'open',
  },
  {
    id: 'req6',
    requesterId: 'consumer_demo6',
    requesterName: 'Green Earth Café',
    requesterType: 'restaurant',
    requesterLocation: 'Rajamahendravaram, East Godavari',
    produceName: 'Mixed Seasonal Vegetables (Zero Pesticide)',
    imageUri: require('../assets/images/produce_mixed_vegetables.jpg'),
    category: 'vegetables',
    quantityNeeded: 10,
    quantityUnit: 'kg',
    maxPricePerUnit: 80,
    priceUnit: 'kg',
    frequency: 'weekly',
    description: 'Organic café needs 10kg mixed seasonal vegetables weekly — brinjal, ladies finger, ridge gourd, drumstick. Zero pesticide is mandatory. Will display farmer\'s name on menu.',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    pledgedFarmerIds: [],
    pledgedFarmerNames: [],
    status: 'open',
  },
];

interface AppContextType {
  currentUser: User | null;
  isLoading: boolean;
  listings: Listing[];
  orders: Order[];
  cropRequests: CropRequest[];
  machines: VendingMachine[];
  subscriptions: FreshSubscription[];
  setupUser: (user: Omit<User, 'id'>) => Promise<void>;
  addListing: (listing: Omit<Listing, 'id' | 'farmerId' | 'farmerName' | 'farmerLocation' | 'farmerPhone' | 'farmerRating' | 'rating' | 'totalReviews' | 'isAvailable'>) => void;
  createOrder: (params: { listingId: string; consumerAddress: string; quantity: number; fulfilmentType?: 'machine_pickup' | 'home_delivery'; machineId?: string }) => Order | null;
  acceptOrder: (orderId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateRiderProfile: (updates: Partial<Pick<User, 'vehicleType' | 'idVerified' | 'idProofUri' | 'location'>>) => Promise<void>;
  switchRole: () => Promise<void>;
  logout: () => Promise<void>;
  getUserOrders: () => Order[];
  getFarmerOrders: () => Order[];
  getAvailableOrders: () => Order[];
  getActiveRiderOrder: () => Order | undefined;
  getFarmerListings: () => Listing[];
  addCropRequest: (req: Omit<CropRequest, 'id' | 'requesterId' | 'requesterName' | 'requesterLocation' | 'createdAt' | 'pledgedFarmerIds' | 'pledgedFarmerNames' | 'status'>) => void;
  pledgeToGrow: (requestId: string) => void;
  getOpenRequests: () => CropRequest[];
  getMyRequests: () => CropRequest[];
  requestPackagingReturn: (orderId: string) => void;
  saveAddress: (addr: SavedAddress) => Promise<void>;
  activateFarmPass: (plan?: 'monthly' | 'yearly') => Promise<void>;
  updateRole: (role: UserRole, vehicleType?: VehicleType) => Promise<void>;
  setDailyEarningGoal: (goal: number) => Promise<void>;
  createSubscription: (subscription: Omit<FreshSubscription, 'id' | 'nextDelivery' | 'status'>) => void;
  cancelSubscription: (subscriptionId: string) => void;
  restockMachine: (machineId: string) => void;
  getFarmerPayouts: () => { gross: number; commission: number; orders: number };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>(SEED_LISTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cropRequests, setCropRequests] = useState<CropRequest[]>(SEED_REQUESTS);
  const [machines, setMachines] = useState<VendingMachine[]>(SEED_MACHINES);
  const [subscriptions, setSubscriptions] = useState<FreshSubscription[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const userJson = await AsyncStorage.getItem('farmlink_user');
        const ordersJson = await AsyncStorage.getItem('farmlink_orders');
        const listingsJson = await AsyncStorage.getItem('farmlink_listings');
        const requestsJson = await AsyncStorage.getItem('farmlink_requests');
        const machinesJson = await AsyncStorage.getItem('farmlink_machines');
        const subscriptionsJson = await AsyncStorage.getItem('farmlink_subscriptions');
        if (userJson) setCurrentUser(JSON.parse(userJson));
        if (ordersJson) setOrders(JSON.parse(ordersJson));
        if (listingsJson) {
          const stored = JSON.parse(listingsJson) as Listing[];
          setListings([
            ...SEED_LISTINGS,
            ...stored.filter((l) => !SEED_LISTINGS.find((s) => s.id === l.id)),
          ]);
        }
        if (requestsJson) {
          const stored = JSON.parse(requestsJson) as CropRequest[];
          setCropRequests([
            ...SEED_REQUESTS,
            ...stored.filter((r) => !SEED_REQUESTS.find((s) => s.id === r.id)),
          ]);
        }
        if (machinesJson) setMachines(JSON.parse(machinesJson));
        if (subscriptionsJson) setSubscriptions(JSON.parse(subscriptionsJson));
      } catch {}
      setIsLoading(false);
    };
    load();
  }, []);

  const saveOrders = async (newOrders: Order[]) => {
    await AsyncStorage.setItem('farmlink_orders', JSON.stringify(newOrders));
  };

  const saveRequests = async (reqs: CropRequest[]) => {
    const userReqs = reqs.filter((r) => !SEED_REQUESTS.find((s) => s.id === r.id));
    await AsyncStorage.setItem('farmlink_requests', JSON.stringify(userReqs));
  };

  const saveMachines = async (updatedMachines: VendingMachine[]) => {
    await AsyncStorage.setItem('farmlink_machines', JSON.stringify(updatedMachines));
  };

  const setupUser = async (userInput: Omit<User, 'id'>) => {
    const user: User = { ...userInput, id: `user_${Date.now()}` };
    setCurrentUser(user);
    await AsyncStorage.setItem('farmlink_user', JSON.stringify(user));
    // Best-effort: persist to DB so data is available across devices
    apiPost('/api/users', {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      location: user.location ?? null,
      vehicleType: user.vehicleType ?? null,
      idVerified: user.idVerified ?? false,
      idProofUri: user.idProofUri ?? null,
    }).catch(() => {/* offline-first, ignore failures */});
  };

  const addListing = (
    input: Omit<Listing, 'id' | 'farmerId' | 'farmerName' | 'farmerLocation' | 'farmerPhone' | 'farmerRating' | 'rating' | 'totalReviews' | 'isAvailable'>,
  ) => {
    if (!currentUser) return;
    const listing: Listing = {
      ...input,
      id: `listing_${Date.now()}`,
      farmerId: currentUser.id,
      farmerName: currentUser.name,
      farmerLocation: currentUser.location || 'East Godavari, AP',
      farmerPhone: currentUser.phone,
      farmerRating: 5.0,
      rating: 0,
      totalReviews: 0,
      isAvailable: true,
    };
    const updated = [listing, ...listings];
    setListings(updated);
    const userListings = updated.filter((l) => !SEED_LISTINGS.find((s) => s.id === l.id));
    AsyncStorage.setItem('farmlink_listings', JSON.stringify(userListings));
  };

  const createOrder = ({
    listingId,
    consumerAddress,
    quantity,
    fulfilmentType = 'home_delivery',
    machineId,
  }: {
    listingId: string;
    consumerAddress: string;
    quantity: number;
    fulfilmentType?: 'machine_pickup' | 'home_delivery';
    machineId?: string;
  }): Order | null => {
    if (!currentUser) return null;
    const listing = listings.find((l) => l.id === listingId);
    if (!listing) return null;
    const totalPrice = listing.price * quantity;
    const hasFarmPass = currentUser.hasFarmPass ?? false;
    const deliveryFee = hasFarmPass ? 0 : Math.max(20, Math.round(totalPrice * 0.1));
    const packagingDeposit = listing.packagingDeposit ?? 0;
    const directFarmerPayout = totalPrice;
    const order: Order = {
      id: `order_${Date.now()}`,
      listingId,
      produceName: listing.produceName,
      farmerName: listing.farmerName,
      farmerLocation: listing.farmerLocation,
      farmerPhone: listing.farmerPhone,
      consumerId: currentUser.id,
      consumerName: currentUser.name,
      consumerAddress,
      consumerPhone: currentUser.phone,
      quantity,
      pricePerUnit: listing.price,
      priceUnit: listing.priceUnit,
      quantityUnit: listing.quantityUnit,
      totalPrice,
      deliveryFee: fulfilmentType === 'machine_pickup' ? 0 : deliveryFee,
      packagingDeposit,
      packagingType: listing.packagingType,
      packagingReturnRequested: false,
      packagingReturned: false,
      status: 'pending',
      fulfilmentType,
      machineId,
      farmerPayout: directFarmerPayout,
      platformCommission: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [order, ...orders];
    setOrders(updated);
    saveOrders(updated);
    if (fulfilmentType === 'machine_pickup' && machineId) {
      const updatedMachines = machines.map((machine) => {
        if (machine.id !== machineId) return machine;
        const batches = machine.batches.map((batch) =>
          batch.listingId === listingId ? { ...batch, quantity: Math.max(0, batch.quantity - quantity) } : batch,
        );
        const remaining = batches.reduce((sum, batch) => sum + batch.quantity, 0);
        const capacity = batches.reduce((sum, batch) => sum + batch.capacity, 0);
        return { ...machine, batches, status: remaining / Math.max(capacity, 1) < 0.3 ? 'low' as const : 'online' as const };
      });
      setMachines(updatedMachines);
      saveMachines(updatedMachines);
    }
    return order;
  };

  const acceptOrder = (orderId: string) => {
    if (!currentUser) return;
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: 'picked_up' as OrderStatus,
            riderId: currentUser.id,
            riderName: currentUser.name,
            riderPhone: currentUser.phone,
            vehicleType: currentUser.vehicleType,
            updatedAt: new Date().toISOString(),
          }
        : o,
    );
    setOrders(updated);
    saveOrders(updated);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const order = orders.find((o) => o.id === orderId);
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o,
    );
    setOrders(updated);
    saveOrders(updated);
    if (order && (status === 'picked_up' || status === 'delivered' || status === 'cancelled')) {
      import('../utils/events').then(({ AppEvents }) => {
        AppEvents.emit('order:status', {
          orderId,
          status,
          produceName: order.produceName,
          riderName: order.riderName,
        });
      });
    }
  };

  const updateRiderProfile = async (
    updates: Partial<Pick<User, 'vehicleType' | 'idVerified' | 'idProofUri' | 'location'>>,
  ) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    await AsyncStorage.setItem('farmlink_user', JSON.stringify(updated));
  };

  const setDailyEarningGoal = async (goal: number) => {
    if (!currentUser) return;
    const updated = { ...currentUser, dailyEarningGoal: goal };
    setCurrentUser(updated);
    await AsyncStorage.setItem('farmlink_user', JSON.stringify(updated));
  };

  const createSubscription = (subscription: Omit<FreshSubscription, 'id' | 'nextDelivery' | 'status'>) => {
    const next = new Date();
    next.setDate(next.getDate() + (subscription.frequency === 'weekly' ? 7 : 30));
    const updated = [{ ...subscription, id: `sub_${Date.now()}`, nextDelivery: next.toISOString(), status: 'active' as const }, ...subscriptions];
    setSubscriptions(updated);
    AsyncStorage.setItem('farmlink_subscriptions', JSON.stringify(updated));
  };

  const cancelSubscription = (subscriptionId: string) => {
    const updated = subscriptions.map((subscription) => subscription.id === subscriptionId ? { ...subscription, status: 'paused' as const } : subscription);
    setSubscriptions(updated);
    AsyncStorage.setItem('farmlink_subscriptions', JSON.stringify(updated));
  };

  const restockMachine = (machineId: string) => {
    const updated = machines.map((machine) => {
      if (machine.id !== machineId) return machine;
      return {
        ...machine,
        status: 'online' as const,
        lastSanitisedAt: new Date().toISOString(),
        hygieneScore: 100,
        nextRestockAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        batches: machine.batches.map((batch) => ({ ...batch, quantity: batch.capacity, packedAt: new Date().toISOString() })),
      };
    });
    setMachines(updated);
    saveMachines(updated);
  };

  const switchRole = async () => {
    await AsyncStorage.removeItem('farmlink_user');
    setCurrentUser(null);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('farmlink_user');
    setCurrentUser(null);
  };

  const addCropRequest = (
    input: Omit<CropRequest, 'id' | 'requesterId' | 'requesterName' | 'requesterLocation' | 'createdAt' | 'pledgedFarmerIds' | 'pledgedFarmerNames' | 'status'>,
  ) => {
    if (!currentUser) return;
    const req: CropRequest = {
      ...input,
      id: `req_${Date.now()}`,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterLocation: currentUser.location || 'East Godavari, AP',
      createdAt: new Date().toISOString(),
      pledgedFarmerIds: [],
      pledgedFarmerNames: [],
      status: 'open',
    };
    const updated = [req, ...cropRequests];
    setCropRequests(updated);
    saveRequests(updated);
  };

  const pledgeToGrow = (requestId: string) => {
    if (!currentUser) return;
    const updated = cropRequests.map((r) => {
      if (r.id !== requestId || r.pledgedFarmerIds.includes(currentUser.id)) return r;
      const newIds = [...r.pledgedFarmerIds, currentUser.id];
      const newNames = [...r.pledgedFarmerNames, currentUser.name];
      return {
        ...r,
        pledgedFarmerIds: newIds,
        pledgedFarmerNames: newNames,
        status: 'pledged' as RequestStatus,
      };
    });
    setCropRequests(updated);
    saveRequests(updated);
  };

  const requestPackagingReturn = (orderId: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, packagingReturnRequested: true, updatedAt: new Date().toISOString() } : o,
    );
    setOrders(updated);
    saveOrders(updated);
  };

  const getFarmerPayouts = () => {
    const farmerOrders = orders.filter((order) => order.farmerName === currentUser?.name && order.status === 'delivered');
    const gross = farmerOrders.reduce((sum, order) => sum + (order.farmerPayout ?? order.totalPrice), 0);
    return { gross, commission: 0, orders: farmerOrders.length };
  };

  const saveAddress = async (addr: SavedAddress) => {
    if (!currentUser) return;
    const updated: User = { ...currentUser, savedAddress: addr };
    setCurrentUser(updated);
    await AsyncStorage.setItem('farmlink_user', JSON.stringify(updated));
    apiPost('/api/users', {
      id: updated.id,
      phone: updated.phone,
      name: updated.name,
      role: updated.role,
      location: updated.location ?? null,
      vehicleType: updated.vehicleType ?? null,
      idVerified: updated.idVerified ?? false,
      idProofUri: updated.idProofUri ?? null,
    }).catch(() => {});
  };

  const activateFarmPass = async (plan: 'monthly' | 'yearly' = 'monthly') => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      hasFarmPass: true,
      farmPassPlan: plan,
      farmPassStartedAt: new Date().toISOString(),
    };
    setCurrentUser(updated);
    await AsyncStorage.setItem('farmlink_user', JSON.stringify(updated));
  };

  const updateRole = async (role: UserRole, vehicleType?: VehicleType) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      role,
      ...(vehicleType ? { vehicleType } : {}),
    };
    setCurrentUser(updated);
    await AsyncStorage.setItem('farmlink_user', JSON.stringify(updated));
  };

  const getUserOrders = () => orders.filter((o) => o.consumerId === currentUser?.id);
  const getFarmerOrders = () =>
    orders.filter((o) => listings.some((l) => l.farmerId === currentUser?.id && l.id === o.listingId));
  const getFarmerListings = () => listings.filter((l) => l.farmerId === currentUser?.id);
  const getAvailableOrders = () => orders.filter((o) => o.status === 'pending');
  const getActiveRiderOrder = () =>
    orders.find((o) => o.riderId === currentUser?.id && o.status === 'picked_up');
  const getOpenRequests = () => cropRequests.filter((r) => r.status !== 'fulfilled');
  const getMyRequests = () => cropRequests.filter((r) => r.requesterId === currentUser?.id);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isLoading,
        listings,
        orders,
        cropRequests,
      machines,
      subscriptions,
        setupUser,
        addListing,
        createOrder,
        acceptOrder,
        updateOrderStatus,
        updateRiderProfile,
        switchRole,
        logout,
        getUserOrders,
        getFarmerOrders,
        getAvailableOrders,
        getActiveRiderOrder,
        getFarmerListings,
        addCropRequest,
        pledgeToGrow,
        getOpenRequests,
        getMyRequests,
        requestPackagingReturn,
        saveAddress,
        activateFarmPass,
        updateRole,
      setDailyEarningGoal,
      createSubscription,
      cancelSubscription,
      restockMachine,
      getFarmerPayouts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
