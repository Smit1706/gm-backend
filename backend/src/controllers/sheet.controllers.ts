import type { Request, Response } from "express";
import { client } from "../config/db.js";

async function uploadImageController(req: Request, res: Response) {
    try {
        const { sheetId } = req.body;
        const file = req.file;

        if (!sheetId) {
            return res.status(400).json({ error: { message: "sheetId required" } });
        }

        if (!file) {
            return res.status(400).json({ error: { message: "Image file required" } });
        }

        // Check if sheet exists
        const sheet = await client.sheets.findUnique({
            where: { sheetId },
        });

        if (!sheet) {
            return res.status(404).json({ error: { message: "Sheet not found" } });
        }

        // Build the remote URL path
        const remoteUrl = `/uploads/${file.filename}`;

        // Update sheet with the image URL
        await client.sheets.update({
            where: { sheetId },
            data: { image: remoteUrl },
        });

        return res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            remoteUrl: remoteUrl
        });
    } catch (error) {
        console.error("Upload image error:", error);
        return res.status(500).json({
            error: { message: "Failed to upload image" }
        });
    }
}

async function bulkUploadImagesController(req: Request, res: Response) {
    try {
        const files = req.files as Express.Multer.File[];
        const { sheetIds } = req.body;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: { message: "Image files required" } });
        }

        if (!sheetIds) {
            return res.status(400).json({ error: { message: "sheetIds required" } });
        }

        const sheetIdArray = Array.isArray(sheetIds) ? sheetIds : [sheetIds];

        if (files.length !== sheetIdArray.length) {
            return res.status(400).json({ error: { message: "Number of files must match number of sheetIds" } });
        }

        const results = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const sheetId = sheetIdArray[i];

            const sheet = await client.sheets.findUnique({
                where: { sheetId },
            });

            if (!sheet) {
                results.push({ sheetId, success: false, error: "Sheet not found" });
                continue;
            }

            const remoteUrl = `/uploads/${file!.filename}`;

            await client.sheets.update({
                where: { sheetId },
                data: { image: remoteUrl },
            });

            results.push({ sheetId, success: true, remoteUrl });
        }

        return res.status(200).json({
            success: true,
            message: "Bulk image upload completed",
            results
        });
    } catch (error) {
        console.error("Bulk upload images error:", error);
        return res.status(500).json({
            error: { message: "Failed to upload images" }
        });
    }
}

async function deleteSheets(req: Request, res: Response) {
    try {
        const { sheetIds } = req.body;

        if (!Array.isArray(sheetIds) || sheetIds.length === 0) {
            return res.status(400).json({ error: { message: "sheetIds array required" } });
        }

        await client.sheetEntries.deleteMany({
            where: { sheetId: { in: sheetIds } }
        });

        await client.sheets.deleteMany({
            where: { sheetId: { in: sheetIds } }
        });

        return res.status(200).json({
            success: true,
            message: "Sheets deleted successfully"
        });

    } catch (error) {
        console.error("Delete sheets error:", error);
        return res.status(500).json({
            error: { message: "Failed to delete sheets" }
        });
    }
}

async function deleteEntries(req: Request, res: Response) {
    try {
        const { entryIds } = req.body;

        if (!Array.isArray(entryIds) || entryIds.length === 0) {
            return res.status(400).json({ error: { message: "entryIds array required" } });
        }

        await client.sheetEntries.deleteMany({
            where: { entryId: { in: entryIds } }
        });

        return res.status(200).json({
            success: true,
            message: "Entries deleted successfully"
        });
    } catch (error) {
        console.error("Delete entries error:", error);
        return res.status(500).json({
            error: { message: "Failed to delete entries" }
        });
    }
}

export { deleteSheets, deleteEntries, uploadImageController, bulkUploadImagesController };
