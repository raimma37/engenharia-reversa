import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Grid,
  Divider,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@material-ui/core";
import {
  Cake as CakeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Announcement as AnnouncementIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Settings as TestIcon,
  Info as InfoIcon
} from "@material-ui/icons";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    background: theme.mode === "dark"
      ? "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)"
      : "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)",
    minHeight: "100vh",
  },
  headerSection: {
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
    borderRadius: 12,
    background: theme.mode === "dark"
      ? "linear-gradient(135deg, #e91e63 0%, #c2185b 100%)"
      : "linear-gradient(135deg, #ec407a 0%, #f06292 100%)",
    color: "#fff",
    boxShadow: theme.mode === "dark"
      ? "0 4px 20px rgba(233, 30, 99, 0.4)"
      : "0 4px 20px rgba(233, 30, 99, 0.3)",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  headerTitle: {
    fontWeight: 700,
    fontSize: "1.75rem",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    background: theme.mode === "dark"
      ? "rgba(255, 255, 255, 0.03)"
      : "#ffffff",
    borderRadius: 12,
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
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    color: theme.mode === "dark" ? "#f48fb1" : "#e91e63",
    fontWeight: 700,
    fontSize: "1.25rem",
    "& svg": {
      fontSize: "1.5rem",
    },
  },
  settingItem: {
    marginBottom: theme.spacing(2)
  },
  messageField: {
    marginTop: theme.spacing(1),
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
      transition: "all 0.3s ease",
      "&:hover": {
        boxShadow: theme.mode === "dark"
          ? "0 0 0 2px rgba(233, 30, 99, 0.3)"
          : "0 0 0 2px rgba(233, 30, 99, 0.15)",
      },
      "&.Mui-focused": {
        boxShadow: theme.mode === "dark"
          ? "0 0 0 2px rgba(233, 30, 99, 0.5)"
          : "0 0 0 2px rgba(233, 30, 99, 0.25)",
      },
    },
  },
  timeField: {
    maxWidth: 200,
    "& .MuiOutlinedInput-root": {
      borderRadius: 8,
    },
  },
  saveButton: {
    background: theme.mode === "dark"
      ? "linear-gradient(135deg, #e91e63 0%, #c2185b 100%)"
      : "linear-gradient(135deg, #ec407a 0%, #f06292 100%)",
    color: "white",
    fontWeight: 600,
    textTransform: "none",
    borderRadius: 10,
    padding: theme.spacing(1.5, 4),
    fontSize: "1rem",
    boxShadow: "0 4px 12px rgba(233, 30, 99, 0.3)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 6px 20px rgba(233, 30, 99, 0.4)",
      background: theme.mode === "dark"
        ? "linear-gradient(135deg, #c2185b 0%, #ad1457 100%)"
        : "linear-gradient(135deg, #e91e63 0%, #ec407a 100%)",
    },
    "&:disabled": {
      background: theme.mode === "dark"
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(0, 0, 0, 0.12)",
      color: theme.mode === "dark"
        ? "rgba(255, 255, 255, 0.3)"
        : "rgba(0, 0, 0, 0.26)",
    },
  },
  testButton: {
    background: theme.mode === "dark"
      ? "linear-gradient(135deg, #ff9800 0%, #f57c00 100%)"
      : "linear-gradient(135deg, #ffa726 0%, #ff9800 100%)",
    color: "white",
    fontWeight: 600,
    textTransform: "none",
    borderRadius: 8,
    marginLeft: theme.spacing(1),
    boxShadow: "0 2px 8px rgba(255, 152, 0, 0.3)",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(255, 152, 0, 0.4)",
    }
  },
  expandButton: {
    transform: "rotate(0deg)",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest
    }),
    color: theme.mode === "dark" ? "#f48fb1" : "#e91e63",
  },
  expandButtonOpen: {
    transform: "rotate(180deg)"
  },
  helpText: {
    fontSize: "0.875rem",
    color: theme.mode === "dark" ? "rgba(255, 255, 255, 0.6)" : theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
    lineHeight: 1.6,
  },
  messagePreview: {
    background: theme.mode === "dark"
      ? "rgba(233, 30, 99, 0.08)"
      : "rgba(233, 30, 99, 0.04)",
    padding: theme.spacing(2),
    borderRadius: 8,
    marginTop: theme.spacing(1.5),
    border: theme.mode === "dark"
      ? "1px solid rgba(233, 30, 99, 0.2)"
      : "1px solid rgba(233, 30, 99, 0.15)",
    boxShadow: theme.mode === "dark"
      ? "inset 0 2px 4px rgba(0, 0, 0, 0.2)"
      : "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
  },
  variableChip: {
    background: theme.mode === "dark"
      ? "linear-gradient(135deg, #e91e63 0%, #c2185b 100%)"
      : "linear-gradient(135deg, #ec407a 0%, #f06292 100%)",
    color: "white",
    padding: "3px 10px",
    borderRadius: 6,
    fontSize: "0.8rem",
    fontFamily: "'Fira Code', monospace",
    margin: "0 3px",
    fontWeight: 600,
    boxShadow: "0 2px 4px rgba(233, 30, 99, 0.3)",
    display: "inline-block",
  },
  infoBox: {
    background: theme.mode === "dark"
      ? "rgba(33, 150, 243, 0.1)"
      : "rgba(33, 150, 243, 0.08)",
    border: theme.mode === "dark"
      ? "1px solid rgba(33, 150, 243, 0.3)"
      : "1px solid rgba(33, 150, 243, 0.2)",
    borderRadius: 10,
    padding: theme.spacing(2.5),
    marginTop: theme.spacing(2),
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    boxShadow: theme.mode === "dark"
      ? "0 2px 8px rgba(33, 150, 243, 0.15)"
      : "0 2px 8px rgba(33, 150, 243, 0.1)",
  },
  infoIcon: {
    color: theme.mode === "dark" ? "#64b5f6" : "#1976d2",
    fontSize: "1.5rem",
    marginTop: 2
  },
  infoContent: {
    flex: 1,
    "& code": {
      background: theme.mode === "dark"
        ? "rgba(255, 255, 255, 0.1)"
        : "rgba(0, 0, 0, 0.06)",
      padding: "2px 6px",
      borderRadius: 4,
      fontFamily: "'Fira Code', monospace",
      fontSize: "0.875rem",
      color: theme.mode === "dark" ? "#82aaff" : "#1976d2",
    },
  },
  switchLabel: {
    "& .MuiFormControlLabel-label": {
      fontWeight: 500,
      color: theme.mode === "dark" ? "rgba(255, 255, 255, 0.87)" : "rgba(0, 0, 0, 0.87)",
    },
  },
  loadingBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "50vh",
  },
}));

