import React, {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

import { AuthContext } from "../../context/Auth/AuthContext";
import { ReportProblem, VisibilityOutlined } from "@mui/icons-material";
// import { SocketContext } from "../../context/Socket/SocketContext";
import { toast } from "react-toastify";
import { yellow } from "@mui/material/colors";
import {
  Avatar,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
  Card,
  makeStyles,
  Container,
  Badge,
  Grid,
  Tooltip,
  useTheme,
} from "@material-ui/core";
import { format, isSameDay, parseISO } from "date-fns";
import { grey } from "@material-ui/core/colors";
import { getBackendUrl } from "../../config";

const backendUrl = getBackendUrl();

const useStyles = makeStyles((theme) => ({
  main: {
    display: "flex",
    justifyContent: "space-between",

  },
  container: {
    display: "flex",
    flexWrap: "wrap",
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
  cardHeader: {
    width: "380px",
    height: "78px",
    padding: 10,
    backgroundColor: theme.mode === "light" ? "#4CD03F" : "#2d7a26",
    transition: "background-color 0.3s ease",
  },
  cardHeaderPending: {
    width: "380px",
    height: "78px",
    padding: 10,
    backgroundColor: theme.mode === "light" ? "#5C25E8" : "#3d1a9b",
    transition: "background-color 0.3s ease",
  },
  card: {
    height: "300px",
    width: "auto",
    margin: "3px",
    borderRadius: 0,
    flex: 1,
    maxHeight: "100%",
    overflowY: "auto",
    ...theme.scrollbarStyles,
    borderTop: theme.mode === "light" ? "2px solid rgba(0, 0, 0, 0.12)" : "2px solid rgba(255, 255, 255, 0.12)",
    backgroundColor: theme.mode === "light" ? "#fff" : theme.palette.background.paper,
    transition: "all 0.3s ease",
  },
  changeWarap: {
    width: "auto",
    padding: 0,
    margin: 0,
  },
  pending: {
    color: yellow[600],
    fontSize: "20px",
  },
  connectionTag: {
    background: theme.mode === "light" ? "#2e7d32" : "#4caf50",
    color: "#FFF",
    marginRight: 1,
    padding: 1,
    fontWeight: "bold",
    // paddingLeft: 5,
    // paddingRight: 5,
    borderRadius: 3,
    fontSize: "0.6em",
    transition: "background-color 0.3s ease",
    // whiteSpace: "nowrap"
  },
  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    // top: -30,
    marginRight: "1px",
    color: theme.mode === "light" ? grey[400] : grey[600],
  },

  lastMessageTimeUnread: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    // top: -30,
    color: theme.mode === "light" ? "#2e7d32" : "#4caf50",
    fontWeight: "bold",
    marginRight: "1px",
    transition: "color 0.3s ease",
  },
  pending: {
    color: yellow[600],
    fontSize: "20px",
  },
}));

