import { Router } from "express";

import * as Controller from "./user.controller";

import { authenticateToken } from "../shared/middlewares/authentication.middleware";

const router: Router = Router();

router.post("/users", Controller.createUser);
router.put("/users", authenticateToken, Controller.updateUserPassword);

export default router;
