import { Listing, Order, CropRequest, User } from "@workspace/db";

// In-memory fallbacks if Database is offline
export let memUsers: User[] = [
  { id: 'farmer_demo1', phone: '+91 98765 43210', name: 'Ravi Reddy', role: 'farmer', location: 'Razole, East Godavari', vehicleType: null, idVerified: true, idProofUri: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'farmer_demo2', phone: '+91 87654 32109', name: 'Krishna Agro Farms', role: 'farmer', location: 'Amalapuram, East Godavari', vehicleType: null, idVerified: true, idProofUri: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'farmer_demo3', phone: '+91 76543 21098', name: 'Suresh Kakarla', role: 'farmer', location: 'Rajamahendravaram, East Godavari', vehicleType: null, idVerified: true, idProofUri: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'farmer_demo4', phone: '+91 65432 10987', name: 'Lakshmi Coconut Farm', role: 'farmer', location: 'Kakinada, East Godavari', vehicleType: null, idVerified: true, idProofUri: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'farmer_demo5', phone: '+91 54321 09876', name: 'Coastal Aqua - Murthy', role: 'farmer', location: 'Kakinada Port, East Godavari', vehicleType: null, idVerified: true, idProofUri: null, createdAt: new Date(), updatedAt: new Date() },
  { id: 'farmer_demo6', phone: '+91 43210 98765', name: 'Anand Banana Farm', role: 'farmer', location: 'Kovvur, West Godavari', vehicleType: null, idVerified: true, idProofUri: null, createdAt: new Date(), updatedAt: new Date() },
];
export let memListings: Listing[] = [
  {
    id: 'listing1',
    farmerId: 'farmer_demo1',
    produceName: 'Sona Masuri Raw Rice',
    category: 'grains',
    description: 'GI-tagged Sona Masuri from Razole mandal. Medium-grain, low-starch. Chemical-free paddy cultivation.',
    price: 52,
    priceUnit: 'kg',
    quantity: 500,
    quantityUnit: 'kg',
    harvestTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    isAvailable: true,
    packagingType: 'jute_bag',
    processingStatus: 'mill_processed',
    processingNote: 'Milled at Rajam Rice Mill, Kakinada Road, Razole',
    imageUri: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'listing2',
    farmerId: 'farmer_demo2',
    produceName: 'BPT 5204 Boiled Rice',
    category: 'grains',
    description: 'Traditional BPT Samba boiled rice from Amalapuram. Parboiled for better nutrition.',
    price: 48,
    priceUnit: 'kg',
    quantity: 800,
    quantityUnit: 'kg',
    harvestTime: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    isAvailable: true,
    packagingType: 'jute_bag',
    processingStatus: 'mill_processed',
    processingNote: 'Milled and parboiled at Pattabhi Rice Mill, Amalapuram',
    imageUri: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'listing3',
    farmerId: 'farmer_demo3',
    produceName: 'Raw Turmeric Fingers',
    category: 'herbs',
    description: 'Freshly harvested turmeric rhizomes from Rajam. Deep orange inside — high curcumin content.',
    price: 60,
    priceUnit: 'kg',
    quantity: 80,
    quantityUnit: 'kg',
    harvestTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isAvailable: true,
    packagingType: 'paper_bag',
    processingStatus: 'raw_harvest',
    processingNote: 'Fresh harvest — wash and dry before grinding',
    imageUri: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'listing4',
    farmerId: 'farmer_demo4',
    produceName: 'Fresh Tender Coconuts',
    category: 'fruits',
    description: 'Sweet tender coconuts from Kakinada coastal belt. Sweet water, thick malai.',
    price: 30,
    priceUnit: 'piece',
    quantity: 200,
    quantityUnit: 'pieces',
    harvestTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isAvailable: true,
    packagingType: 'leaf_basket',
    processingStatus: 'raw_harvest',
    processingNote: 'Freshly climbed, no processing needed — drink directly',
    imageUri: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'listing5',
    farmerId: 'farmer_demo5',
    produceName: 'Godavari Tiger Prawns',
    category: 'seafood',
    description: 'Fresh tiger prawns from Kakinada coastal aquaculture. Cleaned and deveined.',
    price: 380,
    priceUnit: 'kg',
    quantity: 30,
    quantityUnit: 'kg',
    harvestTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isAvailable: true,
    packagingType: 'steel_tin',
    processingStatus: 'mill_processed',
    processingNote: 'Cleaned, deveined and iced at Kakinada Fish Processing Centre',
    imageUri: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'listing6',
    farmerId: 'farmer_demo6',
    produceName: 'Monthan Banana (Balekai)',
    category: 'fruits',
    description: 'Thick Monthan (cooking) bananas from Kovvur. Best for bajji and curries.',
    price: 40,
    priceUnit: 'dozen',
    quantity: 100,
    quantityUnit: 'dozens',
    harvestTime: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isAvailable: true,
    packagingType: 'leaf_basket',
    processingStatus: 'raw_harvest',
    processingNote: 'Freshly cut — naturally ripened, no gas treatment',
    imageUri: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export let memOrders: Order[] = [];
export let memCropRequests: CropRequest[] = [
  {
    id: 'req1',
    requesterId: 'consumer_demo1',
    produceName: 'HMT Rice (Hand-Pounded)',
    category: 'grains',
    quantityNeeded: 25,
    quantityUnit: 'kg',
    maxPricePerUnit: 70,
    frequency: 'monthly',
    description: 'Our hotel needs old-variety HMT rice, hand-pounded. Will take 25kg monthly.',
    status: 'open',
    pledgedFarmerId: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'req2',
    requesterId: 'consumer_demo2',
    produceName: 'Cold-Pressed Coconut Oil',
    category: 'other',
    quantityNeeded: 5,
    quantityUnit: 'litre',
    maxPricePerUnit: 250,
    frequency: 'monthly',
    description: 'Looking for pure wood-pressed (ghani) coconut oil from Kakinada area.',
    status: 'pledged',
    pledgedFarmerId: 'farmer_demo4',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
];

// Helper database/memory wrappers
export async function getListings(): Promise<Listing[]> {
  try {
    const { db, listingsTable } = await import("@workspace/db");
    return await db.select().from(listingsTable);
  } catch {
    return memListings;
  }
}

export async function addListing(listing: Listing): Promise<Listing> {
  try {
    const { db, listingsTable } = await import("@workspace/db");
    const [inserted] = await db.insert(listingsTable).values(listing).returning();
    return inserted;
  } catch {
    memListings = [listing, ...memListings];
    return listing;
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const { db, ordersTable } = await import("@workspace/db");
    return await db.select().from(ordersTable);
  } catch {
    return memOrders;
  }
}

export async function addOrder(order: Order): Promise<Order> {
  try {
    const { db, ordersTable } = await import("@workspace/db");
    const [inserted] = await db.insert(ordersTable).values(order).returning();
    return inserted;
  } catch {
    memOrders = [order, ...memOrders];
    return order;
  }
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
  try {
    const { db, ordersTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const [updated] = await db.update(ordersTable).set({ ...updates, updatedAt: new Date() }).where(eq(ordersTable.id, id)).returning();
    return updated || null;
  } catch {
    const idx = memOrders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    memOrders[idx] = { ...memOrders[idx], ...updates, updatedAt: new Date() };
    return memOrders[idx];
  }
}

export async function getCropRequests(): Promise<CropRequest[]> {
  try {
    const { db, cropRequestsTable } = await import("@workspace/db");
    return await db.select().from(cropRequestsTable);
  } catch {
    return memCropRequests;
  }
}

export async function addCropRequest(req: CropRequest): Promise<CropRequest> {
  try {
    const { db, cropRequestsTable } = await import("@workspace/db");
    const [inserted] = await db.insert(cropRequestsTable).values(req).returning();
    return inserted;
  } catch {
    memCropRequests = [req, ...memCropRequests];
    return req;
  }
}

export async function getUser(phone: string): Promise<User | null> {
  try {
    const { db, usersTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(usersTable).where(eq(usersTable.phone, phone)).limit(1);
    return user || null;
  } catch {
    return memUsers.find(u => u.phone === phone) || null;
  }
}

export async function upsertUser(user: User): Promise<User> {
  try {
    const { db, usersTable } = await import("@workspace/db");
    const [upserted] = await db.insert(usersTable).values(user).onConflictDoUpdate({
      target: usersTable.phone,
      set: {
        name: user.name,
        role: user.role,
        location: user.location,
        vehicleType: user.vehicleType,
        idVerified: user.idVerified,
        idProofUri: user.idProofUri,
        updatedAt: new Date(),
      }
    }).returning();
    return upserted;
  } catch {
    const idx = memUsers.findIndex(u => u.phone === user.phone);
    if (idx !== -1) {
      memUsers[idx] = { ...memUsers[idx], ...user, updatedAt: new Date() };
      return memUsers[idx];
    } else {
      memUsers.push(user);
      return user;
    }
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { db, usersTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    return user || null;
  } catch {
    return memUsers.find(u => u.id === id) || null;
  }
}

