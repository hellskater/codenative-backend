import { Router } from "express";

import { ExampleController } from "@api/controllers/example.controller";

const router = Router();

router.get("/", ExampleController.getExample);

export default router;
