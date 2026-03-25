import React, { useContext, useEffect, useState, useReducer } from "react";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Badge from "@material-ui/core/Badge";

import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import CodeRoundedIcon from "@material-ui/icons/CodeRounded";
import { ViewKanban } from "@mui/icons-material";
import Schedule from "@material-ui/icons/Schedule";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import CakeIcon from "@material-ui/icons/Cake";
import ForumIcon from "@material-ui/icons/Forum";
import LocalAtmIcon from "@material-ui/icons/LocalAtm";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import BusinessIcon from "@material-ui/icons/Business";
import { AttachFile, Description, DeviceHubOutlined, AllInclusive, Dashboard } from "@material-ui/icons";
import { ShapeLine, Webhook } from "@mui/icons-material";

import { AuthContext } from "../context/Auth/AuthContext";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import usePlans from "../hooks/usePlans";
import useCompanySettings from "../hooks/useSettings/companySettings";
import useHelps from "../hooks/useHelps";
import { i18n } from "../translate/i18n";
import api from "../services/api";
import toastError from "../errors/toastError";
import { isArray } from "lodash";

const useStyles = makeStyles((theme) => ({
    menuButton: {
        color: "white",
        textTransform: "none",
        fontWeight: 600,
        fontSize: "13px",
        padding: "4px 8px",
        minWidth: "auto",
        borderRadius: "6px",
        "&:hover": {
            backgroundColor: "rgba(255,255,255,0.15)",
        },
    },
    menuItem: {
        fontSize: "13px",
        fontWeight: 500,
        gap: "8px",
        minWidth: "180px",
    },
    menuIcon: {
        fontSize: "18px",
        color: theme.palette.primary.main,
        minWidth: "26px",
    },
    navWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "2px",
        flexWrap: "nowrap",
        overflow: "hidden",
    },
    badgeDot: {
        "& .MuiBadge-badge": {
            backgroundColor: "#ef4444",
        },
    },
}));

const reducer = (state, action) => {
    if (action.type === "LOAD_CHATS") {
        const chats = action.payload;
        const newChats = [];
        if (isArray(chats)) {
            chats.forEach((chat) => {
                const chatIndex = state.findIndex((u) => u.id === chat.id);
                if (chatIndex !== -1) state[chatIndex] = chat;
                else newChats.push(chat);
            });
        }
        return [...state, ...newChats];
    }
    if (action.type === "CHANGE_CHAT") {
        return state.map((c) => (c.id === action.payload.chat.id ? action.payload.chat : c));
    }
    if (action.type === "RESET") return [];
    return state;
};

