import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
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
}));

const EsqueceuSenha = () => {
    const classes = useStyles();
    const history = useHistory();
    const { getPublicSetting } = useSettings();
    const { colorMode } = useContext(ColorModeContext);
    const { mode } = colorMode;

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [appName, setAppName] = useState("BotConnecta");
    const [bannerUrl, setBannerUrl] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error("Por favor, digite seu email");
            return;
        }

        setLoading(true);
        setErrorMessage(""); // Limpar mensagem de erro anterior

        try {
            await api.post("/auth/password-reset/request", { email });
            toast.success("Código de recuperação enviado para seu email!");

            // Redirecionar para página de redefinição com o email
            setTimeout(() => {
                history.push({
                    pathname: "/redefinir-senha",
                    state: { email }
                });
            }, 1500);
        } catch (err) {
            console.error(err);

            // Verificar se é erro de email não cadastrado
            if (err.response?.status === 404) {
                const mensagem = "❌ Email não cadastrado em nosso sistema.";
                setErrorMessage(mensagem);
                toast.error(mensagem);
            } else if (err.response?.data?.message) {
                setErrorMessage(err.response.data.message);
                toast.error(err.response.data.message);
            } else {
                const mensagem = "E-mail não cadastrado. Código de recuperação não enviado";
                setErrorMessage(mensagem);
                toast.error(mensagem);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={classes.root}>
            <Helmet>
                <title>Esqueceu a Senha | {appName}</title>
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

                <Typography className={classes.title}>
                    Esqueceu sua senha?
                </Typography>

                <Typography className={classes.subtitle}>
                    Digite seu email cadastrado e enviaremos<br />
                    um código de recuperação.
                </Typography>

                <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                    <label className={classes.inputLabel}>Email</label>
                    <TextField
                        variant="outlined"
                        fullWidth
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setErrorMessage(""); // Limpar erro ao digitar
                        }}
                        className={classes.textField}
                        disabled={loading}
                    />

                    {/* Mensagem de erro visível */}
                    {errorMessage && (
                        <Typography
                            style={{
                                color: "#ff4444",
                                fontSize: "14px",
                                marginTop: "8px",
                                marginBottom: "8px",
                                textAlign: "center",
                                fontWeight: 500,
                                background: "rgba(255, 68, 68, 0.1)",
                                padding: "10px 15px",
                                borderRadius: "6px",
                                border: "1px solid rgba(255, 68, 68, 0.3)"
                            }}
                        >
                            {errorMessage}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        variant="contained"
                        className={classes.submitButton}
                        disabled={loading}
                    >
                        {loading ? "Enviando..." : "Enviar Código"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default EsqueceuSenha;
