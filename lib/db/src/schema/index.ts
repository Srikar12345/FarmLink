import { boolean, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ── Users ────────────────────────────────────────────────────────────────────
export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  phone: text("phone").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull(), // 'farmer' | 'consumer' | 'rider'
  location: text("location"),
  vehicleType: text("vehicle_type"), // 'bike' | 'auto' | 'cab'
  idVerified: boolean("id_verified").default(false),
  idProofUri: text("id_proof_uri"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

// ── Listings ─────────────────────────────────────────────────────────────────
export const listingsTable = pgTable("listings", {
  id: text("id").primaryKey(),
  farmerId: text("farmer_id")
    .notNull()
    .references(() => usersTable.id),
  produceName: text("produce_name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  priceUnit: text("price_unit").notNull(),
  quantity: real("quantity").notNull(),
  quantityUnit: text("quantity_unit").notNull(),
  harvestTime: text("harvest_time").notNull(),
  isAvailable: boolean("is_available").default(true),
  packagingType: text("packaging_type"),
  processingStatus: text("processing_status"),
  processingNote: text("processing_note"),
  imageUri: text("image_uri"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;

// ── Orders ───────────────────────────────────────────────────────────────────
export const ordersTable = pgTable("orders", {
  id: text("id").primaryKey(),
  listingId: text("listing_id")
    .notNull()
    .references(() => listingsTable.id),
  consumerId: text("consumer_id")
    .notNull()
    .references(() => usersTable.id),
  riderId: text("rider_id").references(() => usersTable.id),
  status: text("status").notNull(), // 'pending' | 'picked_up' | 'delivered' | 'cancelled'
  produceName: text("produce_name").notNull(),
  quantity: real("quantity").notNull(),
  quantityUnit: text("quantity_unit").notNull(),
  totalPrice: real("total_price").notNull(),
  deliveryFee: real("delivery_fee").notNull(),
  packagingDeposit: real("packaging_deposit").default(0),
  packagingType: text("packaging_type"),
  consumerAddress: text("consumer_address").notNull(),
  farmerName: text("farmer_name"),
  farmerLocation: text("farmer_location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;

// ── Crop Requests ─────────────────────────────────────────────────────────────
export const cropRequestsTable = pgTable("crop_requests", {
  id: text("id").primaryKey(),
  requesterId: text("requester_id")
    .notNull()
    .references(() => usersTable.id),
  produceName: text("produce_name").notNull(),
  category: text("category").notNull(),
  quantityNeeded: real("quantity_needed").notNull(),
  quantityUnit: text("quantity_unit").notNull(),
  maxPricePerUnit: real("max_price_per_unit").notNull(),
  frequency: text("frequency").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // 'open' | 'pledged' | 'fulfilled'
  pledgedFarmerId: text("pledged_farmer_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCropRequestSchema = createInsertSchema(
  cropRequestsTable,
).omit({ createdAt: true });
export type InsertCropRequest = z.infer<typeof insertCropRequestSchema>;
export type CropRequest = typeof cropRequestsTable.$inferSelect;
