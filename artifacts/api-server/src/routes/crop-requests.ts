import { Router } from "express";
import { getCropRequests, addCropRequest } from "../lib/store";
import { CropRequest } from "@workspace/db";

const router = Router();

// GET /api/crop-requests
router.get("/crop-requests", async (req, res) => {
  try {
    const list = await getCropRequests();
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: "Failed to get crop requests" });
  }
});

// POST /api/crop-requests
router.post("/crop-requests", async (req, res) => {
  try {
    const data = req.body as CropRequest;
    if (!data.id) data.id = `req_${Date.now()}`;
    if (!data.createdAt) data.createdAt = new Date();
    const result = await addCropRequest(data);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create crop request" });
  }
});

export default router;
