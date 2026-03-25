import nodemailer from "nodemailer";
import Setting from "../models/Setting";
import { Op } from "sequelize";

interface MailData {
  to: string;
  subject: string;
  html: string;
}

interface EmailSettings {
  MAIL_HOST: string;
  MAIL_PORT: string;
  MAIL_USER: string;
  MAIL_PASS: string;
  MAIL_FROM: string;
}

const getEmailSettings = async (companyId: number): Promise<EmailSettings | null> => {
  try {
    // SEMPRE buscar configurações da empresa 1 (configuração global do sistema)
    const systemCompanyId = 1;
    console.log("🔍 Buscando configurações de email GLOBAIS (empresa 1) - solicitado por companyId:", companyId);

    const settings = await Setting.findAll({
      where: {
        companyId: systemCompanyId,
        key: {
          [Op.in]: ["MAIL_HOST", "MAIL_PORT", "MAIL_USER", "MAIL_PASS", "MAIL_FROM"]
        }
      }
    });

    console.log("📧 Configurações encontradas:", settings.length, "registros");
    settings.forEach(s => {
      console.log(`   - ${s.key}: ${s.key === 'MAIL_PASS' ? '***' : s.value} (companyId: ${s.companyId})`);
    });

    if (settings.length === 0) {
      console.log("❌ Nenhuma configuração de email encontrada. Configure em Configurações → Email (Super Admin)");
      return null;
    }

    const emailSettings: any = {};
    settings.forEach(setting => {
      emailSettings[setting.key] = setting.value;
    });

    // Verificar se todas as configurações necessárias existem
    if (!emailSettings.MAIL_HOST || !emailSettings.MAIL_USER || !emailSettings.MAIL_PASS) {
      console.log("⚠️ Configurações de email incompletas");
      console.log("   - MAIL_PASS:", !!emailSettings.MAIL_PASS);
      return null;
    }

    // Remover aspas se existirem nas configurações do banco
    return {
      MAIL_HOST: emailSettings.MAIL_HOST.replace(/['"]/g, ''),
      MAIL_PORT: emailSettings.MAIL_PORT?.replace(/['"]/g, '') || "465",
      MAIL_USER: emailSettings.MAIL_USER.replace(/['"]/g, ''),
      MAIL_PASS: emailSettings.MAIL_PASS.replace(/['"]/g, ''),
      MAIL_FROM: emailSettings.MAIL_FROM?.replace(/['"]/g, '') || emailSettings.MAIL_USER.replace(/['"]/g, '')
    } as EmailSettings;
  } catch (error) {
    console.error("❌ Erro ao buscar configurações de email:", error);
    return null;
  }
};

const getEmailTemplate = (logoUrl: string, token: string, systemName: string): string => {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recuperação de Senha</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <!-- Logo -->
              <tr>
                <td align="center" style="padding: 40px 30px 30px 30px;">
                  ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="max-width: 200px; height: auto;">` : `<h1 style="margin: 0; color: #333;">${systemName}</h1>`}
                </td>
              </tr>
              
              <!-- Título -->
              <tr>
                <td style="padding: 0 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #333; text-align: center;">Recuperação de Senha</h2>
                </td>
              </tr>
              
              <!-- Mensagem -->
              <tr>
                <td style="padding: 0 30px 30px 30px; color: #666; line-height: 1.6;">
                  <p style="margin: 0 0 15px 0;">Olá,</p>
                  <p style="margin: 0 0 15px 0;">Recebemos uma solicitação para redefinir a senha da sua conta.</p>
                  <p style="margin: 0 0 15px 0;">Utilize o código abaixo para redefinir sua senha:</p>
                </td>
              </tr>
              
              <!-- Código -->
              <tr>
                <td align="center" style="padding: 0 30px 30px 30px;">
                  <div style="background-color: #f8f9fa; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; display: inline-block;">
                    <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 8px; font-family: 'Courier New', monospace;">${token}</span>
                  </div>
                </td>
              </tr>
              
              <!-- Aviso -->
              <tr>
                <td style="padding: 0 30px 30px 30px; color: #666; line-height: 1.6;">
                  <p style="margin: 0 0 15px 0; font-size: 14px;"><strong>Este código expira em 10 minutos.</strong></p>
                  <p style="margin: 0 0 15px 0; font-size: 14px;">Se você não solicitou a redefinição de senha, por favor, desconsidere este e-mail. Sua senha permanecerá inalterada.</p>
                </td>
              </tr>
              
              <!-- Rodapé -->
              <tr>
                <td style="padding: 30px; background-color: #f8f9fa; border-top: 1px solid #e9ecef; text-align: center; color: #999; font-size: 12px; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0;">Este é um e-mail automático. Por favor, não responda.</p>
                  <p style="margin: 10px 0 0 0;">© ${new Date().getFullYear()} ${systemName}. Todos os direitos reservados.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

export const sendPasswordResetEmail = async (
  email: string,
  token: string,
  companyId: number,
  logoUrl?: string
): Promise<boolean> => {
  try {
    console.log("Buscando configurações de email para companyId:", companyId);
    const emailSettings = await getEmailSettings(companyId);

    if (!emailSettings) {
      console.error("Configurações de email não encontradas para a empresa:", companyId);
      console.log("Configure as opções de email em: Configurações → Email (Super Admin apenas)");
      return false;
    }

    console.log("Configurações de email encontradas:", {
      host: emailSettings.MAIL_HOST,
      port: emailSettings.MAIL_PORT,
      user: emailSettings.MAIL_USER,
      from: emailSettings.MAIL_FROM,
      passLength: emailSettings.MAIL_PASS?.length || 0
    });

    // Buscar o nome da aplicação das configurações
    let systemName = "BotConnecta";
    try {
      const appNameSetting = await Setting.findOne({
        where: {
          companyId,
          key: "appName"
        }
      });
      if (appNameSetting && appNameSetting.value) {
        systemName = appNameSetting.value;
      }
    } catch (error) {
      console.log("Não foi possível buscar o appName, usando nome padrão");
    }

    const transporter = nodemailer.createTransport({
      host: emailSettings.MAIL_HOST,
      port: parseInt(emailSettings.MAIL_PORT || "465"),
      secure: parseInt(emailSettings.MAIL_PORT || "465") === 465,
      auth: {
        user: emailSettings.MAIL_USER,
        pass: emailSettings.MAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log("Transporter criado, gerando template...");

    const htmlContent = getEmailTemplate(logoUrl || "", token, systemName);

    const mailOptions = {
      from: emailSettings.MAIL_FROM || emailSettings.MAIL_USER,
      to: email,
      subject: "Recuperação de Senha",
      html: htmlContent
    };

    console.log("Enviando email para:", email);
    await transporter.sendMail(mailOptions);
    console.log("Email de recuperação enviado com sucesso para:", email);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email de recuperação:", error);
    return false;
  }
};

export const sendEmail = async (
  mailData: MailData,
  companyId: number = 1
): Promise<boolean> => {
  try {
    const emailSettings = await getEmailSettings(companyId);
    if (!emailSettings) {
      console.error("❌ Configurações de email não encontradas. Configure em Configurações → Email.");
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: emailSettings.MAIL_HOST,
      port: parseInt(emailSettings.MAIL_PORT || "465"),
      secure: parseInt(emailSettings.MAIL_PORT || "465") === 465,
      auth: {
        user: emailSettings.MAIL_USER,
        pass: emailSettings.MAIL_PASS
      },
      tls: { rejectUnauthorized: false }
    });

    await transporter.sendMail({
      from: emailSettings.MAIL_FROM || emailSettings.MAIL_USER,
      to: mailData.to,
      subject: mailData.subject,
      html: mailData.html
    });

    console.log("✅ Email enviado com sucesso para:", mailData.to);
    return true;
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    return false;
  }
};

export default {
  sendPasswordResetEmail,
  sendEmail
};
