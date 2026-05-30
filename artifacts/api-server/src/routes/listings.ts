import { Router } from "express";
import { getListings, addListing } from "../lib/store";
import { Listing } from "@workspace/db";

const router = Router();

// GET /api/listings
router.get("/listings", async (req, res) => {
  try {
    const list = await getListings();
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: "Failed to get listings" });
  }
});

// POST /api/listings
router.post("/listings", async (req, res) => {
  try {
    const data = req.body as Listing;
    if (!data.id) data.id = `listing_${Date.now()}`;
    const result = await addListing(data);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create listing" });
  }
});

export default router;
