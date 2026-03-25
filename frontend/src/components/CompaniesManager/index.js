import React, { useState, useEffect, useContext } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Select,
  Typography,
  Box,
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ConfirmationModal from "../ConfirmationModal";

import { Edit as EditIcon, Business as BusinessIcon } from "@material-ui/icons";

import { toast } from "react-toastify";
import useCompanies from "../../hooks/useCompanies";
import usePlans from "../../hooks/usePlans";
import ModalUsers from "../ModalUsers";
import api from "../../services/api";
import { head, isArray, has } from "lodash";
import { useDate } from "../../hooks/useDate";
import ColorModeContext from "../../layout/themeContext";

import moment from "moment";
import { i18n } from "../../translate/i18n";
import { useTheme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    padding: theme.spacing(1),
  },
  mainPaper: {
    width: "100%",
    flex: 1,
    background: "transparent",
    overflowX: "hidden",
  },
  fullWidth: {
    width: "100%",
  },
  formCard: {
    background: theme.mode === "dark"
      ? "linear-gradient(145deg, rgba(48,48,68,0.6), rgba(36,36,53,0.8))"
      : "linear-gradient(145deg, #ffffff, #f8f9fa)",
    borderRadius: 5,
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    border: theme.mode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    boxShadow: theme.mode === "dark"
      ? "0 8px 24px rgba(0,0,0,0.4)"
      : "0 4px 20px rgba(0,0,0,0.08)",
  },
  formTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing(2),
    "& svg": {
      fontSize: 28,
      color: theme.mode === "dark" ? "#a8b5ff" : "#667eea",
    },
    "& h6": {
      fontWeight: 700,
      fontSize: "1.25rem",
      color: theme.mode === "dark" ? "#ffffff" : "transparent",
      background: theme.mode === "dark" ? "transparent" : "linear-gradient(135deg, #667eea, #764ba2)",
      WebkitBackgroundClip: theme.mode === "dark" ? "unset" : "text",
      WebkitTextFillColor: theme.mode === "dark" ? "#ffffff" : "transparent",
      textShadow: theme.mode === "dark" ? "0 2px 8px rgba(102,126,234,0.5)" : "none",
      letterSpacing: "0.5px",
    },
  },
  styledTextField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 5,
      background: theme.mode === "dark"
        ? "rgba(255,255,255,0.03)"
        : "rgba(255,255,255,0.8)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        background: theme.mode === "dark"
          ? "rgba(255,255,255,0.05)"
          : "rgba(255,255,255,1)",
        transform: "translateY(-1px)",
      },
      "&.Mui-focused": {
        background: theme.mode === "dark"
          ? "rgba(102,126,234,0.08)"
          : "rgba(102,126,234,0.04)",
        boxShadow: "0 0 0 3px rgba(102,126,234,0.1)",
      },
    },
    "& .MuiInputLabel-root": {
      color: theme.mode === "dark" ? "#b0b9ff" : "#667eea",
      fontWeight: 500,
    },
  },
  styledSelect: {
    borderRadius: 5,
    background: theme.mode === "dark"
      ? "rgba(255,255,255,0.03)"
      : "rgba(255,255,255,0.8)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      background: theme.mode === "dark"
        ? "rgba(255,255,255,0.05)"
        : "rgba(255,255,255,1)",
    },
    "&.Mui-focused": {
      background: theme.mode === "dark"
        ? "rgba(102,126,234,0.08)"
        : "rgba(102,126,234,0.04)",
    },
  },
  buttonGroup: {
    display: "flex",
    gap: theme.spacing(1),
    justifyContent: "flex-end",
    marginTop: theme.spacing(2),
  },
  actionButton: {
    borderRadius: 5,
    textTransform: "none",
    fontWeight: 600,
    padding: "8px 20px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.mode === "dark"
        ? "0 6px 16px rgba(102,126,234,0.4)"
        : "0 6px 16px rgba(102,126,234,0.3)",
    },
  },
  tableContainer: {
    background: theme.mode === "dark"
      ? "linear-gradient(145deg, rgba(48,48,68,0.4), rgba(36,36,53,0.6))"
      : "linear-gradient(145deg, #ffffff, #f8f9fa)",
    borderRadius: 5,
    border: theme.mode === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
    boxShadow: theme.mode === "dark"
      ? "0 8px 24px rgba(0,0,0,0.4)"
      : "0 4px 20px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  tableHeader: {
    background: theme.mode === "dark"
      ? "linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15))"
      : "linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08))",
    "& .MuiTableCell-head": {
      color: theme.mode === "dark" ? "#b0b9ff" : "#667eea",
      fontWeight: 700,
      fontSize: "0.875rem",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      padding: theme.spacing(2),
      borderBottom: theme.mode === "dark"
        ? "2px solid rgba(102,126,234,0.3)"
        : "2px solid rgba(102,126,234,0.2)",
    },
  },
  tableRow: {
    transition: "all 0.2s ease",
    "&:hover": {
      background: theme.mode === "dark"
        ? "rgba(102,126,234,0.08)"
        : "rgba(102,126,234,0.04)",
      transform: "scale(1.001)",
    },
    "&:nth-of-type(even)": {
      background: theme.mode === "dark"
        ? "rgba(255,255,255,0.02)"
        : "rgba(0,0,0,0.02)",
    },
  },
  tableCell: {
    padding: theme.spacing(1.5),
    borderBottom: theme.mode === "dark"
      ? "1px solid rgba(255,255,255,0.05)"
      : "1px solid rgba(0,0,0,0.05)",
  },
  editButton: {
    color: theme.mode === "dark" ? "#a8b5ff" : "#667eea",
    padding: 8,
    transition: "all 0.3s ease",
    "&:hover": {
      background: theme.mode === "dark"
        ? "rgba(102,126,234,0.15)"
        : "rgba(102,126,234,0.1)",
      transform: "rotate(15deg) scale(1.1)",
    },
  },
}));

