import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import {
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
  Divider,
  Chip,
  Box,
} from "@material-ui/core";
import { Field, Form, Formik } from "formik";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import axios from "axios";
import usePlans from "../../hooks/usePlans";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(4),
    paddingBottom: 100,
    background: theme.mode === "dark"
      ? "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)"
      : "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)",
    borderRadius: 0,
    boxShadow: theme.mode === "dark"
      ? "0 8px 32px rgba(0, 0, 0, 0.4)"
      : "0 8px 32px rgba(0, 0, 0, 0.08)",
  },
  headerSection: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
    borderRadius: 12,
    background: theme.mode === "dark"
      ? "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)"
      : "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
    color: "#fff",
    boxShadow: "0 4px 20px rgba(25, 118, 210, 0.3)",
  },
  mainTitle: {
    fontWeight: 700,
    fontSize: "2rem",
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  subtitle: {
    opacity: 0.95,
    fontSize: "1rem",
  },
  menuList: {
    background: theme.mode === "dark"
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: theme.spacing(2.5),
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
    boxShadow: theme.mode === "dark"
      ? "0 4px 12px rgba(0, 0, 0, 0.3)"
      : "0 4px 12px rgba(0, 0, 0, 0.06)",
    "& ol": {
      margin: 0,
      paddingLeft: theme.spacing(3),
    },
    "& li": {
      marginBottom: theme.spacing(1),
      fontSize: "1rem",
      lineHeight: 1.8,
      color: theme.mode === "dark" ? "#e0e0e0" : "#333",
    },
  },
  instructionsBox: {
    background: theme.mode === "dark"
      ? "rgba(255, 193, 7, 0.1)"
      : "rgba(255, 193, 7, 0.08)",
    borderLeft: `4px solid ${theme.palette.warning.main}`,
    borderRadius: 8,
    padding: theme.spacing(2.5),
    marginTop: theme.spacing(2),
    "& ul": {
      marginTop: theme.spacing(1),
      paddingLeft: theme.spacing(3),
    },
    "& li": {
      marginBottom: theme.spacing(1),
      lineHeight: 1.7,
    },
  },
  sectionTitle: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    fontWeight: 700,
    fontSize: "1.3rem",
  },
  elementMargin: {
    padding: theme.spacing(2),
  },
  formContainer: {
    maxWidth: 500,
  },
  textRight: {
    textAlign: "right",
  },
  endpointBox: {
    background: theme.mode === "dark"
      ? "linear-gradient(135deg, #263238 0%, #37474f 100%)"
      : "linear-gradient(135deg, #eceff1 0%, #cfd8dc 100%)",
    borderRadius: 8,
    padding: theme.spacing(2),
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontSize: 13,
    wordBreak: "break-all",
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
    border: theme.mode === "dark"
      ? "1px solid rgba(255, 255, 255, 0.1)"
      : "1px solid rgba(0, 0, 0, 0.1)",
    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.1)",
    color: theme.mode === "dark" ? "#82aaff" : "#1565c0",
    fontWeight: 600,
  },
  chip: {
    marginRight: theme.spacing(0.5),
    marginBottom: theme.spacing(0.5),
    fontWeight: 500,
  },
  sectionDivider: {
    margin: theme.spacing(4, 0),
    height: 2,
    background: theme.mode === "dark"
      ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
      : "linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)",
  },
  badgeNew: {
    background: "linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)",
    color: "#fff",
    borderRadius: 6,
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 700,
    marginLeft: 10,
    verticalAlign: "middle",
    boxShadow: "0 2px 8px rgba(76, 175, 80, 0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  codeBlock: {
    backgroundColor: theme.mode === "dark" ? "#1e1e1e" : "#2d2d2d",
    color: "#d4d4d4",
    borderRadius: 8,
    padding: theme.spacing(2.5),
    fontFamily: "'Fira Code', 'Courier New', monospace",
    fontSize: 13,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    marginTop: theme.spacing(2),
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    position: "relative",
    "&::before": {
      content: '"JSON"',
      position: "absolute",
      top: 8,
      right: 12,
      fontSize: 10,
      color: "#888",
      textTransform: "uppercase",
      letterSpacing: "1px",
    },
  },
  sectionCard: {
    background: theme.mode === "dark"
      ? "rgba(255, 255, 255, 0.03)"
      : "#ffffff",
    borderRadius: 12,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    boxShadow: theme.mode === "dark"
      ? "0 4px 16px rgba(0, 0, 0, 0.4)"
      : "0 4px 16px rgba(0, 0, 0, 0.06)",
    border: theme.mode === "dark"
      ? "1px solid rgba(255, 255, 255, 0.05)"
      : "1px solid rgba(0, 0, 0, 0.05)",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: theme.mode === "dark"
        ? "0 6px 24px rgba(0, 0, 0, 0.5)"
        : "0 6px 24px rgba(0, 0, 0, 0.1)",
      transform: "translateY(-2px)",
    },
  },
}));

