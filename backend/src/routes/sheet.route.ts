import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { deleteSheets, deleteEntries, uploadImageController, bulkUploadImagesController } from "../controllers/sheet.controllers.js";
import { upload } from "../config/multer.js";

export const sheetRouter = Router();

// Upload single image for a sheet
sheetRouter.post("/uploadImage", authMiddleware, upload.single("image"), uploadImageController);

// Upload multiple images for multiple sheets
sheetRouter.post("/uploadImages", authMiddleware, upload.array("images", 50), bulkUploadImagesController);

sheetRouter.post("/sheets", authMiddleware, deleteSheets);
sheetRouter.post("/entries", authMiddleware, deleteEntries);

