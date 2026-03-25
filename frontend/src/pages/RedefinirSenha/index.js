import React, { useState, useEffect, useContext } from "react";
import { useHistory, useLocation } from "react-router-dom";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import api from "../../services/api";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import IconButton from "@material-ui/core/IconButton";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import InputAdornment from "@material-ui/core/InputAdornment";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import useSettings from "../../hooks/useSettings";
import { getBackendUrl } from "../../config";
import ColorModeContext from "../../layout/themeContext";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#0a0a0a",
    },

    bannerSide: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        overflow: "hidden",

        [theme.breakpoints.down("sm")]: {
            display: "block",
        },
    },

    bannerImage: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
    },

    bannerFallback: {
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },

    formSide: {
        width: "420px",
        minWidth: "420px",
        height: "calc(100% - 48px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(18, 20, 28, 0.82)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        padding: "40px 32px",
        boxSizing: "border-box",
        overflowY: "auto",
        position: "absolute",
        right: 0,
        top: 0,
        zIndex: 1,
        borderRadius: "20px 0 0 20px",
        margin: "24px 0 24px 0",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.07)",

        [theme.breakpoints.down("sm")]: {
            width: "100%",
            minWidth: "unset",
            padding: "32px 24px",
            borderRadius: "20px 20px 0 0",
            margin: "auto 0 0 0",
            height: "auto",
            bottom: 0,
            top: "auto",
        },
    },

    backButton: {
        position: "absolute",
        top: "20px",
        left: "20px",
        color: "#c9d1d9",
        "&:hover": {
            backgroundColor: "rgba(255,255,255,0.1)",
        },
    },

    title: {
        fontSize: "24px",
        fontWeight: 700,
        color: "#e6edf3",
        marginBottom: "8px",
        textAlign: "center",
    },

    logoTitle: {
        fontSize: "28px",
        fontWeight: 800,
        color: "#e6edf3",
        marginBottom: "32px",
        textAlign: "center",
        letterSpacing: "1px",
    },

    subtitle: {
        fontSize: "13px",
        color: "#8b949e",
        marginBottom: "32px",
        textAlign: "center",
        lineHeight: "1.6",
    },

    inputLabel: {
        fontSize: "13px",
        fontWeight: 600,
        color: "#c9d1d9",
        marginBottom: "4px",
        display: "block",
        textAlign: "left",
        width: "100%",
    },

    textField: {
        marginBottom: "14px",
        "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            fontSize: "14px",
            backgroundColor: "rgba(255,255,255,0.05)",
            color: "#e6edf3",
            "& fieldset": {
                borderColor: "rgba(255,255,255,0.12)",
            },
            "&:hover fieldset": {
                borderColor: "rgba(255,255,255,0.22)",
            },
            "&.Mui-focused fieldset": {
                borderColor: theme.palette.primary.main,
                borderWidth: "1.5px",
            },
        },
        "& .MuiInputLabel-outlined": {
            fontSize: "14px",
            color: "#8b949e",
        },
        "& .MuiInputLabel-outlined.Mui-focused": {
            color: theme.palette.primary.main,
        },
        "& .MuiInputBase-input": {
            color: "#e6edf3",
        },
    },

    submitButton: {
        width: "100%",
        padding: "12px 0",
        borderRadius: "8px",
        fontSize: "15px",
        fontWeight: 700,
        textTransform: "none",
        color: "#fff",
        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark || theme.palette.primary.main})`,
        boxShadow: `0 4px 14px ${theme.palette.primary.main}55`,
        border: "none",
        marginTop: "8px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
            opacity: 0.92,
            transform: "translateY(-1px)",
            boxShadow: `0 6px 20px ${theme.palette.primary.main}66`,
        },
        "&:disabled": {
            opacity: 0.6,
            cursor: "not-allowed",
        },
    },

    dialogContent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 32px",
        textAlign: "center",
    },

    dialogIcon: {
        fontSize: "64px",
        marginBottom: "16px",
    },

    dialogTitle: {
        fontSize: "20px",
        fontWeight: 700,
        marginBottom: "8px",
    },

    dialogSubtitle: {
        fontSize: "14px",
        color: "#8b949e",
        marginBottom: "16px",
    },

    countdown: {
        fontSize: "32px",
        fontWeight: 700,
        color: theme.palette.primary.main,
    },
}));

const RedefinirSenha = () => {
    const classes = useStyles();
    const history = useHistory();
    const location = useLocation();
    const { getPublicSetting } = useSettings();
    const { colorMode } = useContext(ColorModeContext);
    const { mode } = colorMode;

    const [step, setStep] = useState(1); // 1: validar código, 2: nova senha
    const [token, setToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [countdown, setCountdown] = useState(7);
    const [appName, setAppName] = useState("BotConnecta");
    const [bannerUrl, setBannerUrl] = useState("");

    const emailFromLocation = location.state?.email || "";

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const name = await getPublicSetting("appName");
                if (name) {
                    setAppName(name);
                }

                // Tentar buscar background específico do modo (light/dark)
                const bgKey = mode === "light" ? "appLogoBackgroundLight" : "appLogoBackgroundDark";
                console.log("Buscando background com chave:", bgKey);
                let bg = await getPublicSetting(bgKey);
                console.log("Background retornado:", bg);

                // Se não encontrar, tentar o outro modo
                if (!bg) {
                    const alternateKey = mode === "light" ? "appLogoBackgroundDark" : "appLogoBackgroundLight";
                    console.log("Tentando chave alternativa:", alternateKey);
                    bg = await getPublicSetting(alternateKey);
                    console.log("Background alternativo retornado:", bg);
                }

                if (bg) {
                    const url = getBackendUrl() + "/public/" + bg;
                    console.log("URL do banner:", url);
                    setBannerUrl(url);
                } else {
                    console.log("Nenhum background configurado");
                }
            } catch (error) {
                console.log("Erro ao buscar configurações, usando valores padrão", error);
            }
        };
        fetchSettings();
    }, [mode]);

    useEffect(() => {
        let timer;
        if (showSuccessDialog && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else if (showSuccessDialog && countdown === 0) {
            history.push("/login");
        }
        return () => clearTimeout(timer);
    }, [showSuccessDialog, countdown, history]);

    const handleValidateToken = async (e) => {
        e.preventDefault();

        if (!token || token.length !== 6) {
            toast.error("Por favor, digite o código de 6 dígitos");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/password-reset/validate", { token });
            toast.success("Código válido! Agora defina sua nova senha.");
            setStep(2);
        } catch (err) {
            console.error(err);

            // Mostrar mensagem específica do backend se disponível
            if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Código inválido ou expirado. Tente novamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast.error("Por favor, preencha todos os campos");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("A senha deve ter no mínimo 6 caracteres");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/password-reset/reset", {
                token,
                newPassword,
            });

            setShowSuccessDialog(true);
            setCountdown(7);
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.message || "Erro ao redefinir senha. Tente novamente.";
            setErrorMessage(message);
            setShowErrorDialog(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={classes.root}>
            <Helmet>
                <title>Redefinir Senha | {appName}</title>
            </Helmet>

            <CssBaseline />

            {/* LADO ESQUERDO - BANNER */}
            <div className={classes.bannerSide}>
                {bannerUrl ? (
                    <img
                        src={bannerUrl}
                        alt="banner"
                        className={classes.bannerImage}
                        onLoad={() => console.log("Imagem carregada com sucesso:", bannerUrl)}
                        onError={(e) => {
                            console.error("Erro ao carregar imagem:", bannerUrl);
                            console.error("Evento de erro:", e);
                        }}
                    />
                ) : (
                    <div className={classes.bannerFallback} />
                )}
            </div>

            {/* Formulário */}
            <div className={classes.formSide}>
                <IconButton
                    className={classes.backButton}
                    onClick={() => history.push("/login")}
                    aria-label="Voltar"
                >
                    <ArrowBackIcon />
                </IconButton>

                <Typography className={classes.logoTitle}>
                    🔒 {appName}
                </Typography>

                {step === 1 ? (
                    <>
                        <Typography className={classes.title}>
                            Digite o Código
                        </Typography>

                        <Typography className={classes.subtitle}>
                            Enviamos um código de 6 dígitos para<br />
                            {emailFromLocation && <strong>{emailFromLocation}</strong>}
                            {!emailFromLocation && "seu email"}
                        </Typography>

                        <form onSubmit={handleValidateToken} style={{ width: "100%" }}>
                            <label className={classes.inputLabel}>Código de Recuperação</label>
                            <TextField
                                variant="outlined"
                                fullWidth
                                placeholder="000000"
                                value={token}
                                onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                className={classes.textField}
                                disabled={loading}
                                inputProps={{
                                    maxLength: 6,
                                    style: { textAlign: "center", fontSize: "24px", letterSpacing: "8px" }
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                className={classes.submitButton}
                                disabled={loading}
                            >
                                {loading ? "Validando..." : "Validar Código"}
                            </Button>
                        </form>
                    </>
                ) : (
                    <>
                        <Typography className={classes.title}>
                            Nova Senha
                        </Typography>

                        <Typography className={classes.subtitle}>
                            Digite sua nova senha para acessar o sistema
                        </Typography>

                        <form onSubmit={handleResetPassword} style={{ width: "100%" }}>
                            <label className={classes.inputLabel}>Nova Senha</label>
                            <TextField
                                variant="outlined"
                                fullWidth
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={classes.textField}
                                disabled={loading}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                style={{ color: "#8b949e" }}
                                            >
                                                {showPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <label className={classes.inputLabel}>Confirmar Senha</label>
                            <TextField
                                variant="outlined"
                                fullWidth
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={classes.textField}
                                disabled={loading}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                edge="end"
                                                style={{ color: "#8b949e" }}
                                            >
                                                {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                className={classes.submitButton}
                                disabled={loading}
                            >
                                {loading ? "Redefinindo..." : "Redefinir Senha"}
                            </Button>
                        </form>
                    </>
                )}
            </div>

            {/* Dialog de Sucesso */}
            <Dialog open={showSuccessDialog} onClose={() => { }}>
                <DialogContent className={classes.dialogContent}>
                    <CheckCircleIcon className={classes.dialogIcon} style={{ color: "#4caf50" }} />
                    <Typography className={classes.dialogTitle}>
                        Senha Alterada com Sucesso!
                    </Typography>
                    <Typography className={classes.dialogSubtitle}>
                        Você será redirecionado para o login em:
                    </Typography>
                    <Typography className={classes.countdown}>
                        {countdown}s
                    </Typography>
                </DialogContent>
            </Dialog>

            {/* Dialog de Erro */}
            <Dialog open={showErrorDialog} onClose={() => setShowErrorDialog(false)}>
                <DialogContent className={classes.dialogContent}>
                    <ErrorIcon className={classes.dialogIcon} style={{ color: "#f44336" }} />
                    <Typography className={classes.dialogTitle}>
                        Erro ao Redefinir Senha
                    </Typography>
                    <Typography className={classes.dialogSubtitle}>
                        {errorMessage}
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => setShowErrorDialog(false)}
                        className={classes.submitButton}
                        style={{ marginTop: "16px" }}
                    >
                        Tentar Novamente
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default RedefinirSenha;
