import { Router } from "express";

import * as UserController from "./user.controller";

import { authenticateToken } from "../middlewares/authentication.middleware";

const router: Router = Router();

router.post("/users", authenticateToken, UserController.createUser);
router.post("/users/authenticate", UserController.authenticateUser);
router.put("/users", authenticateToken, UserController.updateUserPassword);

export default router;
