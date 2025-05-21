import { Request, Response } from "express";

import { UserDTO, PassWordUpdateDTO, UserAuthenticationDTO } from "./user.dto";

import * as UserService from "./user.service";

export async function createUser(request: Request, response: Response): Promise<void> {
	const { userDocument, userName, userPassWord } = request.body as UserDTO;

	const result = await UserService.createUser({
		responsibleDocument: request.user?.document,
		userDocument,
		userName,
		userPassWord
	} as UserDTO);

	response.status(result.statusCode).json(result);
}

export async function authenticateUser(request: Request, response: Response): Promise<void> {
	const { userDocument, userPassWord } = request.body as UserAuthenticationDTO;

	const result = await UserService.authenticateUser({
		userDocument,
		userPassWord
	} as UserAuthenticationDTO);

	response.status(result.statusCode).json(result);
}

export async function updateUserPassword(request: Request, response: Response): Promise<void> {
	const { document, oldPassWord, newPassWord } = request.body as PassWordUpdateDTO;

	const result = await UserService.changeUserPassword({
		document,
		oldPassWord,
		newPassWord
	} as PassWordUpdateDTO);

	response.status(result.statusCode).json(result);
}