export function CompanyForm(props) {
  const { onSubmit, onDelete, onCancel, initialValue, loading } = props;
  const classes = useStyles();
  const theme = useTheme();
  const isDark = theme.mode === "dark";
  const [plans, setPlans] = useState([]);
  const [modalUser, setModalUser] = useState(false);
  const [firstUser, setFirstUser] = useState({});

  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    // campaignsEnabled: false,
    dueDate: "",
    recurrence: "",
    password: "",
    generateInvoice: true,
    ...initialValue,
  });

  const { list: listPlans } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const list = await listPlans();
      setPlans(list);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setRecord((prev) => {
      if (moment(initialValue).isValid()) {
        initialValue.dueDate = moment(initialValue.dueDate).format(
          "YYYY-MM-DD"
        );
      }
      return {
        ...prev,
        ...initialValue,
      };
    });
  }, [initialValue]);

  const handleSubmit = async (data) => {
    if (data.dueDate === "" || moment(data.dueDate).isValid() === false) {
      data.dueDate = null;
    }
    console.log("Dados do formulário:", data);
    onSubmit(data);
    setRecord({ ...initialValue, dueDate: "", generateInvoice: true });
  };

  const handleOpenModalUsers = async () => {
    try {
      const { data } = await api.get("/users/list", {
        params: {
          companyId: initialValue.id,
        },
      });
      if (isArray(data) && data.length) {
        setFirstUser(head(data));
      }
      setModalUser(true);
    } catch (e) {
      toast.error(e);
    }
  };

  const handleCloseModalUsers = () => {
    setFirstUser({});
    setModalUser(false);
  };

  const incrementDueDate = () => {
    const data = { ...record };
    if (data.dueDate !== "" && data.dueDate !== null) {
      switch (data.recurrence) {
        case "MENSAL":
          data.dueDate = moment(data.dueDate)
            .add(1, "month")
            .format("YYYY-MM-DD");
          break;
        case "BIMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(2, "month")
            .format("YYYY-MM-DD");
          break;
        case "TRIMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(3, "month")
            .format("YYYY-MM-DD");
          break;
        case "SEMESTRAL":
          data.dueDate = moment(data.dueDate)
            .add(6, "month")
            .format("YYYY-MM-DD");
          break;
        case "ANUAL":
          data.dueDate = moment(data.dueDate)
            .add(12, "month")
            .format("YYYY-MM-DD");
          break;
        default:
          break;
      }
    }
    setRecord(data);
  };

  return (
    <>
      <ModalUsers
        userId={firstUser.id}
        companyId={initialValue.id}
        open={modalUser}
        onClose={handleCloseModalUsers}
      />

      <Box className={classes.formCard}>
        <Box className={classes.formTitle}>
          <BusinessIcon />
          <Typography variant="h6">
            {record.id ? "Editar Empresa" : "Cadastrar Nova Empresa"}
          </Typography>
        </Box>

        <Formik
          enableReinitialize
          className={classes.fullWidth}
          initialValues={record}
          onSubmit={(values, { resetForm }) =>
            setTimeout(() => {
              handleSubmit(values);
              resetForm();
            }, 500)
          }
        >
          {(values, setValues) => (
            <Form className={classes.fullWidth}>
              <Grid spacing={2} justifyContent="center" container>
                <Grid xs={12} sm={6} md={3} item>
                  <Field
                    as={TextField}
                    label={i18n.t("compaies.table.name")}
                    name="name"
                    variant="outlined"
                    className={`${classes.fullWidth} ${classes.styledTextField}`}
                    margin="dense"
                  />
                </Grid>
                <Grid xs={12} sm={6} md={2} item>
                  <Field
                    as={TextField}
                    label={i18n.t("compaies.table.email")}
                    name="email"
                    variant="outlined"
                    className={`${classes.fullWidth} ${classes.styledTextField}`}
                    margin="dense"
                    required
                  />
                </Grid>
                <Grid xs={12} sm={6} md={2} item>
                  <Field
                    as={TextField}
                    label={i18n.t("compaies.table.password")}
                    name="password"
                    type="password"
                    variant="outlined"
                    className={`${classes.fullWidth} ${classes.styledTextField}`}
                    margin="dense"
                  />
                </Grid>
                <Grid xs={12} sm={6} md={2} item>
                  <Field
                    as={TextField}
                    label={i18n.t("compaies.table.phone")}
                    name="phone"
                    variant="outlined"
                    className={`${classes.fullWidth} ${classes.styledTextField}`}
                    margin="dense"
                  />
                </Grid>
                <Grid xs={12} sm={6} md={2} item>
                  <FormControl margin="dense" variant="outlined" fullWidth className={classes.styledTextField}>
                    <InputLabel htmlFor="plan-selection">{i18n.t("compaies.table.plan")}</InputLabel>
                    <Field
                      as={Select}
                      id="plan-selection"
                      label={i18n.t("compaies.table.plan")}
                      labelId="plan-selection-label"
                      name="planId"
                      margin="dense"
                      required
                      className={classes.styledSelect}
                    >
                      {plans.map((plan, key) => (
                        <MenuItem key={key} value={plan.id}>
                          {plan.name}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
                <Grid xs={12} sm={6} md={1} item>
                  <FormControl margin="dense" variant="outlined" fullWidth className={classes.styledTextField}>
                    <InputLabel htmlFor="status-selection">{i18n.t("compaies.table.active")}</InputLabel>
                    <Field
                      as={Select}
                      id="status-selection"
                      label={i18n.t("compaies.table.active")}
                      labelId="status-selection-label"
                      name="status"
                      margin="dense"
                      className={classes.styledSelect}
                    >
                      <MenuItem value={true}>{i18n.t("compaies.table.yes")}</MenuItem>
                      <MenuItem value={false}>{i18n.t("compaies.table.no")}</MenuItem>
                    </Field>
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6} md={2} item>
                  <Field
                    as={TextField}
                    label={i18n.t("compaies.table.document")}
                    name="document"
                    variant="outlined"
                    className={`${classes.fullWidth} ${classes.styledTextField}`}
                    margin="dense"
                  />
                </Grid>

                <Grid xs={12} sm={6} md={2} item>
                  <FormControl variant="outlined" fullWidth className={classes.styledTextField}>
                    <Field
                      as={TextField}
                      label={i18n.t("compaies.table.dueDate")}
                      type="date"
                      name="dueDate"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      variant="outlined"
                      fullWidth
                      margin="dense"
                    />
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6} md={2} item>
                  <FormControl margin="dense" variant="outlined" fullWidth className={classes.styledTextField}>
                    <InputLabel htmlFor="recorrencia-selection">
                      {i18n.t("compaies.table.recurrence")}
                    </InputLabel>
                    <Field
                      as={Select}
                      label="Recorrência"
                      labelId="recorrencia-selection-label"
                      id="recurrence"
                      name="recurrence"
                      margin="dense"
                      className={classes.styledSelect}
                    >
                      <MenuItem value="MENSAL">{i18n.t("compaies.table.monthly")}</MenuItem>
                      <MenuItem value="BIMESTRAL">{i18n.t("compaies.table.bimonthly")}</MenuItem>
                      <MenuItem value="TRIMESTRAL">{i18n.t("compaies.table.quarterly")}</MenuItem>
                      <MenuItem value="SEMESTRAL">{i18n.t("compaies.table.semester")}</MenuItem>
                      <MenuItem value="ANUAL">{i18n.t("compaies.table.yearly")}</MenuItem>
                    </Field>
                  </FormControl>
                </Grid>

                <Grid xs={12} sm={6} md={2} item>
                  <FormControl margin="dense" variant="outlined" fullWidth className={classes.styledTextField}>
                    <InputLabel htmlFor="generate-invoice-selection">
                      Gerar Fatura
                    </InputLabel>
                    <Field
                      as={Select}
                      id="generate-invoice-selection"
                      label="Gerar Fatura"
                      labelId="generate-invoice-selection-label"
                      name="generateInvoice"
                      margin="dense"
                      className={classes.styledSelect}
                    >
                      <MenuItem value={true}>Sim</MenuItem>
                      <MenuItem value={false}>Não</MenuItem>
                    </Field>
                  </FormControl>
                </Grid>

                <Grid xs={12} item>
                  <Box className={classes.buttonGroup}>
                    <ButtonWithSpinner
                      className={classes.actionButton}
                      loading={loading}
                      onClick={() => onCancel()}
                      variant="contained"
                    >
                      {i18n.t("compaies.table.clear")}
                    </ButtonWithSpinner>

                    {record.id !== undefined && (
                      <>
                        <ButtonWithSpinner
                          className={classes.actionButton}
                          loading={loading}
                          onClick={() => onDelete(record)}
                          variant="contained"
                          color="secondary"
                          disabled={record.id === 1}
                        >
                          {i18n.t("compaies.table.delete")}
                        </ButtonWithSpinner>
                        <ButtonWithSpinner
                          className={classes.actionButton}
                          loading={loading}
                          onClick={() => incrementDueDate()}
                          variant="contained"
                          color="primary"
                        >
                          {i18n.t("compaies.table.dueDate")}
                        </ButtonWithSpinner>
                      </>
                    )}

                    <ButtonWithSpinner
                      className={classes.actionButton}
                      loading={loading}
                      type="submit"
                      variant="contained"
                      color="primary"
                    >
                      {i18n.t("compaies.table.save")}
                    </ButtonWithSpinner>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Box>
    </>
  );
}

export function CompaniesManagerGrid(props) {
  const { records, onSelect } = props;
  const classes = useStyles();
  const theme = useTheme();
  const isDark = theme.mode === "dark";
  const { dateToClient, datetimeToClient } = useDate();
  const { mode } = useContext(ColorModeContext);

  const renderStatus = (row) => {
    return row.status === false ? "Não" : "Sim";
  };

  const renderPlan = (row) => {
    return row.planId !== null ? row.plan.name : "-";
  };

  const renderPlanValue = (row) => {
    return row.planId !== null ? row.plan.amount ? row.plan.amount.toLocaleString('pt-br', { minimumFractionDigits: 2 }) : '00.00' : "-";
  };

  const rowStyle = (record) => {
    if (moment(record.dueDate).isValid()) {
      const now = moment();
      const dueDate = moment(record.dueDate);
      const diff = dueDate.diff(now, "days");
      if (diff >= 1 && diff <= 5) {
        return {
          backgroundColor: isDark ? "rgba(255, 193, 7, 0.15)" : "#fffde7"
        };
      }
      if (diff <= 0) {
        return {
          backgroundColor: isDark ? "rgba(244, 67, 54, 0.15)" : "#ffebee"
        };
      }
    }
    return {};
  };

  const cellStyle = (record) => {
    if (moment(record.dueDate).isValid()) {
      const now = moment();
      const dueDate = moment(record.dueDate);
      const diff = dueDate.diff(now, "days");
      if (diff >= 1 && diff <= 5) {
        return {
          color: isDark ? "#ffd54f" : "#f57f17",
          fontWeight: 600
        };
      }
      if (diff <= 0) {
        return {
          color: isDark ? "#ff8a80" : "#c62828",
          fontWeight: 600
        };
      }
    }
    return {};
  };

  const iconStyle = (record) => {
    if (moment(record.dueDate).isValid()) {
      const now = moment();
      const dueDate = moment(record.dueDate);
      const diff = dueDate.diff(now, "days");
      if (diff >= 1 && diff <= 5) {
        return { color: isDark ? "#ffd54f" : "#f57f17" };
      }
      if (diff <= 0) {
        return { color: isDark ? "#ff8a80" : "#c62828" };
      }
    }
    return {};
  };

  return (
    <Paper className={classes.tableContainer} elevation={0}>
      <Table
        className={classes.fullWidth}
        padding="normal"
        aria-label="companies table"
      >
        <TableHead className={classes.tableHeader}>
          <TableRow>
            <TableCell align="center" style={{ width: "1%" }}>#</TableCell>
            <TableCell align="left">{i18n.t("compaies.table.name")}</TableCell>
            <TableCell align="left">{i18n.t("compaies.table.email")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.phone")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.plan")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.value")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.active")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.createdAt")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.dueDate")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.lastLogin")}</TableCell>
            <TableCell align="center">{i18n.t("compaies.table.generateInvoice")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {records.map((row, key) => (
            <TableRow
              className={classes.tableRow}
              style={rowStyle(row)}
              key={key}
            >
              <TableCell className={classes.tableCell} style={{ ...cellStyle(row), width: "1%" }} align="center">
                <IconButton
                  className={classes.editButton}
                  style={iconStyle(row)}
                  onClick={() => onSelect(row)}
                  aria-label="edit"
                  size="small"
                >
                  <EditIcon style={iconStyle(row)} />
                </IconButton>
              </TableCell>
              <TableCell className={classes.tableCell} style={cellStyle(row)} align="left">{row.name || "-"}</TableCell>
              <TableCell className={classes.tableCell} style={cellStyle(row)} align="left">{row.email || "-"}</TableCell>
              <TableCell className={classes.tableCell} style={cellStyle(row)} align="center">{row.phone || "-"}</TableCell>
              <TableCell className={classes.tableCell} style={cellStyle(row)} align="center">{renderPlan(row)}</TableCell>
              <TableCell className={classes.tableCell} style={cellStyle(row)} align="center">{i18n.t("compaies.table.money")} {renderPlanValue(row)}</TableCell>
              <TableCell className={classes.tableCell} style={cellStyle(row)} align="center">{renderStatus(row)}</TableCell>
              <TableCell className={classes.tableCell} style={cellStyle(row)} align="center">{dateToClient(row.createdAt)}</TableCell>
              <TableCell className={classes.tableCell} style={cellStyle(row)} align="center">{dateToClient(row.dueDate)}<br /><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{row.recurrence}</span></TableCell>
              <TableCell className={classes.tableCell} style={cellStyle(row)} align="center">{datetimeToClient(row.lastLogin)}</TableCell>
              <TableCell className={classes.tableCell} style={cellStyle(row)} align="center">{row.generateInvoice ? i18n.t("compaies.table.yes") : i18n.t("compaies.table.no")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export default function CompaniesManager() {
  const classes = useStyles();
  const { list, save, update, remove } = useCompanies();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    // campaignsEnabled: false,
    dueDate: "",
    recurrence: "",
    password: "",
    document: "",
    paymentMethod: "",
    generateInvoice: true
  });

  useEffect(() => {
    loadPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const companyList = await list();
      console.log("Lista de empresas carregada:", companyList);
      setRecords(companyList);
    } catch (e) {
      toast.error("Não foi possível carregar a lista de registros");
    }
    setLoading(false);
  };

  const handleSubmit = async (data) => {
    console.log("Dados enviados para o backend:", data);
    setLoading(true);
    try {
      if (data.id !== undefined) {
        await update(data);
      } else {
        await save(data);
      }
      await loadPlans();
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error(
        "Não foi possível realizar a operação. Verifique se já existe uma empresa com o mesmo nome ou se os campos foram preenchidos corretamente"
      );
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      await loadPlans();
      handleCancel();
      toast.success("Operação realizada com sucesso!");
    } catch (e) {
      toast.error("Não foi possível realizar a operação");
    }
    setLoading(false);
  };

  const handleOpenDeleteDialog = () => {
    setShowConfirmDialog(true);
  };

  const handleCancel = () => {
    setRecord((prev) => ({
      ...prev,
      name: "",
      email: "",
      phone: "",
      planId: "",
      status: true,
      // campaignsEnabled: false,
      dueDate: "",
      recurrence: "",
      password: "",
      document: "",
      paymentMethod: "",
      generateInvoice: true
    }));
  };

  const handleSelect = (data) => {
    // let campaignsEnabled = false;

    // const setting = data.settings.find(
    //   (s) => s.key.indexOf("campaignsEnabled") > -1
    // );
    // if (setting) {
    //   campaignsEnabled = setting.value === "true" || setting.value === "enabled";
    // }

    console.log("Dados da empresa selecionada:", data);
    setRecord((prev) => ({
      ...prev,
      id: data.id,
      name: data.name || "",
      phone: data.phone || "",
      email: data.email || "",
      planId: data.planId || "",
      status: data.status === false ? false : true,
      // campaignsEnabled,
      dueDate: data.dueDate || "",
      recurrence: data.recurrence || "",
      password: "",
      document: data.document || "",
      paymentMethod: data.paymentMethod || "",
      generateInvoice: data.generateInvoice !== undefined ? data.generateInvoice : true,
    }));
  };

  return (
    <Paper className={classes.mainPaper} elevation={0}>
      <Grid spacing={3} container>
        <Grid xs={12} item>
          <CompanyForm
            initialValue={record}
            onDelete={handleOpenDeleteDialog}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </Grid>
        <Grid xs={12} item>
          <CompaniesManagerGrid records={records} onSelect={handleSelect} />
        </Grid>
      </Grid>
      <ConfirmationModal
        title="Exclusão de Registro"
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => handleDelete()}
      >
        Deseja realmente excluir esse registro?
      </ConfirmationModal>
    </Paper>
  );
}
