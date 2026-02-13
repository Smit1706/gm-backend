import { Router } from "express";
import { forgetPasswordController, sendOtpController, signinController, signupController, verifyOtpController, googleAuthController } from "../controllers/auth.controllers.js";

export const authRouter = Router();

authRouter.post("/signup", signupController);

authRouter.post("/signin", signinController);

authRouter.post("/google/callback", googleAuthController);

authRouter.get("/logout", (req, res) => {
  // Handle fetching user profile
  res.send("User profile endpoint");
});

authRouter.post("/send-otp", sendOtpController);

authRouter.post("/verify-otp", verifyOtpController);

authRouter.post("/forget-password", forgetPasswordController);




