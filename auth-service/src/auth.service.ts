import { PrismaClient, AuditType } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

async function auditLogin(description: string, userDocument?: string) {
    try {
        await prisma.audit.create({
            data: {
                description,
                type: AuditType.USER_AUTHENTICATION,
                ...(userDocument ? { user: { connect: { document: userDocument } } } : {})
            }
        });

    } catch {
        // Ignora falha de auditoria
    }
}

export async function authenticateUser(document: string, password: string) {
    if (!document || !password) {
        await auditLogin("Tentativa de login sem documento ou senha");
        return { status: 400, body: { message: "Documento e senha são obrigatórios", statusCode: 400 } };
    }

    try {
        const user = await prisma.user.findUnique({ where: { document } });
        if (!user) {
            await auditLogin(`Tentativa de login falhou: usuário não encontrado (${document})`);
            return { status: 401, body: { message: "Credenciais inválidas", statusCode: 401 } };
        }

        const valid = await bcrypt.compare(password, user.passWord);
        if (!valid) {
            await auditLogin(`Tentativa de login falhou: senha inválida para ${user.name}`, user.document);
            return { status: 401, body: { message: "Credenciais inválidas", statusCode: 401 } };
        }

        const token = jwt.sign(
            { document: user.document, name: user.name, role: user.role }
            , JWT_SECRET,
            { expiresIn: "1h" }
        );

        await auditLogin(`Usuário ${user.name.split(" ")[0]} autenticado com sucesso`, user.document);
        return { status: 200, body: { token } };

    } catch (err) {
        await auditLogin(
            `Tentativa de login falhou: erro interno (${err instanceof Error ? err.message : "erro desconhecido"})`
        );
        return { status: 500, body: { message: "Erro interno ao autenticar", statusCode: 500 } };
    }
}

export async function validateToken(token?: string) {
    if (!token) {
        return { status: 401, body: { message: "Token not provided", statusCode: 401 } };
    }

    try {
        const user = jwt.verify(token, JWT_SECRET);
        return { status: 200, body: { user } };

    } catch (err) {
        return { status: 403, body: { message: "Token expired or invalid", statusCode: 403 } };
    }
}
