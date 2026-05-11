import { Router } from "express";

const router = Router();

// GET /api/users/:phone — look up a user by phone number
router.get("/users/:phone", async (req, res) => {
  try {
    const { db, usersTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
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
    req.log.warn({ err }, "Database not available for GET /users/:phone");
    return res.status(503).json({ error: "Database not available" });
  }
});

// POST /api/users — create or update a user (upsert by phone)
router.post("/users", async (req, res) => {
  try {
    const { db, usersTable, insertUserSchema } = await import("@workspace/db");
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
    req.log.warn({ err }, "Database not available for POST /users");
    return res.status(503).json({ error: "Database not available" });
  }
});

export default router;
