import React, { useEffect, useState, useContext, useRef } from "react";

import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import Box from "@material-ui/core/Box";
import useSettings from "../../hooks/useSettings";
import { toast } from "react-toastify";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import OnlyForSuperUser from "../OnlyForSuperUser";
import useAuth from "../../hooks/useAuth.js";

import { IconButton, InputAdornment, Chip } from "@material-ui/core";

import { Colorize, AttachFile, Delete, Palette, Image, Language, Apps, WbSunny, NightsStay } from "@material-ui/icons";
import ColorPicker from "../ColorPicker";
import ColorModeContext from "../../layout/themeContext";
import api from "../../services/api";
import { getBackendUrl } from "../../config";

import defaultLogoLight from "../../assets/logo1.png";
import defaultLogoDark from "../../assets/logo2.png";
import ColorBoxModal from "../ColorBoxModal/index.js";
import Checkbox from "@material-ui/core/Checkbox";
import { i18n } from "../../translate/i18n";

const defaultLogoFavicon = "/favicon.ico";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
  },
  sectionPaper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    borderRadius: 16,
    background: theme.mode === "dark"
      ? "linear-gradient(145deg, #1e1e2e 0%, #252535 100%)"
      : "linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)",
    border: `1px solid ${theme.mode === "dark" ? "rgba(255,255,255,0.07)" : "rgba(99,102,241,0.12)"}`,
    boxShadow: theme.mode === "dark"
      ? "0 4px 24px rgba(0,0,0,0.4)"
      : "0 4px 24px rgba(99,102,241,0.08)",
    transition: "box-shadow 0.25s ease",
    "&:hover": {
      boxShadow: theme.mode === "dark"
        ? "0 8px 32px rgba(0,0,0,0.5)"
        : "0 8px 32px rgba(99,102,241,0.15)",
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(2.5),
    gap: theme.spacing(1.5),
  },
  sectionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
  },
  sectionIcon: {
    color: "#ffffff",
    fontSize: 22,
  },
  sectionTitle: {
    fontWeight: 700,
    fontSize: "1.05rem",
    color: theme.mode === "dark" ? "#e2e8f0" : "#1e293b",
    lineHeight: 1.3,
  },
  sectionSubtitle: {
    color: theme.mode === "dark" ? "#94a3b8" : "#64748b",
    fontSize: "0.813rem",
    marginTop: 2,
    lineHeight: 1.5,
  },
  formField: {
    marginBottom: theme.spacing(1.5),
    "& .MuiOutlinedInput-root": {
      borderRadius: 10,
      background: theme.mode === "dark"
        ? "rgba(255,255,255,0.04)"
        : "rgba(99,102,241,0.03)",
      transition: "all 0.2s ease",
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#6366f1",
        borderWidth: "1px",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#6366f1",
        borderWidth: 2,
        boxShadow: "0 0 0 3px rgba(99,102,241,0.15)",
      },
    },
    "& .MuiInputLabel-outlined.Mui-focused": {
      color: "#6366f1",
    },
    "& .MuiInputLabel-outlined": {
      fontSize: "0.875rem",
    },
  },
  colorAdorment: {
    width: 20,
    height: 20,
    borderRadius: 6,
    border: theme.mode === "dark"
      ? "2px solid rgba(255,255,255,0.2)"
      : "2px solid rgba(0,0,0,0.12)",
    boxShadow: "0 2px 4px rgba(0,0,0,0.18)",
  },
  uploadInput: {
    display: "none",
  },
  uploadField: {
    "& .MuiInputBase-input": {
      cursor: "pointer",
    },
  },
  previewContainer: {
    marginTop: theme.spacing(2.5),
    padding: theme.spacing(2),
    borderRadius: 12,
    background: theme.mode === "dark"
      ? "rgba(255,255,255,0.03)"
      : "rgba(99,102,241,0.04)",
    border: `1px dashed ${theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(99,102,241,0.25)"}`,
  },
  previewTitle: {
    fontWeight: 700,
    fontSize: "0.75rem",
    color: theme.mode === "dark" ? "#94a3b8" : "#6366f1",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: theme.spacing(1.5),
  },
  previewGrid: {
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center",
    },
  },
  previewCard: {
    padding: theme.spacing(1.5),
    borderRadius: 12,
    border: `1.5px solid ${theme.mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)"}`,
    textAlign: "center",
    height: "130px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    overflow: "hidden",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
    },
    [theme.breakpoints.down("sm")]: {
      height: "110px",
    },
  },
  previewCardLight: {
    background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
  },
  previewCardDark: {
    background: "linear-gradient(145deg, #2d2d3d 0%, #1a1a2e 100%)",
    borderColor: "rgba(255,255,255,0.12)",
  },
  previewCardFavicon: {
    background: "linear-gradient(145deg, #f1f5f9 0%, #e8edf5 100%)",
  },
  previewImage: {
    maxWidth: "90%",
    maxHeight: "80px",
    objectFit: "contain",
    [theme.breakpoints.down("sm")]: {
      maxHeight: "65px",
    },
  },
  previewBackgroundImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: 8,
  },
  previewLabel: {
    fontSize: "0.68rem",
    color: "#64748b",
    marginTop: theme.spacing(0.75),
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  previewLabelDark: {
    color: "#94a3b8",
  },
  languageSection: {
    marginTop: theme.spacing(1),
  },
  languageGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
    [theme.breakpoints.down("sm")]: {
      gap: theme.spacing(1),
    },
  },
  languageItem: {
    display: "flex",
    alignItems: "center",
    background: theme.mode === "dark"
      ? "rgba(99,102,241,0.08)"
      : "rgba(99,102,241,0.05)",
    border: `1.5px solid ${theme.mode === "dark" ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.18)"}`,
    borderRadius: 10,
    padding: theme.spacing(0.75, 1.5),
    minWidth: "130px",
    transition: "all 0.2s ease",
    cursor: "pointer",
    "&:hover": {
      background: theme.mode === "dark"
        ? "rgba(99,102,241,0.18)"
        : "rgba(99,102,241,0.1)",
      borderColor: "#6366f1",
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(99,102,241,0.2)",
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: "110px",
      padding: theme.spacing(0.5, 1),
    },
  },
  languageCheckbox: {
    padding: theme.spacing(0.25),
  },
  languageLabel: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: theme.mode === "dark" ? "#e2e8f0" : "#334155",
    marginLeft: theme.spacing(0.5),
    [theme.breakpoints.down("sm")]: {
      fontSize: "0.8rem",
    },
  },
  colorSection: {
    [theme.breakpoints.down("sm")]: {
      "& .MuiGrid-item": {
        paddingBottom: theme.spacing(1),
      },
    },
  },
  logoSection: {
    [theme.breakpoints.down("sm")]: {
      "& .MuiGrid-item": {
        paddingBottom: theme.spacing(1),
      },
    },
  },
  divider: {
    margin: theme.spacing(2, 0),
    background: theme.mode === "dark"
      ? "rgba(255,255,255,0.06)"
      : "rgba(99,102,241,0.1)",
  },
  themeColumnLight: {
    borderRadius: 12,
    padding: theme.spacing(2),
    height: "100%",
    boxSizing: "border-box",
    background: theme.mode === "dark"
      ? "rgba(251,191,36,0.05)"
      : "linear-gradient(145deg, #fffef5 0%, #f0fdf4 100%)",
    border: `1.5px solid ${theme.mode === "dark" ? "rgba(251,191,36,0.2)" : "rgba(234,179,8,0.35)"}`,
  },
  themeColumnDark: {
    borderRadius: 12,
    padding: theme.spacing(2),
    height: "100%",
    boxSizing: "border-box",
    background: theme.mode === "dark"
      ? "rgba(99,102,241,0.07)"
      : "linear-gradient(145deg, #f5f3ff 0%, #ede9fe 100%)",
    border: `1.5px solid ${theme.mode === "dark" ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.4)"}`,
  },
  themeColumnHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
    paddingBottom: theme.spacing(1.5),
    borderBottom: "1.5px solid rgba(234,179,8,0.25)",
  },
  themeColumnDarkHeader: {
    borderBottom: "1.5px solid rgba(99,102,241,0.3)",
  },
  themeColumnIcon: {
    fontSize: 20,
  },
  themeColumnIconLight: {
    color: "#f59e0b",
  },
  themeColumnIconDark: {
    color: "#8b5cf6",
  },
  themeColumnTitle: {
    fontWeight: 700,
    fontSize: "0.9rem",
  },
  themeColumnTitleLight: {
    color: theme.mode === "dark" ? "#fcd34d" : "#92400e",
  },
  themeColumnTitleDark: {
    color: theme.mode === "dark" ? "#c4b5fd" : "#5b21b6",
  },
  themeColumnPreview: {
    marginTop: theme.spacing(2),
    display: "flex",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    alignItems: "stretch",
  },
  themePreviewCard: {
    flex: "1 1 90px",
    height: "90px",
    minWidth: 70,
    [theme.breakpoints.down("sm")]: {
      height: "75px",
    },
  },
  themePreviewCardWide: {
    flex: "2 1 140px",
  },
}));

