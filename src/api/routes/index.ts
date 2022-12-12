import express from "express";

import exampleRoutes from "@api/routes/example";
import IpRoutes from "@api/routes/ip";

const router = express.Router();

router.use("/example", exampleRoutes);
router.use("/ip", IpRoutes);

export default router;
