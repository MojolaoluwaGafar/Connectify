import type { Request, Response } from "express";

import * as authService from "./auth.service.js";

export const authController = {
  register: async (req: Request, res: Response) => {
    const user = await authService.registerUser(req.body);

    res.status(201).json({
      message: "User registered successfully",
      data: user,
      requestId: req.requestId,
    });
  },

  verifyEmail: async (request: Request, response: Response) => {
    const user = await authService.verifyUserEmail(request.body);

    response.status(200).json({
      message: "Email verified successfully",
      data: user,
      requestId: request.requestId,
    });
  },

  login: async (request: Request, response: Response) => {
    const result = await authService.loginUser(request.body);

    response.status(200).json({
      message: "Login successful",
      data: result,
      requestId: request.requestId,
    });
  },

  getMe: async (request: Request, response: Response) => {
    const user = await authService.getCurrentUser(request.user);

    response.status(200).json({
      message: "User retrieved successfully",
      data: user,
      requestId: request.requestId,
    });
  },

  forgotPassword: async (request: Request, response: Response) => {
    const result = await authService.forgotPassword(request.body);

    response.status(200).json({
      message: result.message,
      requestId: request.requestId,
    });
  },

  resetPassword: async (request: Request, response: Response) => {
    const result = await authService.resetPassword(request.body);

    response.status(200).json({
      message: result.message,
      requestId: request.requestId,
    });
  },

  resendVerification: async (request: Request, response: Response) => {
    const result = await authService.resendVerificationCode(request.body);

    response.status(200).json({
      message: result.message,
      requestId: request.requestId,
    });
  },

  changePassword: async (request: Request, response: Response) => {
    const result = await authService.changePassword(
      request.user,
      request.body,
    );

    response.status(200).json({
      message: result.message,
      requestId: request.requestId,
    });
  },

  deleteAccount: async (request: Request, response: Response) => {
    const result = await authService.deleteAccount(request.user);

    response.status(200).json({
      message: result.message,
      requestId: request.requestId,
    });
  },

  googleLogin: async (request: Request, response: Response) =>{
      const result = await authService.googleLogin(request.body);
      response.status(200).json({
      message: "Login successful",
      data: result,
    
    });
  }
};
