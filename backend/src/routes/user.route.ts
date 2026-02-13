import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getProfile, updateProfile } from "../controllers/user.controllers.js";

export const userRouter = Router();

userRouter.put("/", authMiddleware, updateProfile);
userRouter.get("/profile", authMiddleware, getProfile);
