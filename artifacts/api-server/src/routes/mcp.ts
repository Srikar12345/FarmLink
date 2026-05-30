import { Router } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { server } from "../lib/mcp.js";

const router = Router();
let sseTransports: SSEServerTransport[] = [];

// Establish SSE connection stream
router.get("/mcp", async (req, res, next) => {
  try {
    // Relative endpoint the client will POST messages back to
    const transport = new SSEServerTransport("/api/mcp/message", res);
    sseTransports.push(transport);

    await server.connect(transport);

    req.on("close", () => {
      sseTransports = sseTransports.filter((t) => t !== transport);
    });
  } catch (err) {
    next(err);
  }
});

// Receive incoming JSON-RPC messages from client POST
router.post("/mcp/message", async (req, res, next) => {
  try {
    const sessionId = req.query.sessionId as string;
    const transport = sseTransports.find((t) => t.sessionId === sessionId);

    if (transport) {
      await transport.handlePostMessage(req, res, req.body);
    } else {
      res.status(404).send("MCP Session not found or expired");
    }
  } catch (err) {
    next(err);
  }
});

export default router;
