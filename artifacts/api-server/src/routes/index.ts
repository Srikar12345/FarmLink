import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import listingsRouter from "./listings";
import ordersRouter from "./orders";
import cropRequestsRouter from "./crop-requests";
import mcpRouter from "./mcp";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(listingsRouter);
router.use(ordersRouter);
router.use(cropRequestsRouter);
router.use(mcpRouter);

export default router;
