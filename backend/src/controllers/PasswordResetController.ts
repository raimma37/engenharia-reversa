import { Request, Response } from "express";
import * as Yup from "yup";
import { Op } from "sequelize";
import AppError from "../errors/AppError";
import User from "../models/User";
import PasswordResetToken from "../models/PasswordResetToken";
import { sendPasswordResetEmail } from "../services/EmailService";
import { hash } from "bcryptjs";

// Gerar código de 6 dígitos
const generateToken = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const requestPasswordReset = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const schema = Yup.object().shape({
        email: Yup.string().email().required()
    });

    try {
        await schema.validate(req.body);
    } catch (err: any) {
        throw new AppError(err.message);
    }

    const { email } = req.body;

    try {
        // Buscar usuário
        const user = await User.findOne({
            where: { email: email.toLowerCase().trim() }
        });

        if (!user) {
            throw new AppError("Email não cadastrado em nosso sistema.", 404);
        }

        console.log("Usuário encontrado:", user.id, "companyId:", user.companyId);

        // Invalidar tokens antigos deste usuário
        try {
            await PasswordResetToken.update(
                { used: true },
                {
                    where: {
                        userId: user.id,
                        used: false
                    }
                }
            );
            console.log("Tokens antigos invalidados");
        } catch (updateError) {
            console.error("Erro ao invalidar tokens antigos:", updateError);
            // Continuar mesmo se falhar (talvez não exista nenhum token antigo)
        }

        // Gerar novo token
        const token = generateToken();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minutos

        console.log("Token gerado:", token);

        // Salvar token no banco
        try {
            await PasswordResetToken.create({
                email: email.toLowerCase().trim(),
                token,
                userId: user.id,
                companyId: user.companyId,
                expiresAt,
                used: false
            });
            console.log("Token salvo no banco");
        } catch (createError: any) {
            console.error("Erro ao criar token:", createError);
            throw new AppError("Erro ao criar token de recuperação. A tabela pode não existir. Execute: npm run db:migrate", 500);
        }

        // Enviar email
        console.log("Tentando enviar email para:", email);
        const emailSent = await sendPasswordResetEmail(
            email,
            token,
            user.companyId
        );

        if (!emailSent) {
            throw new AppError("Erro ao enviar email. Peça ao administrador do sistema para configurar as opções de email.", 500);
        }

        console.log("Email enviado com sucesso");

        return res.status(200).json({
            message: "Código de recuperação enviado para o email."
        });
    } catch (error: any) {
        console.error("Erro em requestPasswordReset:", error);
        throw new AppError(error.message || "Erro ao processar solicitação de recuperação de senha.", 500);
    }
};

export const validateToken = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const schema = Yup.object().shape({
        token: Yup.string().required().length(6)
    });

    try {
        await schema.validate(req.body);
    } catch (err: any) {
        throw new AppError(err.message);
    }

    const { token } = req.body;

    // Buscar token
    const resetToken = await PasswordResetToken.findOne({
        where: {
            token,
            used: false,
            expiresAt: {
                [Op.gt]: new Date()
            }
        }
    });

    if (!resetToken) {
        throw new AppError("Código inválido ou expirado.", 400);
    }

    return res.status(200).json({
        message: "Código válido",
        valid: true
    });
};

export const resetPassword = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const schema = Yup.object().shape({
        token: Yup.string().required().length(6),
        newPassword: Yup.string().required().min(6)
    });

    try {
        await schema.validate(req.body);
    } catch (err: any) {
        throw new AppError(err.message);
    }

    const { token, newPassword } = req.body;

    // Buscar token
    const resetToken = await PasswordResetToken.findOne({
        where: {
            token,
            used: false,
            expiresAt: {
                [Op.gt]: new Date()
            }
        },
        include: [User]
    });

    if (!resetToken) {
        throw new AppError("Código inválido ou expirado.", 400);
    }

    // Atualizar senha do usuário
    const passwordHash = await hash(newPassword, 8);
    await User.update(
        { passwordHash },
        { where: { id: resetToken.userId } }
    );

    // Marcar token como usado
    await resetToken.update({ used: true });

    return res.status(200).json({
        message: "Senha redefinida com sucesso!"
    });
};
