import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static web build of the React Native client
const mobileDist = path.resolve(process.cwd(), "artifacts/mobile/dist");
app.use(express.static(mobileDist));

app.use("/api", router);

// Catch-all handler for client-side routing fallback (SPA support)
app.get('/{*path}', (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(mobileDist, "index.html"));
});

export default app;
