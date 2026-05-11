import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, insertUserSchema } from "@workspace/db";

const router = Router();

// GET /api/users/:phone — look up a user by phone number
router.get("/users/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.phone, decodeURIComponent(phone)))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch user");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/users — create or update a user (upsert by phone)
router.post("/users", async (req, res) => {
  try {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    }

    const [user] = await db
      .insert(usersTable)
      .values(parsed.data)
      .onConflictDoUpdate({
        target: usersTable.phone,
        set: {
          name: parsed.data.name,
          role: parsed.data.role,
          location: parsed.data.location,
          vehicleType: parsed.data.vehicleType,
          idVerified: parsed.data.idVerified,
          idProofUri: parsed.data.idProofUri,
          updatedAt: new Date(),
        },
      })
      .returning();

    return res.status(201).json(user);
  } catch (err) {
    req.log.error({ err }, "Failed to create/update user");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
