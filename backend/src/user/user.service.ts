import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";

import { PassWordUpdateDTO, UserAuthenticationDTO, UserDTO, UserPayloadDTO } from "./user.dto";
import { ResponseDTO } from "../shared/interfaces/response.dto";
import { AuditRepository, User, UserRepository } from "../connection";

export async function createUser(dto: UserDTO): Promise<ResponseDTO<UserDTO>> {
	try {
		const administrator: User | null = await UserRepository.findUnique({
			where: {
				document: dto.responsibleDocument,
				role: "ADMINISTRATOR"
			}
		});

		if (!administrator) {
			return { message: "Administrador não encontrado", statusCode: 404 };
		}

		const user: User | null = await UserRepository.findUnique({ where: { document: dto.userDocument } });

		if (user) {
			return { message: `Usuário ${user.name} já cadastrado`, statusCode: 409 };
		}

		await UserRepository.create({
			data: {
				name: dto.userName,
				document: dto.userDocument,
				passWord: await hash(dto.userPassWord, 10)
			}
		});

		const message: string = `Usuário ${dto.userName.split(" ")[0]} cadastrado`;

		await AuditRepository.create({
			data: {
				description: message,
				type: "USER_CREATION",
				user: { connect: { document: administrator.document } }
			}
		});

		return { message, statusCode: 201 };
	} catch (error: any) {
		return { message: error.message, statusCode: 500 };
	}
}

export async function authenticateUser(dto: UserAuthenticationDTO): Promise<ResponseDTO<{ token: string }>> {
	try {
		const user: User | null = await UserRepository.findUnique({ where: { document: dto.userDocument } });

		if (!user || !(await compare(dto.userPassWord, user.passWord))) {
			return { message: "Credenciais inválidas", statusCode: 401 };
		}

		const token: string = sign(
			{ name: user.name, document: user.document } as UserPayloadDTO,
			process.env.JWT_SECRET as string,
			{ expiresIn: "1H" }
		);

		const message: string = `Usuário ${user.name.split(" ")[0]} autenticado`;

		await AuditRepository.create({
			data: {
				description: message,
				type: "USER_AUTHENTICATION",
				user: { connect: { document: user.document } }
			}
		});

		return { data: { token }, message, statusCode: 200 };
	} catch (error: any) {
		return { message: error.message, statusCode: 500 };
	}
}

export async function changeUserPassword(dto: PassWordUpdateDTO): Promise<ResponseDTO<void>> {
	try {
		const user: User | null = await UserRepository.findUnique({ where: { document: dto.document } });

		if (!user || !(await compare(dto.oldPassWord, user.passWord))) {
			return { message: "Credenciais inválidas", statusCode: 401 };
		}

		await UserRepository.update({
			where: { document: dto.document },
			data: { passWord: await hash(dto.newPassWord, 10) }
		});

		const message: string = `Usuário ${user.name.split(" ")[0]} atualizou a senha`;

		await AuditRepository.create({
			data: {
				description: message,
				type: "USER_UPDATE",
				user: { connect: { document: user.document } }
			}
		});

		return { message, statusCode: 200 };
	} catch (error: any) {
		return { message: error.message, statusCode: 500 };
	}
}
