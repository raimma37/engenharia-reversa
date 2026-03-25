import express from "express";
import * as PasswordResetController from "../controllers/PasswordResetController";

const passwordResetRoutes = express.Router();

passwordResetRoutes.post("/password-reset/request", PasswordResetController.requestPasswordReset);
passwordResetRoutes.post("/password-reset/validate", PasswordResetController.validateToken);
passwordResetRoutes.post("/password-reset/reset", PasswordResetController.resetPassword);

export default passwordResetRoutes;
