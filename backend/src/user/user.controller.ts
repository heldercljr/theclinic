import { Request, Response } from "express";

import { UserDTO, PassWordUpdateDTO, UserAuthenticationDTO } from "./user.dto";

import * as Service from "./user.service";

export async function createUser(request: Request, response: Response): Promise<void> {
	const result = await Service.createUser({
		responsibleDocument: request.user?.document,
		...request.body
	} as UserDTO);

	response.status(result.statusCode).json(result);
}

export async function authenticateUser(request: Request, response: Response): Promise<void> {
	const result = await Service.authenticateUser(request.body as UserAuthenticationDTO);

	response.status(result.statusCode).json(result);
}

export async function updateUserPassword(request: Request, response: Response): Promise<void> {
	const result = await Service.changeUserPassword({
		document: request.user?.document,
		...request.body
	} as PassWordUpdateDTO);

	response.status(result.statusCode).json(result);
}