const MessagesAPI = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  const [file, setFile] = useState({});
  const { user } = useContext(AuthContext);
  const { getPlanCompany } = usePlans();
  const [bulkMessages, setBulkMessages] = useState("");

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useExternalApi) {
        toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
        setTimeout(() => history.push(`/`), 1000);
      }
    }
    fetchData();
  }, []);

  const getEndpoint = () => process.env.REACT_APP_BACKEND_URL + "/api/messages/send";
  const getCheckEndpoint = () => process.env.REACT_APP_BACKEND_URL + "/api/messages/checkNumber";
  const getNoTicketEndpoint = () => process.env.REACT_APP_BACKEND_URL + "/api/messages/send/noTicket";
  const getBulkEndpoint = () => process.env.REACT_APP_BACKEND_URL + "/api/messages/send/bulk";
  const getLinkImageEndpoint = () => process.env.REACT_APP_BACKEND_URL + "/api/messages/send/linkImage";
  const getConnectionsEndpoint = () => process.env.REACT_APP_BACKEND_URL + "/api/messages/connections";
  const getButtonsEndpoint = () => process.env.REACT_APP_BACKEND_URL + "/api/messages/send/buttons";

  const handleSendTextMessage = async (values) => {
    const { number, body, userId, queueId } = values;
    try {
      await axios.post(getEndpoint(), { number, body, userId, queueId }, {
        headers: { "Content-type": "application/json", Authorization: `Bearer ${values.token}` },
      });
      toast.success("Mensagem enviada com sucesso");
    } catch (err) { toastError(err); }
  };

  const handleSendMediaMessage = async (values) => {
    try {
      const firstFile = file[0];
      const data = new FormData();
      data.append("number", values.number);
      data.append("body", values.body ? values.body : firstFile.name);
      data.append("userId", values.userId);
      data.append("queueId", values.queueId);
      data.append("medias", firstFile);
      await axios.post(getEndpoint(), data, {
        headers: { "Content-type": "multipart/form-data", Authorization: `Bearer ${values.token}` },
      });
      toast.success("Mensagem enviada com sucesso");
    } catch (err) { toastError(err); }
  };

  const handleCheckNumber = async (values) => {
    try {
      const res = await axios.post(getCheckEndpoint(), { number: values.number }, {
        headers: { "Content-type": "application/json", Authorization: `Bearer ${values.token}` },
      });
      if (res.data.existsInWhatsapp) {
        toast.success(`✅ Número existe no WhatsApp: ${res.data.numberFormatted}`);
      } else {
        toast.warn("❌ Número não encontrado no WhatsApp");
      }
    } catch (err) { toastError(err); }
  };

  const handleSendNoTicket = async (values) => {
    try {
      await axios.post(getNoTicketEndpoint(), { number: values.number, body: values.body }, {
        headers: { "Content-type": "application/json", Authorization: `Bearer ${values.token}` },
      });
      toast.success("Mensagem enviada (sem ticket)");
    } catch (err) { toastError(err); }
  };

  const handleSendLinkImage = async (values) => {
    try {
      await axios.post(getLinkImageEndpoint(), { number: values.number, url: values.url, caption: values.caption }, {
        headers: { "Content-type": "application/json", Authorization: `Bearer ${values.token}` },
      });
      toast.success("Imagem enviada com sucesso");
    } catch (err) { toastError(err); }
  };

  const handleSendBulk = async (values) => {
    try {
      let messages;
      try {
        messages = JSON.parse(bulkMessages);
      } catch {
        toast.error('JSON inválido. Use o formato: [{"number":"55...","body":"texto"}]');
        return;
      }
      const res = await axios.post(getBulkEndpoint(), { messages, delay: Number(values.delay) || 2000 }, {
        headers: { "Content-type": "application/json", Authorization: `Bearer ${values.token}` },
      });
      toast.success(`Lote enviado: ${res.data.sent}/${res.data.total} mensagens com sucesso`);
    } catch (err) { toastError(err); }
  };

  const handleListConnections = async (values) => {
    try {
      const res = await axios.get(getConnectionsEndpoint(), {
        headers: { Authorization: `Bearer ${values.token}` },
      });
      toast.success(`${res.data.connections.length} conexão(ões) encontrada(s). Veja o console para detalhes.`);
      console.table(res.data.connections);
    } catch (err) { toastError(err); }
  };

  const [buttonsJson, setButtonsJson] = useState('[{"text":"Vendas","id":"1","queueId":5,"userId":12},{"text":"Suporte","id":"2","queueId":3},{"text":"Financeiro","id":"3"}]');
  const [mixedButtonsJson, setMixedButtonsJson] = useState('[{"type":"quick_reply","text":"Vendas","id":"1"},{"type":"quick_reply","text":"Suporte","id":"2"},{"type":"cta_url","text":"Abrir site","url":"https://seusite.com.br"}]');

  const handleSendButtons = async (values) => {
    try {
      let buttons;
      try {
        buttons = JSON.parse(buttonsJson);
      } catch {
        toast.error('JSON de botões inválido. Use: [{"text":"Texto","id":"1"}]');
        return;
      }
      await axios.post(getButtonsEndpoint(), {
        number: values.number,
        body: values.body,
        footer: values.footer || undefined,
        type: "buttons",
        buttons,
      }, {
        headers: { "Content-type": "application/json", Authorization: `Bearer ${values.token}` },
      });
      toast.success("Mensagem com botões enviada com sucesso");
    } catch (err) { toastError(err); }
  };

  const handleSendMixedButtons = async (values) => {
    try {
      let buttons;
      try {
        buttons = JSON.parse(mixedButtonsJson);
      } catch {
        toast.error('JSON de botões inválido. Use: [{"type":"quick_reply","text":"Texto","id":"1"},{"type":"cta_url","text":"Abrir","url":"https://..."}]');
        return;
      }
      await axios.post(getButtonsEndpoint(), {
        number: values.number,
        body: values.body,
        footer: values.footer || undefined,
        type: "mixed",
        buttons,
      }, {
        headers: { "Content-type": "application/json", Authorization: `Bearer ${values.token}` },
      });
      toast.success("Mensagem com botões mistos enviada com sucesso");
    } catch (err) { toastError(err); }
  };

  const renderSection = (number, title, isNew, docContent, formContent) => (
    <Box className={classes.sectionCard}>
      <Typography variant="h6" color="primary" style={{ fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center" }}>
        <Box component="span" style={{
          background: theme.mode === "dark"
            ? "linear-gradient(135deg, #1565c0, #1976d2)"
            : "linear-gradient(135deg, #1976d2, #42a5f5)",
          color: "#fff",
          borderRadius: "50%",
          width: 32,
          height: 32,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
          fontWeight: 700,
          fontSize: 14,
          boxShadow: theme.mode === "dark"
            ? "0 2px 8px rgba(25, 118, 210, 0.5)"
            : "0 2px 8px rgba(25, 118, 210, 0.3)",
        }}>
          {number}
        </Box>
        {title}
        {isNew && <span className={classes.badgeNew}>NOVO</span>}
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box className={classes.elementMargin}>
            {docContent}
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box style={{
            background: theme.mode === "dark"
              ? "rgba(25, 118, 210, 0.12)"
              : "rgba(25, 118, 210, 0.04)",
            borderRadius: 8,
            padding: 16,
            border: theme.mode === "dark"
              ? "1px dashed rgba(25, 118, 210, 0.3)"
              : "1px dashed rgba(25, 118, 210, 0.2)",
          }}>
            <Typography style={{
              fontWeight: 700,
              marginBottom: 12,
              color: theme.mode === "dark" ? "#64b5f6" : "#1976d2"
            }}>
              🧪 Teste de envio
            </Typography>
            {formContent}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  const renderSimpleForm = (initialValues, onSubmit, fields, submitLabel = "Enviar") => (
    <Formik initialValues={initialValues} enableReinitialize onSubmit={(values, actions) => {
      setTimeout(async () => { await onSubmit(values); actions.setSubmitting(false); actions.resetForm(); }, 400);
    }}>
      {({ isSubmitting }) => (
        <Form className={classes.formContainer}>
          <Grid container spacing={2}>
            {fields.map((f) => (
              <Grid item xs={12} md={f.md || 12} key={f.name}>
                <Field as={TextField} label={f.label} name={f.name} variant="outlined" margin="dense" fullWidth required={f.required !== false} multiline={f.multiline} rows={f.rows} />
              </Grid>
            ))}
            <Grid item xs={12} className={classes.textRight}>
              <Button type="submit" color="primary" variant="contained">
                {isSubmitting ? <CircularProgress size={24} /> : submitLabel}
              </Button>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );

  return (
    <Paper className={classes.mainPaper} style={{ marginLeft: "5px" }} variant="outlined">
      {/* Header Section */}
      <Box className={classes.headerSection}>
        <Typography className={classes.mainTitle}>
          📡 Documentação da API de Mensagens
        </Typography>
        <Typography className={classes.subtitle}>
          Envie mensagens de texto, mídia, botões interativos e muito mais via API REST
        </Typography>
      </Box>

      {/* Menu de Métodos */}
      <Box className={classes.menuList}>
        <Typography variant="h6" style={{
          fontWeight: 700,
          marginBottom: 12,
          color: theme.mode === "dark" ? "#64b5f6" : "#1976d2"
        }}>
          📋 Métodos Disponíveis
        </Typography>
        <ol>
          <li>Mensagens de Texto</li>
          <li>Mensagens de Mídia</li>
          <li>Verificar Número <span className={classes.badgeNew}>NOVO</span></li>
          <li>Envio Sem Ticket <span className={classes.badgeNew}>NOVO</span></li>
          <li>Imagem por URL <span className={classes.badgeNew}>NOVO</span></li>
          <li>Envio em Lote <span className={classes.badgeNew}>NOVO</span></li>
          <li>Listar Conexões <span className={classes.badgeNew}>NOVO</span></li>
          <li>Mensagem com Botões <span className={classes.badgeNew}>NOVO</span></li>
          <li>Botões Mistos (quick_reply + URL) <span className={classes.badgeNew}>NOVO</span></li>
        </ol>
      </Box>

      {/* Instruções */}
      <Box className={classes.instructionsBox}>
        <Typography variant="h6" style={{ fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          ⚠️ Instruções Importantes
        </Typography>
        <ul>
          <li>Antes de enviar mensagens, é necessário o cadastro do token vinculado à conexão que enviará as mensagens. Acesse o menu <b>Conexões</b>, clique em editar e insira o token.</li>
          <li>O número não deve ter máscara ou caracteres especiais e deve ser composto por: Código do País + DDD + Número (ex: 5511999998888)</li>
          <li>Todos os endpoints exigem o header: <code style={{
            background: theme.mode === "dark"
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.05)",
            padding: "2px 6px",
            borderRadius: 4,
            fontFamily: "monospace",
            fontSize: 13,
            color: theme.mode === "dark" ? "#82aaff" : "inherit",
          }}>Authorization: Bearer SEU_TOKEN</code></li>
        </ul>
      </Box>

      <Divider className={classes.sectionDivider} />

      {/* 1. TEXTO */}
      {renderSection(1, "Mensagens de Texto", false,
        <>
          <p>Envio de mensagem de texto com registro de ticket.</p>
          <div className={classes.endpointBox}><b>POST</b> {getEndpoint()}</div>
          <b>Headers:</b> Authorization Bearer (token) e Content-Type (application/json)<br /><br />
          <b>Body JSON:</b>
          <div className={classes.codeBlock}>{`{
  "number": "5585999999999",
  "body": "Mensagem",
  "userId": "ID do usuário ou ''",
  "queueId": "ID da fila ou ''",
  "sendSignature": false,
  "closeTicket": false
}`}</div>
        </>,
        renderSimpleForm({ token: "", number: "", body: "", userId: "", queueId: "" }, handleSendTextMessage, [
          { name: "token", label: "Token cadastrado *", md: 6 },
          { name: "number", label: "Número *", md: 6 },
          { name: "body", label: "Mensagem *" },
          { name: "userId", label: "ID do usuário/atendente", md: 6, required: false },
          { name: "queueId", label: "ID da Fila", md: 6, required: false },
        ], "ENVIAR")
      )}

      {/* 2. MÍDIA */}
      {renderSection(2, "Mensagens de Mídia", false,
        <>
          <p>Envio de arquivos (imagem, áudio, vídeo, documento).</p>
          <div className={classes.endpointBox}><b>POST</b> {getEndpoint()}</div>
          <b>Headers:</b> Authorization Bearer e Content-Type (multipart/form-data)<br /><br />
          <b>FormData:</b>
          <ul>
            <li><b>number:</b> 5585999999999</li>
            <li><b>body:</b> Legenda (opcional)</li>
            <li><b>userId:</b> ID usuário ou ""</li>
            <li><b>queueId:</b> ID da fila ou ""</li>
            <li><b>medias:</b> arquivo</li>
            <li><b>sendSignature:</b> true/false</li>
            <li><b>closeTicket:</b> true/false</li>
          </ul>
        </>,
        <Formik initialValues={{ token: "", number: "", body: "", userId: "", queueId: "" }} enableReinitialize onSubmit={(values, actions) => {
          setTimeout(async () => { await handleSendMediaMessage(values); actions.setSubmitting(false); actions.resetForm(); document.getElementById("medias").value = null; }, 400);
        }}>
          {({ isSubmitting }) => (
            <Form className={classes.formContainer}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}><Field as={TextField} label="Token cadastrado *" name="token" variant="outlined" margin="dense" fullWidth required /></Grid>
                <Grid item xs={12} md={6}><Field as={TextField} label="Número *" name="number" variant="outlined" margin="dense" fullWidth required /></Grid>
                <Grid item xs={12}><Field as={TextField} label="Legenda (opcional)" name="body" variant="outlined" margin="dense" fullWidth /></Grid>
                <Grid item xs={12} md={6}><Field as={TextField} label="ID do usuário/atendente" name="userId" variant="outlined" margin="dense" fullWidth /></Grid>
                <Grid item xs={12} md={6}><Field as={TextField} label="ID da Fila" name="queueId" variant="outlined" margin="dense" fullWidth /></Grid>
                <Grid item xs={12}><input type="file" name="medias" id="medias" required onChange={(e) => setFile(e.target.files)} /></Grid>
                <Grid item xs={12} className={classes.textRight}>
                  <Button type="submit" color="primary" variant="contained">{isSubmitting ? <CircularProgress size={24} /> : "Enviar"}</Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      )}

      {/* 3. VERIFICAR NÚMERO */}
      {renderSection(3, "Verificar Número no WhatsApp", true,
        <>
          <p>Verifica se um número possui WhatsApp ativo antes de enviar mensagens.</p>
          <div className={classes.endpointBox}><b>POST</b> {getCheckEndpoint()}</div>
          <b>Body JSON:</b>
          <div className={classes.codeBlock}>{`{
  "number": "5585999999999"
}`}</div>
          <b>Resposta:</b>
          <div className={classes.codeBlock}>{`{
  "existsInWhatsapp": true,
  "number": "5585999999999",
  "numberFormatted": "5585999999999@s.whatsapp.net"
}`}</div>
        </>,
        renderSimpleForm({ token: "", number: "" }, handleCheckNumber, [
          { name: "token", label: "Token cadastrado *", md: 6 },
          { name: "number", label: "Número *", md: 6 },
        ], "Verificar")
      )}

      {/* 4. ENVIO SEM TICKET */}
      {renderSection(4, "Envio Sem Ticket (Disparo Rápido)", true,
        <>
          <p>Envia mensagem de texto diretamente, <b>sem criar ou registrar ticket</b>. Ideal para notificações rápidas.</p>
          <div className={classes.endpointBox}><b>POST</b> {getNoTicketEndpoint()}</div>
          <b>Body JSON:</b>
          <div className={classes.codeBlock}>{`{
  "number": "5585999999999",
  "body": "Sua mensagem aqui"
}`}</div>
          <b>Resposta:</b>
          <div className={classes.codeBlock}>{`{
  "status": "SUCCESS",
  "message": "Mensagem enviada sem registro de ticket."
}`}</div>
        </>,
        renderSimpleForm({ token: "", number: "", body: "" }, handleSendNoTicket, [
          { name: "token", label: "Token cadastrado *", md: 6 },
          { name: "number", label: "Número *", md: 6 },
          { name: "body", label: "Mensagem *", multiline: true, rows: 3 },
        ], "Enviar")
      )}

      {/* 5. IMAGEM POR URL */}
      {renderSection(5, "Envio de Imagem por URL", true,
        <>
          <p>Envia uma imagem a partir de uma URL pública, sem necessidade de upload de arquivo.</p>
          <div className={classes.endpointBox}><b>POST</b> {getLinkImageEndpoint()}</div>
          <b>Body JSON:</b>
          <div className={classes.codeBlock}>{`{
  "number": "5585999999999",
  "url": "https://exemplo.com/imagem.jpg",
  "caption": "Legenda da imagem (opcional)"
}`}</div>
        </>,
        renderSimpleForm({ token: "", number: "", url: "", caption: "" }, handleSendLinkImage, [
          { name: "token", label: "Token cadastrado *", md: 6 },
          { name: "number", label: "Número *", md: 6 },
          { name: "url", label: "URL da imagem *" },
          { name: "caption", label: "Legenda (opcional)", required: false },
        ], "Enviar")
      )}

      {/* 6. ENVIO EM LOTE */}
      {renderSection(6, "Envio em Lote (Bulk)", true,
        <>
          <p>Envia mensagens para múltiplos números em um único request. <b>Limite: 100 mensagens por lote.</b></p>
          <div className={classes.endpointBox}><b>POST</b> {getBulkEndpoint()}</div>
          <b>Body JSON:</b>
          <div className={classes.codeBlock}>{`{
  "delay": 2000,
  "messages": [
    {"number": "5585999999999", "body": "Olá João!"},
    {"number": "5585888888888", "body": "Olá Maria!"}
  ]
}`}</div>
          <b>Resposta:</b>
          <div className={classes.codeBlock}>{`{
  "total": 2,
  "sent": 2,
  "results": [
    {"number": "5585999999999", "status": "SUCCESS"},
    {"number": "5585888888888", "status": "SUCCESS"}
  ]
}`}</div>
          <Box mt={1}>
            <Chip size="small" label="delay: intervalo em ms entre envios (padrão: 2000)" className={classes.chip} />
          </Box>
        </>,
        <Formik initialValues={{ token: "", delay: "2000" }} enableReinitialize onSubmit={(values, actions) => {
          setTimeout(async () => { await handleSendBulk(values); actions.setSubmitting(false); }, 400);
        }}>
          {({ isSubmitting }) => (
            <Form className={classes.formContainer}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}><Field as={TextField} label="Token cadastrado *" name="token" variant="outlined" margin="dense" fullWidth required /></Grid>
                <Grid item xs={12} md={4}><Field as={TextField} label="Delay (ms)" name="delay" variant="outlined" margin="dense" fullWidth /></Grid>
                <Grid item xs={12}>
                  <TextField
                    label='JSON das mensagens *'
                    multiline
                    rows={6}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    value={bulkMessages}
                    onChange={(e) => setBulkMessages(e.target.value)}
                    placeholder={`[{"number":"5585999999999","body":"Olá!"}]`}
                    required
                  />
                </Grid>
                <Grid item xs={12} className={classes.textRight}>
                  <Button type="submit" color="primary" variant="contained">{isSubmitting ? <CircularProgress size={24} /> : "Enviar Lote"}</Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      )}

      {/* 7. LISTAR CONEXÕES */}
      {renderSection(7, "Listar Conexões Disponíveis", true,
        <>
          <p>Retorna todas as conexões WhatsApp ativas da empresa. Útil para obter IDs das conexões.</p>
          <div className={classes.endpointBox}><b>GET</b> {getConnectionsEndpoint()}</div>
          <b>Resposta:</b>
          <div className={classes.codeBlock}>{`{
  "connections": [
    {
      "id": 1,
      "name": "Suporte",
      "status": "CONNECTED",
      "isDefault": true,
      "number": "5585999999999",
      "channel": "whatsapp"
    }
  ]
}`}</div>
        </>,
        renderSimpleForm({ token: "" }, handleListConnections, [
          { name: "token", label: "Token cadastrado *" },
        ], "Listar Conexões")
      )}

      {/* 8. MENSAGEM COM BOTÕES */}
      {renderSection(8, "Mensagem com Botões Interativos", true,
        <>
          <p>Envia mensagem interativa com até <b>3 botões</b> clicáveis. Suporta também listas, URLs e PIX.</p>
          <div className={classes.endpointBox}><b>POST</b> {getButtonsEndpoint()}</div>
          <b>Headers:</b> Authorization Bearer (token) e Content-Type (application/json)<br /><br />
          <b>Body JSON (Botões):</b>
          <div className={classes.codeBlock}>{`{
  "number": "5585999999999",
  "body": "Escolha uma opção:",
  "footer": "Rodapé opcional",
  "type": "buttons",
  "buttons": [
    {"text": "Vendas", "id": "1", "queueId": 5, "userId": 12},
    {"text": "Suporte", "id": "2", "queueId": 3},
    {"text": "Financeiro", "id": "3"}
  ]
}`}</div>
          <Box mt={1}>
            <Chip size="small" label="queueId: direciona o ticket para a fila ao clicar" className={classes.chip} color="primary" variant="outlined" />
            <Chip size="small" label="userId: atribui o ticket a um atendente específico" className={classes.chip} color="secondary" variant="outlined" />
          </Box>
          <b>Body JSON (Lista):</b>
          <div className={classes.codeBlock}>{`{
  "number": "5585999999999",
  "body": "Selecione um serviço:",
  "type": "list",
  "buttonText": "Ver opções",
  "sections": [
    {
      "title": "Serviços",
      "rows": [
        {"title": "Suporte", "id": "suporte", "description": "Falar com suporte"},
        {"title": "Vendas", "id": "vendas", "description": "Falar com vendas"}
      ]
    }
  ]
}`}</div>
          <Box mt={1}>
            <Chip size="small" label="type: buttons | list | url | copy | pix | mixed" className={classes.chip} />
            <Chip size="small" label="Máx. 3 botões (5 no mixed)" className={classes.chip} />
          </Box>
        </>,
        <Formik initialValues={{ token: "", number: "", body: "", footer: "" }} enableReinitialize onSubmit={(values, actions) => {
          setTimeout(async () => { await handleSendButtons(values); actions.setSubmitting(false); actions.resetForm(); }, 400);
        }}>
          {({ isSubmitting }) => (
            <Form className={classes.formContainer}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}><Field as={TextField} label="Token cadastrado *" name="token" variant="outlined" margin="dense" fullWidth required /></Grid>
                <Grid item xs={12} md={6}><Field as={TextField} label="Número *" name="number" variant="outlined" margin="dense" fullWidth required /></Grid>
                <Grid item xs={12}><Field as={TextField} label="Mensagem (body) *" name="body" variant="outlined" margin="dense" fullWidth required multiline rows={2} /></Grid>
                <Grid item xs={12}><Field as={TextField} label="Rodapé (footer)" name="footer" variant="outlined" margin="dense" fullWidth /></Grid>
                <Grid item xs={12}>
                  <TextField
                    label='JSON dos botões *'
                    multiline
                    rows={4}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    value={buttonsJson}
                    onChange={(e) => setButtonsJson(e.target.value)}
                    placeholder={`[{"text":"Opção 1","id":"1"},{"text":"Opção 2","id":"2"}]`}
                    required
                  />
                </Grid>
                <Grid item xs={12} className={classes.textRight}>
                  <Button type="submit" color="primary" variant="contained">{isSubmitting ? <CircularProgress size={24} /> : "Enviar Botões"}</Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      )}

      {/* 9. BOTÕES MISTOS */}
      {renderSection(9, "Botões Mistos (quick_reply + URL + copy + call)", true,
        <>
          <p>Envia mensagem interativa com botões de <b>tipos diferentes</b> na mesma mensagem. Até <b>5 botões</b>.</p>
          <div className={classes.endpointBox}><b>POST</b> {getButtonsEndpoint()}</div>
          <b>Headers:</b> Authorization Bearer (token) e Content-Type (application/json)<br /><br />
          <b>Body JSON:</b>
          <div className={classes.codeBlock}>{`{
  "number": "5585999999999",
  "body": "Escolha uma opção ou acesse nosso site:",
  "footer": "Rodapé opcional",
  "type": "mixed",
  "buttons": [
    {"type": "quick_reply", "text": "Vendas", "id": "1"},
    {"type": "quick_reply", "text": "Suporte", "id": "2"},
    {"type": "cta_url", "text": "Abrir site", "url": "https://seusite.com.br"},
    {"type": "cta_copy", "text": "Copiar PIX", "copyCode": "00020126..."},
    {"type": "cta_call", "text": "Ligar agora", "phoneNumber": "+5511999999999"}
  ]
}`}</div>
          <Box mt={1}>
            <Chip size="small" label="quick_reply: botão de resposta rápida (com id)" className={classes.chip} color="primary" variant="outlined" />
            <Chip size="small" label="cta_url: abre um link externo" className={classes.chip} color="primary" variant="outlined" />
            <Chip size="small" label="cta_copy: copia texto (ex: PIX)" className={classes.chip} color="secondary" variant="outlined" />
            <Chip size="small" label="cta_call: inicia ligação" className={classes.chip} color="secondary" variant="outlined" />
            <Chip size="small" label="Máx. 5 botões" className={classes.chip} />
          </Box>
        </>,
        <Formik initialValues={{ token: "", number: "", body: "", footer: "" }} enableReinitialize onSubmit={(values, actions) => {
          setTimeout(async () => { await handleSendMixedButtons(values); actions.setSubmitting(false); actions.resetForm(); }, 400);
        }}>
          {({ isSubmitting }) => (
            <Form className={classes.formContainer}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}><Field as={TextField} label="Token cadastrado *" name="token" variant="outlined" margin="dense" fullWidth required /></Grid>
                <Grid item xs={12} md={6}><Field as={TextField} label="Número *" name="number" variant="outlined" margin="dense" fullWidth required /></Grid>
                <Grid item xs={12}><Field as={TextField} label="Mensagem (body) *" name="body" variant="outlined" margin="dense" fullWidth required multiline rows={2} /></Grid>
                <Grid item xs={12}><Field as={TextField} label="Rodapé (footer)" name="footer" variant="outlined" margin="dense" fullWidth /></Grid>
                <Grid item xs={12}>
                  <TextField
                    label='JSON dos botões mistos *'
                    multiline
                    rows={5}
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    value={mixedButtonsJson}
                    onChange={(e) => setMixedButtonsJson(e.target.value)}
                    placeholder={`[{"type":"quick_reply","text":"Opção","id":"1"},{"type":"cta_url","text":"Link","url":"https://..."}]`}
                    required
                  />
                </Grid>
                <Grid item xs={12} className={classes.textRight}>
                  <Button type="submit" color="primary" variant="contained">{isSubmitting ? <CircularProgress size={24} /> : "Enviar Mistos"}</Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      )}
    </Paper>
  );
};

export default MessagesAPI;