const BirthdaySettings = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { whatsApps } = useContext(WhatsAppsContext);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    user: true,
    contact: true,
    general: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get("/birthdays/settings");
      setSettings(data.data);
    } catch (error) {
      toast.error("Erro ao carregar configurações de aniversário");
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/birthdays/settings", settings);
      toast.success("Configurações de aniversário salvas com sucesso! 🎉");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const handleTestMessage = async (messageType) => {
    // Para teste, vamos pedir um contato válido
    const contactId = prompt("Digite o ID de um contato para teste:");
    if (!contactId) return;

    try {
      await api.post("/birthdays/test-message", {
        contactId: parseInt(contactId),
        messageType
      });
      toast.success("Mensagem de teste enviada! 📱");
    } catch (error) {
      toast.error("Erro ao enviar mensagem de teste");
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderMessagePreview = (message, type) => {
    if (!message) return null;

    let previewMessage = message;
    previewMessage = previewMessage.replace(
      /{nome}/g,
      `<span class="${classes.variableChip}">João Silva</span>`
    );
    previewMessage = previewMessage.replace(
      /{idade}/g,
      `<span class="${classes.variableChip}">30</span>`
    );

    return (
      <Box className={classes.messagePreview}>
        <Typography variant="caption" color="textSecondary">
          Pré-visualização:
        </Typography>
        <Typography
          variant="body2"
          dangerouslySetInnerHTML={{ __html: previewMessage }}
        />
      </Box>
    );
  };

  if (loading) {
    return (
      <Box className={classes.loadingBox}>
        <Typography variant="h6" style={{ color: theme.mode === "dark" ? "#f48fb1" : "#e91e63" }}>
          🎂 Carregando configurações...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      {/* Header Section */}
      <Box className={classes.headerSection}>
        <CakeIcon style={{ fontSize: "2.5rem" }} />
        <Box>
          <Typography className={classes.headerTitle}>
            Configurações de Aniversário
          </Typography>
          <Typography variant="body2" style={{ opacity: 0.9, marginTop: 4 }}>
            Gerencie mensagens automáticas e notificações de aniversário
          </Typography>
        </Box>
      </Box>

      {/* Configurações de Usuários */}
      <Paper className={classes.paper} elevation={0}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" className={classes.sectionTitle}>
            <PersonIcon />
            Aniversários de Usuários
          </Typography>
          <IconButton
            className={`${classes.expandButton} ${expandedSections.user ? classes.expandButtonOpen : ""
              }`}
            onClick={() => toggleSection("user")}
            size="small"
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>

        <Collapse in={expandedSections.user}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                className={classes.switchLabel}
                control={
                  <Switch
                    checked={settings?.userBirthdayEnabled || false}
                    onChange={(e) => handleSettingChange("userBirthdayEnabled", e.target.checked)}
                    color="primary"
                  />
                }
                label="Habilitar notificações de aniversário de usuários"
              />
              <Typography className={classes.helpText}>
                Quando habilitado, será exibido modal de parabéns e criado informativo automático
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                className={classes.switchLabel}
                control={
                  <Switch
                    checked={settings?.createAnnouncementForUsers || false}
                    onChange={(e) => handleSettingChange("createAnnouncementForUsers", e.target.checked)}
                    color="primary"
                    disabled={!settings?.userBirthdayEnabled}
                  />
                }
                label="Criar informativo automático para aniversários de usuários"
              />
              <Typography className={classes.helpText}>
                Cria um informativo automático que é exibido para todos os usuários da empresa
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Mensagem de aniversário para usuários"
                value={settings?.userBirthdayMessage || ""}
                onChange={(e) => handleSettingChange("userBirthdayMessage", e.target.value)}
                disabled={!settings?.userBirthdayEnabled}
                className={classes.messageField}
                helperText="Use {nome} para incluir o nome do usuário"
                variant="outlined"
              />
              {renderMessagePreview(settings?.userBirthdayMessage, "user")}
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      {/* Configurações de Contatos */}
      <Paper className={classes.paper} elevation={0}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" className={classes.sectionTitle}>
            <PhoneIcon />
            Aniversários de Contatos
          </Typography>
          <IconButton
            className={`${classes.expandButton} ${expandedSections.contact ? classes.expandButtonOpen : ""
              }`}
            onClick={() => toggleSection("contact")}
            size="small"
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>

        <Collapse in={expandedSections.contact}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                className={classes.switchLabel}
                control={
                  <Switch
                    checked={settings?.contactBirthdayEnabled || false}
                    onChange={(e) => handleSettingChange("contactBirthdayEnabled", e.target.checked)}
                    color="primary"
                  />
                }
                label="Habilitar envio automático de mensagens de aniversário para contatos"
              />
              <Typography className={classes.helpText}>
                Envia automaticamente mensagem de parabéns via WhatsApp para contatos aniversariantes
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Mensagem de aniversário para contatos"
                value={settings?.contactBirthdayMessage || ""}
                onChange={(e) => handleSettingChange("contactBirthdayMessage", e.target.value)}
                disabled={!settings?.contactBirthdayEnabled}
                className={classes.messageField}
                helperText="Use {nome} para incluir o nome do contato e {idade} para a idade"
                variant="outlined"
              />
              {renderMessagePreview(settings?.contactBirthdayMessage, "contact")}

              {settings?.contactBirthdayEnabled && (
                <Button
                  variant="contained"
                  className={classes.testButton}
                  startIcon={<TestIcon />}
                  onClick={() => handleTestMessage("contact")}
                  size="small"
                  style={{ marginTop: 12 }}
                >
                  Testar Mensagem
                </Button>
              )}
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      {/* Configurações Gerais */}
      <Paper className={classes.paper} elevation={0}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" className={classes.sectionTitle}>
            <ScheduleIcon />
            Configurações Gerais
          </Typography>
          <IconButton
            className={`${classes.expandButton} ${expandedSections.general ? classes.expandButtonOpen : ""
              }`}
            onClick={() => toggleSection("general")}
            size="small"
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>

        <Collapse in={expandedSections.general}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                type="time"
                label="Horário de envio das mensagens"
                value={settings?.sendBirthdayTime || "09:00:00"}
                onChange={(e) => {
                  // Converter HH:MM para HH:MM:SS para compatibilidade com backend
                  const timeValue = e.target.value;
                  const formattedTime = timeValue ? `${timeValue}:00` : "09:00:00";
                  handleSettingChange("sendBirthdayTime", formattedTime);
                }}
                className={classes.timeField}
                InputLabelProps={{ shrink: true }}
                helperText="Horário em que as mensagens automáticas serão enviadas"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Conexão WhatsApp para Envio</InputLabel>
                <Select
                  value={settings?.whatsappId || ""}
                  onChange={(e) => handleSettingChange("whatsappId", e.target.value || null)}
                  label="Conexão WhatsApp para Envio"
                  disabled={!settings?.contactBirthdayEnabled}
                  style={{ borderRadius: 8 }}
                >
                  <MenuItem value="">
                    <em>Selecione uma conexão</em>
                  </MenuItem>
                  {whatsApps?.length > 0 &&
                    whatsApps.map((whatsapp) => (
                      <MenuItem key={whatsapp.id} value={whatsapp.id}>
                        <Box display="flex" alignItems="center">
                          <Box
                            width={8}
                            height={8}
                            borderRadius="50%"
                            bgcolor={whatsapp.status === "CONNECTED" ? "success.main" : "error.main"}
                            mr={1}
                          />
                          {whatsapp.name} ({whatsapp.status})
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
                <Typography className={classes.helpText} style={{ marginTop: 8 }}>
                  Conexão WhatsApp que será usada para enviar mensagens de aniversário
                </Typography>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                className={classes.switchLabel}
                control={
                  <Switch
                    checked={settings?.createAnnouncementForUsers || false}
                    onChange={(e) => handleSettingChange("createAnnouncementForUsers", e.target.checked)}
                    color="primary"
                  />
                }
                label="Criar informativo interno para aniversários de usuários"
              />
              <Typography className={classes.helpText}>
                Cria um informativo interno quando um usuário faz aniversário
              </Typography>
            </Grid>
          </Grid>

          <Box className={classes.infoBox}>
            <InfoIcon className={classes.infoIcon} />
            <Box className={classes.infoContent}>
              <Typography variant="body2" style={{ fontWeight: 600, marginBottom: 8 }}>
                💡 Variáveis disponíveis nas mensagens:
              </Typography>
              <Typography variant="body2" component="div">
                • <code>{"{nome}"}</code> - Nome da pessoa<br />
                • <code>{"{idade}"}</code> - Idade da pessoa (apenas para contatos)
              </Typography>
            </Box>
          </Box>
        </Collapse>
      </Paper>

      {/* Botão Salvar */}
      <Box textAlign="center" mt={4} mb={3}>
        <Button
          variant="contained"
          className={classes.saveButton}
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          size="large"
        >
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </Box>
    </Box>
  );
};

export default BirthdaySettings;