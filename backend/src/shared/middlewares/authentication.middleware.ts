import { Request, Response, NextFunction } from "express";
import axios from "axios";

import { UserPayloadDTO } from "../../user/user.dto";

declare global {
	namespace Express {
		interface Request {
			user?: UserPayloadDTO;
		}
	}
}

export async function authenticateToken(request: Request, response: Response, next: NextFunction): Promise<void> {
    const token: string | undefined = request.header("Authorization")?.split(" ")[1];

    if (!token) {
        response.status(401).json({ message: "Token not provided", statusCode: 401 });
        return;
    }

    try {
        const baseUrl = process.env.AUTH_SERVICE_URL || "http://localhost:4000";
        const authServiceUrl = `${baseUrl}/validate-token`;
        const res = await axios.post(authServiceUrl, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        request.user = res.data.user;
        next();
    } catch (error: any) {
        if (error.response && error.response.status === 403) {
            response.status(403).json({ message: "Token expired", statusCode: 403 });
        } else {
            response.status(401).json({ message: "Token invalid or auth service unavailable", statusCode: 401 });
        }
    }
}
