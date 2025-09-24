import express, { type Request, type Response } from "express";
import * as AuthService from "./auth.service.js";

const router = express.Router();

router.post("/validate-token", async (req: Request, res: Response) => {
    const token = req.body.token || req.header("Authorization")?.split(" ")[1];
    const result = await AuthService.validateToken(token);

    return res.status(result.status).json(result.body);
});

router.post("/login", async (req: Request, res: Response) => {
    const { document, password } = req.body;
    const result = await AuthService.authenticateUser(document, password);

    return res.status(result.status).json(result.body);
});

export default router;