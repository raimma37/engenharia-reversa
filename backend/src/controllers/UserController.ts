import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import { isEmpty, isNil } from "lodash";
import CheckSettingsHelper from "../helpers/CheckSettings";
import AppError from "../errors/AppError";

import CreateUserService from "../services/UserServices/CreateUserService";
import ListUsersService from "../services/UserServices/ListUsersService";
import UpdateUserService from "../services/UserServices/UpdateUserService";
import ShowUserService from "../services/UserServices/ShowUserService";
import DeleteUserService from "../services/UserServices/DeleteUserService";
import SimpleListService from "../services/UserServices/SimpleListService";
import CreateCompanyService from "../services/CompanyService/CreateCompanyService";
import { SendMail } from "../helpers/SendMail";
import EmailService from "../services/EmailService";
import { setCode, verifyCode, checkVerification, clearVerification } from "../helpers/VerificationStore";
import { useDate } from "../utils/useDate";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";
import { getWbot } from "../libs/wbot";
import FindCompaniesWhatsappService from "../services/CompanyService/FindCompaniesWhatsappService";
import User from "../models/User";

import { head } from "lodash";
import ToggleChangeWidthService from "../services/UserServices/ToggleChangeWidthService";
import APIShowEmailUserService from "../services/UserServices/APIShowEmailUserService";
import UpdateUserOnlineStatusService from "../services/UserServices/UpdateUserOnlineStatusService";
import GetOnlineUsersService from "../services/UserServices/GetOnlineUsersService";
import Chat from "../models/Chat";
import ChatUser from "../models/ChatUser";
import Plan from "../models/Plan";
import axios from "axios";
import logger from "../utils/logger";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId, profile } = req.user;

  const { users, count, hasMore } = await ListUsersService({
    searchParam,
    pageNumber,
    companyId,
    profile
  });

  return res.json({ users, count, hasMore });
};

