import { Router } from "express";
import { authMiddleware } from "../../core/middleware/auth.js";
import { authController } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", authController.register);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/login", authController.login);
authRouter.get("/me", authMiddleware, authController.getMe);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.post("/resend-verification", authController.resendVerification);
authRouter.post("/google", authController.googleLogin);
authRouter.post(
  "/change-password",
  authMiddleware,
  authController.changePassword,
);
authRouter.delete("/account", authMiddleware, authController.deleteAccount);
