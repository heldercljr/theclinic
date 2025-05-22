import { Request, Response } from "express";

import { UserDTO, PassWordUpdateDTO, UserAuthenticationDTO } from "./user.dto";

import * as UserService from "./user.service";

export async function createUser(request: Request, response: Response): Promise<void> {
	const result = await UserService.createUser({
		responsibleDocument: request.user?.document,
		...request.body
	} as UserDTO);

	response.status(result.statusCode).json(result);
}

export async function authenticateUser(request: Request, response: Response): Promise<void> {
	const result = await UserService.authenticateUser(request.body as UserAuthenticationDTO);

	response.status(result.statusCode).json(result);
}

export async function updateUserPassword(request: Request, response: Response): Promise<void> {
	const result = await UserService.changeUserPassword({
		document: request.user?.document,
		...request.body
	} as PassWordUpdateDTO);

	response.status(result.statusCode).json(result);
}
