import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

import { UserPayloadDTO } from "../../user/user.dto";

declare global {
	namespace Express {
		interface Request {
			user?: UserPayloadDTO;
		}
	}
}

export function authenticateToken(request: Request, response: Response, next: NextFunction): void {
	const token: string | undefined = request.header("Authorization")?.split(" ")[1];

	if (!token) {
		response.status(401).json({ message: "Token not provided", statusCode: 401 });
	} else {
		verify(token, process.env.JWT_SECRET as string, (error, user) => {
			if (error) {
				response.status(403).json({ message: "Token expired", statusCode: 403 });
			} else {
				request.user = user as UserPayloadDTO;

				next();
			}
		});
	}
}
