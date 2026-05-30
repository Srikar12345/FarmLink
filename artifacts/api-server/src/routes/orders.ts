import { Router } from "express";
import { getOrders, addOrder, updateOrder } from "../lib/store";
import { Order } from "@workspace/db";

const router = Router();

// GET /api/orders
router.get("/orders", async (req, res) => {
  try {
    const list = await getOrders();
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: "Failed to get orders" });
  }
});

// POST /api/orders
router.post("/orders", async (req, res) => {
  try {
    const data = req.body as Order;
    if (!data.id) data.id = `order_${Date.now()}`;
    if (!data.createdAt) data.createdAt = new Date();
    if (!data.updatedAt) data.updatedAt = new Date();
    const result = await addOrder(data);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create order" });
  }
});

// PATCH /api/orders/:id
router.patch("/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await updateOrder(id, req.body);
    if (!result) return res.status(404).json({ error: "Order not found" });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
