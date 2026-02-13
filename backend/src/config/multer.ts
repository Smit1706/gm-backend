// uploadConfig.ts
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import type { Request } from "express";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store uploads in project root /uploads folder
// __dirname in dist/src/config, so go up to dist/src, then dist, then backend root
const uploadPath = path.join(__dirname, "..", "..", "..", "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_, __, callback) => {
        callback(null, uploadPath);
    },
    filename: (_, file, callback) => {
        const ext = path.extname(file.originalname);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        callback(null, uniqueName);
    }
});

const fileFilter = (_: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
        return callback(new Error("Invalid file type. Only images allowed."));
    }
    callback(null, true);
};

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
});