const DashboardManage = () => {
  const classes = useStyles();
  const theme = useTheme();
  const history = useHistory();
  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);

  const [tickets, setTickets] = useState([]);
  const [update, setUpdate] = useState(false);
  const [ticketNot, setTicketNot] = useState(0);
  const companyId = user.companyId;

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/usersMoments");
        console.log(data);
        setTickets(data);
        setUpdate(!update);
      } catch (err) {
        if (err.response?.status !== 500) {
          toastError(err);
        } else {
          toast.error(`${i18n.t("frontEndErrors.getUsers")}`);
        }
      }
    })();
  }, []);

  useEffect(() => {
    const companyId = user.companyId;
    console.log("socket painel");
    // const socket = socketManager.GetSocket();

    // const onConnect = () => {
    //   socket.emit("joinChatBox", `${ticketId}`);
    // }
    const onAppMessage = (data) => {
      if (
        data.action === "create" ||
        data.action === "update" ||
        data.action === "delete"
      ) {
        (async () => {
          try {
            const { data } = await api.get("/usersMoments");
            setTickets(data);
            setUpdate(!update);
          } catch (err) {
            if (err.response?.status !== 500) {
              toastError(err);
            } else {
              toast.error(`${i18n.t("frontEndErrors.getUsers")}`);
            }
          }
        })();
      }
    };

    // socket.on("connect", onConnect);
    socket.on(`company-${companyId}-ticket`, onAppMessage);
    socket.on(`company-${companyId}-appMessage`, onAppMessage);

    return () => {
      // socket.off("connect", onConnect);
      socket.off(`company-${companyId}-ticket`, onAppMessage);
      socket.off(`company-${companyId}-appMessage`, onAppMessage);
    };
  }, [socket]);

  const Moments = useMemo(() => {
    // console.log(tickets)
    if (tickets && tickets.length > 0) {
      const ticketsByUser = tickets.reduce((userTickets, ticket) => {
        const user = ticket.user;

        if (user) {
          const userIndex = userTickets.findIndex(
            (group) => group.user.id === user.id
          );
          if (userIndex === -1) {
            userTickets.push({
              user,
              userTickets: [ticket],
            });
          } else {
            userTickets[userIndex].userTickets.push(ticket);
          }
        }
        return userTickets;
      }, []);

      return ticketsByUser.map((group, index) => (
        <Grid item key={index}>
          <div padding={20} className={classes.main} key={index}>
            <div className={classes.changeWarap}>

              <Paper elevation={3} className={classes.cardHeader}>
                <CardHeader
                  style={{ maxWidth: "380px", width: "100%" }}
                  avatar={
                    <Avatar
                      alt={`${group.user.profileImage}`}
                      src={
                        group.user.profileImage
                          ? `${backendUrl}/public/company${companyId}/user/${group.user.profileImage}`
                          : null
                      }
                    />
                  }
                  title={
                    <span>
                      {group?.user?.name || `${i18n.t("momentsUser.pending")}`}{" "}
                      <br />
                      {`${i18n.t("momentsUser.services")} ${group.userTickets?.length
                        }`}
                    </span>
                  }
                />
              </Paper>

              <Paper square elevation={1} className={classes.card}>

                {group.userTickets.map((ticket) => (
                  <List style={{ paddingTop: 0 }} key={ticket.id}>
                    <ListItem dense button>
                      <ListItemAvatar>
                        <Avatar
                          alt={`${ticket.contact.urlPicture}`}
                          src={`${ticket.contact.urlPicture}`}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        disableTypography
                        primary={
                          ticket?.contact?.name?.length > 30
                            ? ticket?.contact?.name.substring(0, 25) + "..."
                            : ticket?.contact?.name
                        }
                        secondary={
                          <Fragment>
                            <div>
                              <Typography
                                style={{ display: "inline" }}
                                component="span"
                                variant="body2"
                              >
                                {`${ticket.lastMessage?.length > 30
                                  ? String(ticket.lastMessage).substring(
                                    0,
                                    27
                                  ) + "..."
                                  : ticket.lastMessage
                                  }`}
                              </Typography>
                            </div>
                            <Badge className={classes.connectionTag}>
                              {ticket?.whatsapp?.name}
                            </Badge>
                            <Badge
                              style={{
                                backgroundColor:
                                  ticket.queue?.color || "#7c7c7c",
                              }}
                              className={classes.connectionTag}
                            >
                              {ticket.queue?.name.toUpperCase() ||
                                `${i18n.t("momentsUser.noqueue")}`}
                            </Badge>
                          </Fragment>
                        }
                      />
                      <Typography
                        className={
                          Number(ticket.unreadMessages) > 0
                            ? classes.lastMessageTimeUnread
                            : classes.lastMessageTime
                        }
                        component="span"
                        variant="body2"
                      >
                        {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                          <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                        ) : (
                          <>
                            {format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}
                          </>
                        )}
                      </Typography>
                      {(user.profile === "admin" ||
                        ticket.userId === user.id) && (
                          <Tooltip title="Acessar Ticket">
                            <VisibilityOutlined
                              onClick={() =>
                                history.push(`/tickets/${ticket.uuid}`)
                              }
                              fontSize="small"
                              style={{
                                color: theme.mode === "light" ? grey[500] : grey[400],
                                cursor: "pointer",
                                marginRight: 5,
                                bottom: "-15px",
                              }}
                            />
                          </Tooltip>
                        )}
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </List>
                ))}
              </Paper>
            </div>
          </div>
        </Grid>
      ));
    } else {
      return null;
    }
  }, [update, theme]);

  const MomentsPending = useMemo(() => {
    if (tickets && tickets.length > 0) {
      const pendingTickets = tickets.filter((ticket) => !ticket.user);

      return (
        <Grid item>
          <div className={classes.main}>
            <div padding={2} className={classes.changeWarap}>

              <Paper square elevation={1} className={classes.card}>
                <Paper elevation={3} className={classes.cardHeaderPending}>
                  <CardHeader
                    style={{ maxWidth: "380px", width: "100%" }}
                    avatar={<Avatar />}
                    title={
                      <span>
                        {`${i18n.t("momentsUser.pending")}`}
                        <ReportProblem className={classes.pending} />
                        <div>
                          {i18n.t("momentsUser.services")}{" "}
                          {pendingTickets?.length}
                        </div>
                      </span>
                    }
                  />
                </Paper>
                {pendingTickets.map((ticket) => (
                  <List style={{ paddingTop: 0 }} key={ticket.id}>
                    <ListItem dense button>
                      <ListItemAvatar>
                        <Avatar
                          alt={`${ticket.contact.urlPicture}`}
                          src={`${ticket.contact.urlPicture}`}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        disableTypography
                        primary={ticket?.contact?.name}
                        secondary={
                          <Fragment>
                            <div>
                              <Typography
                                style={{ display: "inline" }}
                                component="span"
                                variant="body2"
                              >
                                {`${ticket.lastMessage?.length > 30
                                  ? String(ticket.lastMessage).substring(
                                    0,
                                    27
                                  ) + "..."
                                  : ticket.lastMessage
                                  }`}
                              </Typography>
                            </div>
                            <Badge className={classes.connectionTag}>
                              {ticket?.whatsapp?.name}
                            </Badge>
                            <Badge
                              style={{
                                backgroundColor:
                                  ticket.queue?.color || "#7c7c7c",
                              }}
                              className={classes.connectionTag}
                            >
                              {ticket.queue?.name.toUpperCase() ||
                                `${i18n.t("momentsUser.noqueue")}`}
                            </Badge>
                          </Fragment>
                        }
                      />
                      <Typography
                        className={
                          Number(ticket.unreadMessages) > 0
                            ? classes.lastMessageTimeUnread
                            : classes.lastMessageTime
                        }
                        component="span"
                        variant="body2"
                      >
                        {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                          <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
                        ) : (
                          <>
                            {format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}
                          </>
                        )}
                      </Typography>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </List>
                ))}
              </Paper>
            </div>
          </div>
        </Grid>
      );
    } else {
      return null;
    }
  }, [update, theme]);

  return (
    <Fragment>
      <Grid container spacing={2}>
        {Moments}
        {MomentsPending}
      </Grid>
    </Fragment>
  );
};

export default DashboardManage;
