const express = require("express");
const authRouter = express.Router();
const authController = require("../Controllers/auth.controllers");

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/refresh-token", authController.refreshToken);
authRouter.post("/logout", authController.logout);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.post("/request-otp", authController.requestOtp);
authRouter.post("/verify-otp", authController.verifyOtp);

module.exports = { authRouter };
