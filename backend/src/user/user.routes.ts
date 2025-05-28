import { Router } from "express";

import * as Controller from "./user.controller";

import { authenticateToken } from "../shared/middlewares/authentication.middleware";

const router: Router = Router();

router.post("/users", authenticateToken, Controller.createUser);
router.post("/users/authenticate", Controller.authenticateUser);
router.put("/users", authenticateToken, Controller.updateUserPassword);

export default router;