export const sendVerificationCode = async (req: Request, res: Response): Promise<Response> => {
  const { email, name } = req.body;
  if (!email || !name) throw new AppError("Email e nome são obrigatórios", 400);

  const appName = process.env.APP_NAME || "Sistema";
  const code = setCode(email, name);

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#ffffff;border-radius:12px;">
      <h2 style="color:#222;margin-bottom:8px;">Verificação de Cadastro</h2>
      <p style="color:#444;margin-bottom:4px;">Olá <strong>${name}</strong>,</p>
      <p style="color:#444;margin-bottom:24px;">Seu código de verificação para concluir o cadastro é:</p>
      <div style="background:#f4f4f4;border-radius:10px;padding:28px;text-align:center;margin-bottom:24px;">
        <span style="font-size:40px;font-weight:bold;letter-spacing:14px;color:#222;">${code}</span>
      </div>
      <p style="color:#444;">Este código expira em <strong>10 minutos</strong>.</p>
      <p style="color:#999;font-size:12px;margin-top:24px;">Se você não solicitou este cadastro, ignore este e-mail.</p>
    </div>`;

  try {
    const sent = await EmailService.sendEmail({ to: email, subject: `Verificação de Cadastro - ${appName}`, html });
    if (!sent) {
      logger.warn("[USER] Não consegui enviar o email de verificação");
      throw new AppError("Erro ao enviar e-mail de verificação. Verifique as configurações de SMTP em Configurações → Email.", 500);
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    logger.warn("[USER] Não consegui enviar o email de verificação");
    logger.warn(err);
    throw new AppError("Erro ao enviar e-mail de verificação. Verifique o endereço e tente novamente.", 500);
  }
  return res.status(200).json({ ok: true });
};

export const verifyEmailCode = async (req: Request, res: Response): Promise<Response> => {
  const { email, code } = req.body;
  if (!email || !code) throw new AppError("Email e código são obrigatórios", 400);
  const token = verifyCode(email, code);
  if (!token) throw new AppError("Código inválido ou expirado", 400);
  return res.status(200).json({ token });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    email,
    password,
    name,
    phone,
    profile,
    companyId: bodyCompanyId,
    queueIds,
    companyName,
    planId,
    verificationToken,
    startWork,
    endWork,
    whatsappId,
    whatsappIds,
    allTicket,
    defaultTheme,
    defaultMenu,
    allowGroup,
    allHistoric,
    allUserChat,
    userClosePendingTicket,
    showDashboard,
    defaultTicketsManagerWidth = 550,
    allowRealTime,
    allowConnections,
    showContacts,
    showCampaign,
    showFlow,
    birthDate,
    allowSeeMessagesInPendingTickets = "enabled",
    showReturnQueueButton = "enabled",
    showTransferTicketButton = "enabled",
    document // CNPJ da empresa

  } = req.body;
  let userCompanyId: number | null = null;

  const { dateToClient } = useDate();

  if (req.user !== undefined) {
    const { companyId: cId } = req.user;
    userCompanyId = cId;
  }

  if (
    req.url === "/signup" &&
    (await CheckSettingsHelper("userCreation")) === "disabled"
  ) {
    throw new AppError("ERR_USER_CREATION_DISABLED", 403);
  } else if (req.url !== "/signup" && req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  if (process.env.DEMO === "ON") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  // Validar se CPF/CNPJ foi fornecido no signup — somente se a configuração estiver habilitada
  if (req.url === "/signup") {
    // Verificar token de validação de email
    if (!verificationToken || !checkVerification(email, verificationToken)) {
      throw new AppError("E-mail não verificado. Por favor, confirme o código enviado para seu e-mail.", 403);
    }
    // No signup público, a configuração é da empresa 1 (empresa administradora)
    const requireDocument = await CheckSettingsHelper("requireDocument", 1);
    if (requireDocument === "enabled" && (!document || document.trim() === "")) {
      throw new AppError("CNPJ é obrigatório para o cadastro", 400);
    }
  }

  const companyUser = bodyCompanyId || userCompanyId;

  let plan = null;
  if (planId) {
    plan = await Plan.findByPk(planId, {
      attributes: ["id", "name", "trial", "trialDays"]
    });
  }

  if (!companyUser) {
    let date = "";
    if (plan.trial === true) {
      const dataNowMoreTwoDays = new Date();
      dataNowMoreTwoDays.setDate(dataNowMoreTwoDays.getDate() + Number(plan?.trialDays || 3));

      date = dataNowMoreTwoDays.toISOString().split("T")[0];
    } else {
      const dataNowMoreTwoDays = new Date();
      dataNowMoreTwoDays.setDate(dataNowMoreTwoDays.getDate() + 3);

      date = dataNowMoreTwoDays.toISOString().split("T")[0];
    }

    const companyData = {
      name: companyName,
      email: email,
      phone: phone,
      planId: planId,
      status: true,
      dueDate: date,
      recurrence: "",
      document: document ? document.replace(/\D/g, '') : "",
      paymentMethod: "",
      password: password,
      companyUserName: name,
      startWork: startWork,
      endWork: endWork,
      defaultTheme: "light",
      defaultMenu: "closed",
      allowGroup: false,
      allHistoric: false,
      userClosePendingTicket: "enabled",
      allowSeeMessagesInPendingTickets: "enabled",
      showDashboard: "disabled",
      defaultTicketsManagerWidth: 550,
      allowRealTime: "disabled",
      allowConnections: "disabled"
    };

    const user = await CreateCompanyService(companyData);

    // Limpar verificação após cadastro concluído
    clearVerification(email);

    try {
      const appName = process.env.APP_NAME || "Sistema";
      const loginUrl = process.env.FRONTEND_URL || process.env.REACT_APP_BACKEND_URL || "";
      const welcomeHtml = `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;background:#ffffff;border-radius:12px;">
          <h2 style="color:#222;margin-bottom:8px;">Olá ${name}. Seja bem vindo(a) ao ${appName}!</h2>
          <p style="color:#555;margin-bottom:24px;">Para acessar sua conta, clique no botão abaixo:</p>
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${loginUrl}/login" style="display:inline-block;background:#111;color:#fff;padding:14px 36px;border-radius:8px;font-size:16px;font-weight:700;text-decoration:none;">Acessar minha conta</a>
          </div>
          <div style="background:#f9f9f9;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
            <p style="margin:0 0 12px;font-weight:700;color:#333;">&#128203; Seus dados de acesso:</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;color:#444;">
              <tr><td style="padding:6px 0;color:#777;">Empresa:</td><td style="padding:6px 0;font-weight:600;">${companyName}</td></tr>
              <tr><td style="padding:6px 0;color:#777;">E-mail:</td><td style="padding:6px 0;font-weight:600;">${email}</td></tr>
              <tr><td style="padding:6px 0;color:#777;">Senha:</td><td style="padding:6px 0;font-weight:600;">${password}</td></tr>
              <tr><td style="padding:6px 0;color:#777;">Vencimento:</td><td style="padding:6px 0;font-weight:600;">${dateToClient(date)}</td></tr>
            </table>
          </div>
          <p style="color:#555;font-size:13px;"><strong>Este link expira em 1 hora.</strong> Caso não consiga usá-lo, acesse o link abaixo com a senha que você criou no momento do cadastro:</p>
          <p style="font-size:13px;"><a href="${loginUrl}/login" style="color:#0070f3;word-break:break-all;">${loginUrl}/login</a></p>
        </div>`;
      await EmailService.sendEmail({
        to: email,
        subject: `Bem-vindo ao ${appName} - Seus dados de acesso`,
        html: welcomeHtml
      });
    } catch (error) {
      logger.warn("[USER] Não consegui enviar o email de cadastro");
    }

    try {
      const company = await ShowCompanyService(1);
      const whatsappCompany = await FindCompaniesWhatsappService(company.id);

      if (
        whatsappCompany.whatsapps[0].status === "CONNECTED" &&
        (phone !== undefined || !isNil(phone) || !isEmpty(phone))
      ) {
        const whatsappId = whatsappCompany.whatsapps[0].id;
        const wbot = getWbot(whatsappId);

        const body = `Olá ${name}, este é uma mensagem sobre o cadastro da sua empresa ${companyName}!\n\nSegue os dados da sua empresa:\n\nNome: ${companyName}\nEmail: ${email}\nData Vencimento Trial: ${dateToClient(
          date
        )}`;

        await wbot.sendMessage(`55${phone}@s.whatsapp.net`, { text: body });
      }
    } catch (error) {
      logger.warn("[USER] Não consegui enviar a mensagem de cadastro via WhatsApp");
    }

    return res.status(200).json(user);
  }

  if (companyUser) {
    const user = await CreateUserService({
      email,
      password,
      name,
      profile,
      companyId: companyUser,
      queueIds,
      startWork,
      endWork,
      whatsappId,
      whatsappIds,
      allTicket,
      defaultTheme,
      defaultMenu,
      allowGroup,
      allHistoric,
      allUserChat,
      userClosePendingTicket,
      showDashboard,
      defaultTicketsManagerWidth,
      allowRealTime,
      allowConnections,
      showContacts,
      showCampaign,
      showFlow,
      birthDate,
      allowSeeMessagesInPendingTickets,
      showReturnQueueButton,
      showTransferTicketButton
    });

    const userData = await User.findByPk(user.id);

    await User.createInitialChat(userData);

    const chats = await Chat.findAll({
      include: [
        {
          model: ChatUser,
          where: { userId: user.id }
        }
      ]
    });

    const io = getIO();
    io.of(userCompanyId.toString()).emit(`company-${userCompanyId}-user`, {
      action: "create",
      user
    });

    return res.status(200).json({ user, chats });
  }
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;
  const { companyId } = req.user;

  const user = await ShowUserService(userId, companyId);

  return res.status(200).json(user);
};

export const showEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { email } = req.params;

  const user = await APIShowEmailUserService(email);

  return res.status(200).json(user);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // if (req.user.profile !== "admin") {
  //   throw new AppError("ERR_NO_PERMISSION", 403);
  // }

  if (process.env.DEMO === "ON") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { id: requestUserId, companyId } = req.user;
  const { userId } = req.params;
  const userData = req.body;

  const user = await UpdateUserService({
    userData,
    userId,
    companyId,
    requestUserId: +requestUserId
  });

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-user`, {
    action: "update",
    user
  });

  return res.status(200).json(user);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const { companyId, id, profile } = req.user;

  if (profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  if (process.env.DEMO === "ON") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const user = await User.findOne({
    where: { id: userId }
  });

  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }

  if (companyId !== user.companyId) {
    return res
      .status(400)
      .json({ error: "Você não possui permissão para acessar este recurso!" });
  } else {
    await DeleteUserService(userId, companyId);

    const io = getIO();
    io.of(String(companyId)).emit(`company-${companyId}-user`, {
      action: "delete",
      userId
    });

    return res.status(200).json({ message: "User deleted" });
  }
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.query;
  const { companyId: userCompanyId } = req.user;

  const users = await SimpleListService({
    companyId: companyId ? +companyId : userCompanyId
  });

  return res.status(200).json(users);
};

