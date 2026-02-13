import type { Request, Response } from "express";
import { client } from "../config/db.js";

async function getProfile(req: Request, res: Response) {

    try {

        const userData = await client.user.findFirst({
            where: {
                id: req.user!.id
            }
        });

        return res.status(200).json({
            user: {
                id: userData!.id,
                email: userData!.email
            },
            success: true
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Error from Get Profile"
        });
    }

}

async function updateProfile(req: Request, res: Response) {
    const { businessName, ownerName, gstNumber, city, state, pinCode, mobileNo, country } = req.body;
    const userId = req.user?.id;


    try {
        const updatedUser = await client.user.update({
            where: { id: userId! },
            data: {
                companyName: businessName,
                gstNumber,
                city,
                state,
                pinCode,
                mobileNumber: mobileNo,
                country,
            },
        });

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            error: "Failed to update profile",
            success: false
        });
    }
}

export { getProfile, updateProfile };