const HorizontalMenu = () => {
    const classes = useStyles();
    const history = useHistory();
    const { user, socket } = useContext(AuthContext);
    const { whatsApps } = useContext(WhatsAppsContext);

    const [anchors, setAnchors] = useState({});

    // feature flags
    const [showCampaigns, setShowCampaigns] = useState(false);
    const [showKanban, setShowKanban] = useState(false);
    const [showOpenAi, setShowOpenAi] = useState(false);
    const [showIntegrations, setShowIntegrations] = useState(false);
    const [showSchedules, setShowSchedules] = useState(false);
    const [showInternalChat, setShowInternalChat] = useState(false);
    const [showExternalApi, setShowExternalApi] = useState(false);
    const [showWallets, setShowWallets] = useState(false);
    const [connectionWarning, setConnectionWarning] = useState(false);
    const [invisible, setInvisible] = useState(true);
    const [chats, dispatch] = useReducer(reducer, []);

    const { getPlanCompany } = usePlans();
    const { get: getSetting } = useCompanySettings();
    const { list } = useHelps();
    const [hasHelps, setHasHelps] = useState(false);

    useEffect(() => {
        async function fetchData() {
            const companyId = user.companyId;
            if (!companyId) return;
            const planConfigs = await getPlanCompany(undefined, companyId);
            setShowCampaigns(planConfigs.plan.useCampaigns);
            setShowKanban(planConfigs.plan.useKanban);
            setShowOpenAi(planConfigs.plan.useOpenAi);
            setShowIntegrations(planConfigs.plan.useIntegrations);
            setShowSchedules(planConfigs.plan.useSchedules);
            setShowInternalChat(planConfigs.plan.useInternalChat);
            setShowExternalApi(planConfigs.plan.useExternalApi);
        }
        fetchData();
    }, [user?.companyId]);

    useEffect(() => {
        async function checkWallets() {
            try {
                const setting = await getSetting({ column: "DirectTicketsToWallets" });
                if (setting?.value === "enabled") setShowWallets(true);
            } catch { }
        }
        checkWallets();
    }, [user?.companyId]);

    useEffect(() => {
        async function checkHelps() {
            const helps = await list();
            setHasHelps(helps.length > 0);
        }
        checkHelps();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (whatsApps.length > 0) {
                const offline = whatsApps.filter((w) =>
                    ["qrcode", "PAIRING", "DISCONNECTED", "TIMEOUT", "OPENING"].includes(w.status)
                );
                setConnectionWarning(offline.length > 0);
            }
        }, 2000);
        return () => clearTimeout(delayDebounceFn);
    }, [whatsApps]);

    useEffect(() => {
        async function fetchChats() {
            try {
                const { data } = await api.get("/chats/", { params: { searchParam: "", pageNumber: 1 } });
                dispatch({ type: "LOAD_CHATS", payload: data.records });
            } catch (err) {
                toastError(err);
            }
        }
        fetchChats();
    }, []);

    useEffect(() => {
        if (user.id && socket && typeof socket.on === "function") {
            const companyId = user.companyId;
            const handler = (data) => {
                if (data.action === "new-message" || data.action === "update") {
                    dispatch({ type: "CHANGE_CHAT", payload: data });
                }
            };
            socket.on(`company-${companyId}-chat`, handler);
            return () => {
                if (socket && typeof socket.off === "function") {
                    socket.off(`company-${companyId}-chat`, handler);
                }
            };
        }
    }, [socket, user.id, user.companyId]);

    useEffect(() => {
        let unreads = 0;
        chats.forEach((chat) => {
            chat.users?.forEach((cu) => {
                if (cu.userId === user.id) unreads += cu.unreads;
            });
        });
        setInvisible(unreads === 0);
    }, [chats, user.id]);

    const handleOpen = (key) => (e) => setAnchors((prev) => ({ ...prev, [key]: e.currentTarget }));
    const handleClose = (key) => () => setAnchors((prev) => ({ ...prev, [key]: null }));

    const navigate = (path, key) => {
        handleClose(key)();
        history.push(path);
    };

    const isAdmin = user.profile === "admin";
    const isSuper = user.super;
    const showAdmin = isAdmin || user.allowConnections === "enabled";

    return (
        <div className={classes.navWrapper}>
            {/* Dashboard */}
            {(user.showDashboard === "enabled" || user.allowRealTime === "enabled") && (
                <>
                    <Button
                        className={classes.menuButton}
                        startIcon={<DashboardOutlinedIcon style={{ fontSize: 20 }} />}
                        endIcon={<ExpandMoreIcon style={{ fontSize: 16 }} />}
                        onClick={handleOpen("dash")}
                    >
                        Dashboard
                    </Button>
                    <Menu
                        anchorEl={anchors["dash"]}
                        open={Boolean(anchors["dash"])}
                        onClose={handleClose("dash")}
                        getContentAnchorEl={null}
                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        transformOrigin={{ vertical: "top", horizontal: "left" }}
                    >
                        {user.showDashboard === "enabled" && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/", "dash")}>
                                <DashboardOutlinedIcon className={classes.menuIcon} /> Dashboard
                            </MenuItem>
                        )}
                        {user.showDashboard === "enabled" && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/reports", "dash")}>
                                <Description className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.reports")}
                            </MenuItem>
                        )}
                        {user.allowRealTime === "enabled" && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/moments", "dash")}>
                                <ForumIcon className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.chatsTempoReal")}
                            </MenuItem>
                        )}
                        {isAdmin && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/plugins/floup/dashboard", "dash")}>
                                <ViewKanban className={classes.menuIcon} /> Painel FollowUP
                            </MenuItem>
                        )}
                    </Menu>
                </>
            )}

            {/* Atendimentos */}
            <Button
                className={classes.menuButton}
                startIcon={<WhatsAppIcon style={{ fontSize: 20 }} />}
                endIcon={<ExpandMoreIcon style={{ fontSize: 16 }} />}
                onClick={handleOpen("atend")}
            >
                {i18n.t("mainDrawer.listItems.tickets")}
            </Button>
            <Menu
                anchorEl={anchors["atend"]}
                open={Boolean(anchors["atend"])}
                onClose={handleClose("atend")}
                getContentAnchorEl={null}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
                <MenuItem className={classes.menuItem} onClick={() => navigate("/tickets", "atend")}>
                    <WhatsAppIcon className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.tickets")}
                </MenuItem>
                <MenuItem className={classes.menuItem} onClick={() => navigate("/quick-messages", "atend")}>
                    <FlashOnIcon className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.quickMessages")}
                </MenuItem>
                <MenuItem className={classes.menuItem} onClick={() => navigate("/template-manager", "atend")}>
                    <Description className={classes.menuIcon} /> Templates Meta
                </MenuItem>
                {showKanban && (
                    <MenuItem className={classes.menuItem} onClick={() => navigate("/kanban", "atend")}>
                        <ViewKanban className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.kanban")}
                    </MenuItem>
                )}
                {user.showContacts === "enabled" && (
                    <MenuItem className={classes.menuItem} onClick={() => navigate("/contacts", "atend")}>
                        <ContactPhoneOutlinedIcon className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.contacts")}
                    </MenuItem>
                )}
                {showSchedules && (
                    <MenuItem className={classes.menuItem} onClick={() => navigate("/schedules", "atend")}>
                        <Schedule className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.schedules")}
                    </MenuItem>
                )}
                <MenuItem className={classes.menuItem} onClick={() => navigate("/tags", "atend")}>
                    <LocalOfferIcon className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.tags")}
                </MenuItem>
                {showInternalChat && (
                    <MenuItem className={classes.menuItem} onClick={() => navigate("/chats", "atend")}>
                        <Badge color="secondary" variant="dot" invisible={invisible} className={classes.badgeDot}>
                            <ForumIcon className={classes.menuIcon} />
                        </Badge>
                        {i18n.t("mainDrawer.listItems.chats")}
                    </MenuItem>
                )}
                {hasHelps && (
                    <MenuItem className={classes.menuItem} onClick={() => navigate("/helps", "atend")}>
                        {i18n.t("mainDrawer.listItems.helps")}
                    </MenuItem>
                )}
                {user.showCampaign === "enabled" && showCampaigns && (
                    <MenuItem className={classes.menuItem} onClick={() => navigate("/campaigns", "atend")}>
                        <EventAvailableIcon className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.campaigns")}
                    </MenuItem>
                )}
            </Menu>

            {/* Automações */}
            {user.showFlow === "enabled" && (
                <>
                    <Button
                        className={classes.menuButton}
                        startIcon={<AccountTreeOutlinedIcon style={{ fontSize: 20 }} />}
                        endIcon={<ExpandMoreIcon style={{ fontSize: 16 }} />}
                        onClick={handleOpen("auto")}
                    >
                        {i18n.t("mainDrawer.listItems.automations")}
                    </Button>
                    <Menu
                        anchorEl={anchors["auto"]}
                        open={Boolean(anchors["auto"])}
                        onClose={handleClose("auto")}
                        getContentAnchorEl={null}
                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        transformOrigin={{ vertical: "top", horizontal: "left" }}
                    >
                        <MenuItem className={classes.menuItem} onClick={() => navigate("/phrase-lists", "auto")}>
                            <EventAvailableIcon className={classes.menuIcon} /> Fluxo de Campanha
                        </MenuItem>
                        <MenuItem className={classes.menuItem} onClick={() => navigate("/flowbuilders", "auto")}>
                            <ShapeLine className={classes.menuIcon} /> Fluxo de conversa
                        </MenuItem>
                        <MenuItem className={classes.menuItem} onClick={() => navigate("/plugins/floup", "auto")}>
                            <Webhook className={classes.menuIcon} /> Follow UP (Templates)
                        </MenuItem>
                        {showIntegrations && isAdmin && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/queue-integration", "auto")}>
                                <DeviceHubOutlined className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.queueIntegration")}
                            </MenuItem>
                        )}
                        {showOpenAi && isAdmin && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/prompts", "auto")}>
                                <AllInclusive className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.prompts")}
                            </MenuItem>
                        )}
                    </Menu>
                </>
            )}

            {/* Admin */}
            {showAdmin && (
                <>
                    <Button
                        className={classes.menuButton}
                        startIcon={<PeopleAltOutlinedIcon style={{ fontSize: 20 }} />}
                        endIcon={<ExpandMoreIcon style={{ fontSize: 16 }} />}
                        onClick={handleOpen("admin")}
                    >
                        {i18n.t("mainDrawer.listItems.administration")}
                    </Button>
                    <Menu
                        anchorEl={anchors["admin"]}
                        open={Boolean(anchors["admin"])}
                        onClose={handleClose("admin")}
                        getContentAnchorEl={null}
                        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                        transformOrigin={{ vertical: "top", horizontal: "left" }}
                    >
                        {isSuper && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/announcements", "admin")}>
                                <AnnouncementIcon className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.annoucements")}
                            </MenuItem>
                        )}
                        {showExternalApi && isAdmin && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/messages-api", "admin")}>
                                <CodeRoundedIcon className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.messagesAPI")}
                            </MenuItem>
                        )}
                        {isAdmin && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/users", "admin")}>
                                <PeopleAltOutlinedIcon className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.users")}
                            </MenuItem>
                        )}
                        {isAdmin && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/birthday-settings", "admin")}>
                                <CakeIcon className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.birthdaySettings")}
                            </MenuItem>
                        )}
                        {isAdmin && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/queues", "admin")}>
                                <AccountTreeOutlinedIcon className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.queues")}
                            </MenuItem>
                        )}
                        {isAdmin && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/files", "admin")}>
                                <AttachFile className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.files")}
                            </MenuItem>
                        )}
                        {(isAdmin || user.allowConnections === "enabled") && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/connections", "admin")}>
                                <Badge color="error" variant="dot" invisible={!connectionWarning} className={classes.badgeDot}>
                                    <SyncAltIcon className={classes.menuIcon} />
                                </Badge>
                                {i18n.t("mainDrawer.listItems.connections")}
                            </MenuItem>
                        )}
                        {isAdmin && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/financeiro", "admin")}>
                                <LocalAtmIcon className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.financeiro")}
                            </MenuItem>
                        )}
                        {isSuper && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/allConnections", "admin")}>
                                {i18n.t("mainDrawer.listItems.allConnections")}
                            </MenuItem>
                        )}
                        {isSuper && (
                            <MenuItem className={classes.menuItem} onClick={() => navigate("/companies", "admin")}>
                                <BusinessIcon className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.companies")}
                            </MenuItem>
                        )}
                    </Menu>
                </>
            )}

            {/* Configurações */}
            {isAdmin && (
                <Button
                    className={classes.menuButton}
                    startIcon={<SettingsOutlinedIcon style={{ fontSize: 20 }} />}
                    endIcon={<ExpandMoreIcon style={{ fontSize: 16 }} />}
                    onClick={handleOpen("config")}
                >
                    {i18n.t("mainDrawer.listItems.settings")}
                </Button>
            )}
            {isAdmin && (
                <Menu
                    anchorEl={anchors["config"]}
                    open={Boolean(anchors["config"])}
                    onClose={handleClose("config")}
                    getContentAnchorEl={null}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    transformOrigin={{ vertical: "top", horizontal: "left" }}
                >
                    <MenuItem className={classes.menuItem} onClick={() => navigate("/settings", "config")}>
                        <SettingsOutlinedIcon className={classes.menuIcon} /> {i18n.t("mainDrawer.listItems.settings")}
                    </MenuItem>
                </Menu>
            )}
        </div>
    );
};

export default HorizontalMenu;