const LANGUAGE_OPTIONS = [
  { code: "pt-BR", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "ar", label: "عربي", flag: "🇸🇦" },
];

export default function Whitelabel(props) {
  const { settings } = props;
  const classes = useStyles();
  const theme = useTheme();
  const isDark = theme.mode === "dark";
  const [settingsLoaded, setSettingsLoaded] = useState({});

  const { getCurrentUserInfo } = useAuth();
  const [currentUser, setCurrentUser] = useState({});
  const [loading, setLoading] = useState(true);
  const { colorMode } = useContext(ColorModeContext);
  const [primaryColorLightModalOpen, setPrimaryColorLightModalOpen] =
    useState(false);
  const [primaryColorDarkModalOpen, setPrimaryColorDarkModalOpen] =
    useState(false);

  const logoLightInput = useRef(null);
  const logoDarkInput = useRef(null);
  const logoFaviconInput = useRef(null);
  const backgroundLightInput = useRef(null);
  const backgroundDarkInput = useRef(null);
  const logoHorizontalMenuInput = useRef(null);
  const logoHorizontalMenuDarkInput = useRef(null);
  const appNameInput = useRef(null);
  const [appName, setAppName] = useState(settingsLoaded.appName || "");
  const [enabledLanguages, setEnabledLanguages] = useState(["pt-BR", "en"]);

  const { update } = useSettings();

  function updateSettingsLoaded(key, value) {
    if (
      key === "primaryColorLight" ||
      key === "primaryColorDark" ||
      key === "appName"
    ) {
      localStorage.setItem(key, value);
    }
    const newSettings = { ...settingsLoaded };
    newSettings[key] = value;
    setSettingsLoaded(newSettings);
  }

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getCurrentUserInfo().then((u) => {
      const userData = u.user || u;
      if (isMounted) {
        setCurrentUser(userData);
      }
    });

    if (Array.isArray(settings) && settings.length) {
      const primaryColorLight = settings.find(
        (s) => s.key === "primaryColorLight"
      )?.value;
      const primaryColorDark = settings.find(
        (s) => s.key === "primaryColorDark"
      )?.value;
      const appLogoLight = settings.find(
        (s) => s.key === "appLogoLight"
      )?.value;
      const appLogoDark = settings.find((s) => s.key === "appLogoDark")?.value;
      const appLogoFavicon = settings.find(
        (s) => s.key === "appLogoFavicon"
      )?.value;
      const appLogoBackgroundLight = settings.find(
        (s) => s.key === "appLogoBackgroundLight"
      )?.value;
      const appLogoBackgroundDark = settings.find(
        (s) => s.key === "appLogoBackgroundDark"
      )?.value;
      const appName = settings.find((s) => s.key === "appName")?.value;
      const enabledLanguagesSetting = settings.find(
        (s) => s.key === "enabledLanguages"
      )?.value;
      let langs = ["pt-BR", "en"];
      try {
        if (enabledLanguagesSetting) {
          langs = JSON.parse(enabledLanguagesSetting);
        }
      } catch { }

      if (isMounted) {
        setAppName(appName || "");
        setEnabledLanguages(langs);
        setSettingsLoaded({
          ...settingsLoaded,
          primaryColorLight,
          primaryColorDark,
          appLogoLight,
          appLogoDark,
          appLogoFavicon,
          appLogoBackgroundLight,
          appLogoBackgroundDark,
          appLogoHorizontalMenu: settings.find((s) => s.key === "appLogoHorizontalMenu")?.value,
          appLogoHorizontalMenuDark: settings.find((s) => s.key === "appLogoHorizontalMenuDark")?.value,
          appName,
          enabledLanguages: langs,
        });
        setLoading(false);
      }
    }
    else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSaveSetting(key, value) {
    await update({
      key,
      value,
    });
    updateSettingsLoaded(key, value);
    toast.success("Operação atualizada com sucesso.");
  }

  async function handleSaveEnabledLanguages(newLangs) {
    await handleSaveSetting("enabledLanguages", newLangs);
    setEnabledLanguages(newLangs);
  }

  const uploadLogo = async (e, mode) => {
    if (!e.target.files) {
      return;
    }

    const file = e.target.files[0];
    const formData = new FormData();

    formData.append("typeArch", "logo");
    formData.append("mode", mode);
    formData.append("file", file);

    await api
      .post("/settings-whitelabel/logo", formData, {
        onUploadProgress: (event) => {
          let progress = Math.round((event.loaded * 100) / event.total);
          console.log(`A imagem está ${progress}% carregada... `);
        },
      })
      .then((response) => {
        updateSettingsLoaded(`appLogo${mode}`, response.data);
        if (mode === "BackgroundLight" || mode === "BackgroundDark") {
        } else {
          colorMode[`setAppLogo${mode}`](
            getBackendUrl() + "/public/" + response.data
          );
        }
      })
      .catch((err) => {
        console.error(`Houve um problema ao realizar o upload da imagem.`);
        console.log(err);
      });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <div>Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <OnlyForSuperUser
        user={currentUser}
        yes={() => (
          <>
            {/* Seção de Configurações Gerais */}
            <Paper className={classes.sectionPaper} elevation={0}>
              <div className={classes.sectionHeader}>
                <div className={classes.sectionIconWrap}>
                  <Apps className={classes.sectionIcon} />
                </div>
                <div>
                  <Typography variant="h6" className={classes.sectionTitle}>
                    {i18n.t("whitelabel.sections.general")}
                  </Typography>
                  <Typography className={classes.sectionSubtitle}>
                    {i18n.t("whitelabel.sections.generalDescription")}
                  </Typography>
                </div>
              </div>

              <Grid container spacing={3} alignItems="center">
                <Grid xs={12} sm={8} md={8} item>
                  <FormControl className={classes.formField} fullWidth>
                    <TextField
                      id="appname-field"
                      label={i18n.t("whitelabel.appName")}
                      variant="outlined"
                      name="appName"
                      value={appName}
                      inputRef={appNameInput}
                      onChange={(e) => {
                        setAppName(e.target.value);
                      }}
                      onBlur={async (_) => {
                        await handleSaveSetting("appName", appName);
                        colorMode.setAppName(appName || "BotConnecta");
                      }}
                      size="small"
                    />
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={4} md={4} item>
                  <FormControl className={classes.formField} fullWidth>
                    <TextField
                      id="logo-favicon-upload-field"
                      label={i18n.t("whitelabel.favicon")}
                      variant="outlined"
                      value={settingsLoaded.appLogoFavicon || ""}
                      size="small"
                      className={classes.uploadField}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <>
                            {settingsLoaded.appLogoFavicon && (
                              <IconButton
                                size="small"
                                color="default"
                                onClick={() => {
                                  handleSaveSetting("appLogoFavicon", "");
                                  colorMode.setAppLogoFavicon(defaultLogoFavicon);
                                }}
                              >
                                <Delete titleAccess={i18n.t("whitelabel.delete")} />
                              </IconButton>
                            )}
                            <input
                              type="file"
                              id="upload-logo-favicon-button"
                              ref={logoFaviconInput}
                              className={classes.uploadInput}
                              onChange={(e) => uploadLogo(e, "Favicon")}
                            />
                            <label htmlFor="upload-logo-favicon-button">
                              <IconButton
                                size="small"
                                color="default"
                                onClick={() => { logoFaviconInput.current.click(); }}
                              >
                                <AttachFile titleAccess={i18n.t("whitelabel.upload")} />
                              </IconButton>
                            </label>
                          </>
                        ),
                      }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Seção de Cores */}
            <Paper className={classes.sectionPaper} elevation={0}>
              <div className={classes.sectionHeader}>
                <div className={classes.sectionIconWrap}>
                  <Palette className={classes.sectionIcon} />
                </div>
                <div>
                  <Typography variant="h6" className={classes.sectionTitle}>
                    {i18n.t("whitelabel.sections.colors")}
                  </Typography>
                  <Typography className={classes.sectionSubtitle}>
                    {i18n.t("whitelabel.sections.colorsDescription")}
                  </Typography>
                </div>
              </div>

              <Grid container spacing={3} className={classes.colorSection}>
                <Grid xs={12} sm={6} md={6} item>
                  <FormControl className={classes.formField} fullWidth>
                    <TextField
                      id="primary-color-light-field"
                      label={i18n.t("whitelabel.primaryColorLight")}
                      variant="outlined"
                      value={settingsLoaded.primaryColorLight || ""}
                      onClick={() => setPrimaryColorLightModalOpen(true)}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <div
                              style={{
                                backgroundColor: settingsLoaded.primaryColorLight,
                              }}
                              className={classes.colorAdorment}
                            ></div>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <IconButton
                            size="small"
                            color="default"
                            onClick={() => setPrimaryColorLightModalOpen(true)}
                          >
                            <Colorize />
                          </IconButton>
                        ),
                      }}
                    />
                  </FormControl>
                  <ColorBoxModal
                    open={primaryColorLightModalOpen}
                    handleClose={() => setPrimaryColorLightModalOpen(false)}
                    onChange={(color) => {
                      console.log("🔍 [Whitelabel] Color changed:", color);
                      handleSaveSetting("primaryColorLight", `#${color.hex}`);
                      colorMode.setPrimaryColorLight(`#${color.hex}`);
                    }}
                    currentColor={settingsLoaded.primaryColorLight}
                  />
                </Grid>
                <Grid xs={12} sm={6} md={6} item>
                  <FormControl className={classes.formField} fullWidth>
                    <TextField
                      id="primary-color-dark-field"
                      label={i18n.t("whitelabel.primaryColorDark")}
                      variant="outlined"
                      value={settingsLoaded.primaryColorDark || ""}
                      onClick={() => setPrimaryColorDarkModalOpen(true)}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <div
                              style={{
                                backgroundColor: settingsLoaded.primaryColorDark,
                              }}
                              className={classes.colorAdorment}
                            ></div>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <IconButton
                            size="small"
                            color="default"
                            onClick={() => setPrimaryColorDarkModalOpen(true)}
                          >
                            <Colorize />
                          </IconButton>
                        ),
                      }}
                    />
                  </FormControl>
                  <ColorBoxModal
                    open={primaryColorDarkModalOpen}
                    handleClose={() => setPrimaryColorDarkModalOpen(false)}
                    onChange={(color) => {
                      handleSaveSetting("primaryColorDark", `#${color.hex}`);
                      colorMode.setPrimaryColorDark(`#${color.hex}`);
                    }}
                    currentColor={settingsLoaded.primaryColorDark}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Seção de Logos e Imagens */}
            <Paper className={classes.sectionPaper} elevation={0}>
              <div className={classes.sectionHeader}>
                <div className={classes.sectionIconWrap}>
                  <Image className={classes.sectionIcon} />
                </div>
                <div>
                  <Typography variant="h6" className={classes.sectionTitle}>
                    {i18n.t("whitelabel.sections.logos")}
                  </Typography>
                  <Typography className={classes.sectionSubtitle}>
                    {i18n.t("whitelabel.sections.logosDescription")}
                  </Typography>
                </div>
              </div>

              <Grid container spacing={2}>
                {/* COLUNA TEMA CLARO */}
                <Grid xs={12} md={6} item>
                  <div className={classes.themeColumnLight}>
                    <div className={classes.themeColumnHeader}>
                      <WbSunny className={`${classes.themeColumnIcon} ${classes.themeColumnIconLight}`} />
                      <Typography className={`${classes.themeColumnTitle} ${classes.themeColumnTitleLight}`}>
                        {i18n.t("whitelabel.themeLight")}
                      </Typography>
                    </div>

                    <FormControl className={classes.formField} fullWidth>
                      <TextField
                        id="logo-light-upload-field"
                        label={i18n.t("whitelabel.logoLight")}
                        variant="outlined"
                        value={settingsLoaded.appLogoLight || ""}
                        size="small"
                        className={classes.uploadField}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <>
                              {settingsLoaded.appLogoLight && (
                                <IconButton
                                  size="small"
                                  color="default"
                                  onClick={() => {
                                    handleSaveSetting("appLogoLight", "");
                                    colorMode.setAppLogoLight(defaultLogoLight);
                                  }}
                                >
                                  <Delete titleAccess={i18n.t("whitelabel.delete")} />
                                </IconButton>
                              )}
                              <input
                                type="file"
                                id="upload-logo-light-button"
                                ref={logoLightInput}
                                className={classes.uploadInput}
                                onChange={(e) => uploadLogo(e, "Light")}
                              />
                              <label htmlFor="upload-logo-light-button">
                                <IconButton
                                  size="small"
                                  color="default"
                                  onClick={() => { logoLightInput.current.click(); }}
                                >
                                  <AttachFile titleAccess={i18n.t("whitelabel.upload")} />
                                </IconButton>
                              </label>
                            </>
                          ),
                        }}
                      />
                    </FormControl>

                    <FormControl className={classes.formField} fullWidth>
                      <TextField
                        id="logo-horizontal-menu-upload-field"
                        label={i18n.t("whitelabel.logoHorizontalMenuLight")}
                        variant="outlined"
                        value={settingsLoaded.appLogoHorizontalMenu || ""}
                        size="small"
                        className={classes.uploadField}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <>
                              {settingsLoaded.appLogoHorizontalMenu && (
                                <IconButton
                                  size="small"
                                  color="default"
                                  onClick={() => {
                                    handleSaveSetting("appLogoHorizontalMenu", "");
                                    colorMode.setAppLogoHorizontalMenu(null);
                                    updateSettingsLoaded("appLogoHorizontalMenu", "");
                                  }}
                                >
                                  <Delete titleAccess={i18n.t("whitelabel.delete")} />
                                </IconButton>
                              )}
                              <input
                                type="file"
                                id="upload-logo-horizontal-menu-button"
                                ref={logoHorizontalMenuInput}
                                className={classes.uploadInput}
                                onChange={(e) => uploadLogo(e, "HorizontalMenu")}
                              />
                              <label htmlFor="upload-logo-horizontal-menu-button">
                                <IconButton
                                  size="small"
                                  color="default"
                                  onClick={() => { logoHorizontalMenuInput.current.click(); }}
                                >
                                  <AttachFile titleAccess={i18n.t("whitelabel.upload")} />
                                </IconButton>
                              </label>
                            </>
                          ),
                        }}
                      />
                    </FormControl>

                    <FormControl className={classes.formField} fullWidth>
                      <TextField
                        id="background-light-upload-field"
                        label={i18n.t("whitelabel.backgroundLight")}
                        variant="outlined"
                        value={settingsLoaded.appLogoBackgroundLight || ""}
                        size="small"
                        className={classes.uploadField}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <>
                              {settingsLoaded.appLogoBackgroundLight && (
                                <IconButton
                                  size="small"
                                  color="default"
                                  onClick={() => { handleSaveSetting("appLogoBackgroundLight", ""); }}
                                >
                                  <Delete titleAccess={i18n.t("whitelabel.delete")} />
                                </IconButton>
                              )}
                              <input
                                type="file"
                                id="upload-background-light-button"
                                ref={backgroundLightInput}
                                className={classes.uploadInput}
                                onChange={(e) => uploadLogo(e, "BackgroundLight")}
                              />
                              <label htmlFor="upload-background-light-button">
                                <IconButton
                                  size="small"
                                  color="default"
                                  onClick={() => { backgroundLightInput.current.click(); }}
                                >
                                  <AttachFile titleAccess={i18n.t("whitelabel.upload")} />
                                </IconButton>
                              </label>
                            </>
                          ),
                        }}
                      />
                    </FormControl>

                    {/* Preview Tema Claro */}
                    <div className={classes.themeColumnPreview}>
                      <div className={`${classes.previewCard} ${classes.previewCardLight} ${classes.themePreviewCard}`}>
                        <img
                          className={classes.previewImage}
                          src={settingsLoaded.appLogoLight ? getBackendUrl() + "/public/" + settingsLoaded.appLogoLight : defaultLogoLight}
                          alt="light-logo"
                          onError={(e) => { e.target.src = defaultLogoLight; }}
                        />
                        <div className={classes.previewLabel}>{i18n.t("whitelabel.logoLight")}</div>
                      </div>
                      <div className={`${classes.previewCard} ${classes.previewCardLight} ${classes.themePreviewCard}`}>
                        <img
                          className={classes.previewImage}
                          src={settingsLoaded.appLogoHorizontalMenu ? getBackendUrl() + "/public/" + settingsLoaded.appLogoHorizontalMenu : defaultLogoLight}
                          alt="horizontal-menu-light"
                          onError={(e) => { e.target.src = defaultLogoLight; }}
                        />
                        <div className={classes.previewLabel}>{i18n.t("whitelabel.logoHorizontalMenuLight")}</div>
                      </div>
                      <div className={`${classes.previewCard} ${classes.previewCardLight} ${classes.themePreviewCard} ${classes.themePreviewCardWide}`}>
                        {settingsLoaded.appLogoBackgroundLight ? (
                          <img
                            className={classes.previewBackgroundImage}
                            src={getBackendUrl() + "/public/" + settingsLoaded.appLogoBackgroundLight}
                            alt="background-light"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div className={classes.previewLabel}>{i18n.t("whitelabel.backgroundLight")}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </Grid>

                {/* COLUNA TEMA ESCURO */}
                <Grid xs={12} md={6} item>
                  <div className={classes.themeColumnDark}>
                    <div className={`${classes.themeColumnHeader} ${classes.themeColumnDarkHeader}`}>
                      <NightsStay className={`${classes.themeColumnIcon} ${classes.themeColumnIconDark}`} />
                      <Typography className={`${classes.themeColumnTitle} ${classes.themeColumnTitleDark}`}>
                        {i18n.t("whitelabel.themeDark")}
                      </Typography>
                    </div>

                    <FormControl className={classes.formField} fullWidth>
                      <TextField
                        id="logo-dark-upload-field"
                        label={i18n.t("whitelabel.logoDark")}
                        variant="outlined"
                        value={settingsLoaded.appLogoDark || ""}
                        size="small"
                        className={classes.uploadField}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <>
                              {settingsLoaded.appLogoDark && (
                                <IconButton
                                  size="small"
                                  color="default"
                                  onClick={() => {
                                    handleSaveSetting("appLogoDark", "");
                                    colorMode.setAppLogoDark(defaultLogoDark);
                                  }}
                                >
                                  <Delete titleAccess={i18n.t("whitelabel.delete")} />
                                </IconButton>
                              )}
                              <input
                                type="file"
                                id="upload-logo-dark-button"
                                ref={logoDarkInput}
                                className={classes.uploadInput}
                                onChange={(e) => uploadLogo(e, "Dark")}
                              />
                              <label htmlFor="upload-logo-dark-button">
                                <IconButton
                                  size="small"
                                  color="default"
                                  onClick={() => { logoDarkInput.current.click(); }}
                                >
                                  <AttachFile titleAccess={i18n.t("whitelabel.upload")} />
                                </IconButton>
                              </label>
                            </>
                          ),
                        }}
                      />
                    </FormControl>

                    <FormControl className={classes.formField} fullWidth>
                      <TextField
                        id="logo-horizontal-menu-dark-upload-field"
                        label={i18n.t("whitelabel.logoHorizontalMenuDark")}
                        variant="outlined"
                        value={settingsLoaded.appLogoHorizontalMenuDark || ""}
                        size="small"
                        className={classes.uploadField}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <>
                              {settingsLoaded.appLogoHorizontalMenuDark && (
                                <IconButton
                                  size="small"
                                  color="default"
                                  onClick={() => {
                                    handleSaveSetting("appLogoHorizontalMenuDark", "");
                                    colorMode.setAppLogoHorizontalMenuDark(null);
                                    updateSettingsLoaded("appLogoHorizontalMenuDark", "");
                                  }}
                                >
                                  <Delete titleAccess={i18n.t("whitelabel.delete")} />
                                </IconButton>
                              )}
                              <input
                                type="file"
                                id="upload-logo-horizontal-menu-dark-button"
                                ref={logoHorizontalMenuDarkInput}
                                className={classes.uploadInput}
                                onChange={(e) => uploadLogo(e, "HorizontalMenuDark")}
                              />
                              <label htmlFor="upload-logo-horizontal-menu-dark-button">
                                <IconButton
                                  size="small"
                                  color="default"
                                  onClick={() => { logoHorizontalMenuDarkInput.current.click(); }}
                                >
                                  <AttachFile titleAccess={i18n.t("whitelabel.upload")} />
                                </IconButton>
                              </label>
                            </>
                          ),
                        }}
                      />
                    </FormControl>

                    <FormControl className={classes.formField} fullWidth>
                      <TextField
                        id="background-dark-upload-field"
                        label={i18n.t("whitelabel.backgroundDark")}
                        variant="outlined"
                        value={settingsLoaded.appLogoBackgroundDark || ""}
                        size="small"
                        className={classes.uploadField}
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <>
                              {settingsLoaded.appLogoBackgroundDark && (
                                <IconButton
                                  size="small"
                                  color="default"
                                  onClick={() => { handleSaveSetting("appLogoBackgroundDark", ""); }}
                                >
                                  <Delete titleAccess={i18n.t("whitelabel.delete")} />
                                </IconButton>
                              )}
                              <input
                                type="file"
                                id="upload-background-dark-button"
                                ref={backgroundDarkInput}
                                className={classes.uploadInput}
                                onChange={(e) => uploadLogo(e, "BackgroundDark")}
                              />
                              <label htmlFor="upload-background-dark-button">
                                <IconButton
                                  size="small"
                                  color="default"
                                  onClick={() => { backgroundDarkInput.current.click(); }}
                                >
                                  <AttachFile titleAccess={i18n.t("whitelabel.upload")} />
                                </IconButton>
                              </label>
                            </>
                          ),
                        }}
                      />
                    </FormControl>

                    {/* Preview Tema Escuro */}
                    <div className={classes.themeColumnPreview}>
                      <div className={`${classes.previewCard} ${classes.previewCardDark} ${classes.themePreviewCard}`}>
                        <img
                          className={classes.previewImage}
                          src={settingsLoaded.appLogoDark ? getBackendUrl() + "/public/" + settingsLoaded.appLogoDark : defaultLogoDark}
                          alt="dark-logo"
                          onError={(e) => { e.target.src = defaultLogoDark; }}
                        />
                        <div className={`${classes.previewLabel} ${classes.previewLabelDark}`}>{i18n.t("whitelabel.logoDark")}</div>
                      </div>
                      <div className={`${classes.previewCard} ${classes.previewCardDark} ${classes.themePreviewCard}`}>
                        <img
                          className={classes.previewImage}
                          src={settingsLoaded.appLogoHorizontalMenuDark ? getBackendUrl() + "/public/" + settingsLoaded.appLogoHorizontalMenuDark : defaultLogoDark}
                          alt="horizontal-menu-dark"
                          onError={(e) => { e.target.src = defaultLogoDark; }}
                        />
                        <div className={`${classes.previewLabel} ${classes.previewLabelDark}`}>{i18n.t("whitelabel.logoHorizontalMenuDark")}</div>
                      </div>
                      <div className={`${classes.previewCard} ${classes.previewCardDark} ${classes.themePreviewCard} ${classes.themePreviewCardWide}`}>
                        {settingsLoaded.appLogoBackgroundDark ? (
                          <img
                            className={classes.previewBackgroundImage}
                            src={getBackendUrl() + "/public/" + settingsLoaded.appLogoBackgroundDark}
                            alt="background-dark"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : (
                          <div className={`${classes.previewLabel} ${classes.previewLabelDark}`}>{i18n.t("whitelabel.backgroundDark")}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </Grid>
              </Grid>
            </Paper>

            {/* Seção de Idiomas */}
            <Paper className={classes.sectionPaper} elevation={0}>
              <div className={classes.sectionHeader}>
                <div className={classes.sectionIconWrap}>
                  <Language className={classes.sectionIcon} />
                </div>
                <div>
                  <Typography variant="h6" className={classes.sectionTitle}>
                    {i18n.t("whitelabel.sections.languages")}
                  </Typography>
                  <Typography className={classes.sectionSubtitle}>
                    {i18n.t("whitelabel.sections.languagesDescription")}
                  </Typography>
                </div>
              </div>

              <div className={classes.languageSection}>
                <div className={classes.languageGrid}>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <div key={lang.code} className={classes.languageItem}>
                      <Checkbox
                        className={classes.languageCheckbox}
                        checked={enabledLanguages.includes(lang.code)}
                        onChange={(e) => {
                          let newLangs = e.target.checked
                            ? [...enabledLanguages, lang.code]
                            : enabledLanguages.filter((c) => c !== lang.code);
                          if (newLangs.length === 0) {
                            toast.error(
                              i18n.t("whitelabel.atLeastOneLanguage")
                            );
                            return;
                          }
                          handleSaveEnabledLanguages(newLangs);
                        }}
                        color="primary"
                        size="small"
                      />
                      <span className={classes.languageLabel} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "20px", lineHeight: 1 }}>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Paper>
          </>
        )}
      />
    </div>
  );
}