export const mediaUpload = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const { companyId } = req.user;
  const files = req.files as Express.Multer.File[];
  const file = head(files);

  if (!file) {
    throw new AppError("Nenhum arquivo foi enviado", 400);
  }

  try {
    let user = await User.findByPk(userId);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (user.companyId !== companyId) {
      throw new AppError("Usuário não pertence a esta empresa", 403);
    }

    // Salvar apenas o nome do arquivo (sem caminho)
    user.profileImage = file.filename;
    await user.save();

    // Buscar usuário atualizado com todas as relações
    user = await ShowUserService(userId, companyId);

    // Emitir evento socket para atualizar em tempo real
    const io = getIO();
    io.of(String(companyId)).emit(`company-${companyId}-user`, {
      action: "update",
      user
    });

    return res.status(200).json({
      user,
      message: "Imagem atualizada com sucesso"
    });
  } catch (err: any) {
    console.error("Erro no upload da imagem:", err);
    throw new AppError(err.message || "Erro interno do servidor");
  }
};

export const toggleChangeWidht = async (
  req: Request,
  res: Response
): Promise<Response> => {
  var { userId } = req.params;
  const { defaultTicketsManagerWidth } = req.body;

  const { companyId } = req.user;
  const user = await ToggleChangeWidthService({
    userId,
    defaultTicketsManagerWidth
  });

  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-user`, {
    action: "update",
    user
  });

  return res.status(200).json(user);
};

export const updateOnlineStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const { online } = req.body;

  await UpdateUserOnlineStatusService({
    userId: +userId,
    online
  });

  return res.status(200).json({ message: "Status updated" });
};

export const getOnlineUsers = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const users = await GetOnlineUsersService({
    companyId
  });

  return res.status(200).json(users);
};

export const validateCnpj = async (req: Request, res: Response): Promise<Response> => {
  const { cnpj } = req.body;

  if (!cnpj) {
    throw new AppError("CPF ou CNPJ é obrigatório", 400);
  }

  // Limpar o documento (remover formatação)
  const cleanDocument = cnpj.replace(/\D/g, '');

  // Detectar se é CPF ou CNPJ
  const isCpf = cleanDocument.length === 11;
  const isCnpj = cleanDocument.length === 14;

  if (!isCpf && !isCnpj) {
    throw new AppError("CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos", 400);
  }

  if (isCpf) {
    // Validação local do CPF
    if (!validateCpf(cleanDocument)) {
      throw new AppError("CPF inválido", 400);
    }

    return res.status(200).json({
      valid: true,
      data: {
        nome: "Pessoa Física",
        cpf: cleanDocument,
        tipo: "cpf"
      }
    });
  }

  // Validação do CNPJ na Receita Federal
  try {
    const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${cleanDocument}`);
    const data = response.data;

    if (data.status === "ERROR") {
      throw new AppError("CNPJ inválido ou não encontrado na Receita Federal", 400);
    }

    return res.status(200).json({
      valid: true,
      data: {
        nome: data.nome,
        cnpj: cleanDocument,
        email: data.email,
        telefone: data.telefone,
        logradouro: data.logradouro,
        numero: data.numero,
        complemento: data.complemento,
        bairro: data.bairro,
        municipio: data.municipio,
        uf: data.uf,
        cep: data.cep,
        situacao: data.situacao,
        tipo: "cnpj"
      }
    });

  } catch (error: any) {
    console.error("Erro ao validar CNPJ:", error);

    if (error.response?.status === 404) {
      throw new AppError("CNPJ não encontrado na Receita Federal", 404);
    }

    throw new AppError("Erro ao validar CNPJ. Tente novamente.", 500);
  }
};

// Função para validar CPF
const validateCpf = (cpf: string): boolean => {
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;

  return true;
};

export default {
  index,
  store,
  show,
  showEmail,
  update,
  remove,
  list,
  mediaUpload,
  toggleChangeWidht,
  updateOnlineStatus,
  getOnlineUsers,
  validateCnpj
};
