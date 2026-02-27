import type { Request, Response } from "express";
import { client } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendMail } from "../config/mail.js";
import { generateOtp } from "../utils/otp.js";

const OTP_EXPIRY_MINUTES = 10;
const FORGET_PASSWORD_TOKEN_EXPIRY_MINUTES = 15;
const FORGET_PASSWORD_MAX_ATTEMPTS = 5;
const FORGET_PASSWORD_RESEND_COOLDOWN_SECONDS = 60;

async function signupController(req: Request, res: Response) {

    try {

        const { email, password, retypePassword } = req.body;

        const userObj = await client.user.findFirst({
            where: {
                email: email
            }
        });

        if (userObj) {
            throw new Error("User Already Exist");
        }

        if (password !== retypePassword) {
            throw new Error("Passwords do not match");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await client.user.create({
            data: {
                email: email,
                password: passwordHash
            }
        });

        return res.status(201)
            .json({
                message: "User created successfully",
                user: {
                    id: newUser.id,
                    email: newUser.email
                }
            });

    } catch (error: any) {

        return res.status(500)
            .json({
                error: {
                    message: error.message || "Error from Signup Controller"
                }
            });
    }

}

async function signinController(req: Request, res: Response) {

    try {

        console.log("signin controller hit");

        const { email, password } = req.body;

        const userObj = await client.user.findFirst({
            where: {
                email: email
            }
        });

        if (!userObj) {
            throw new Error("User Not Exist");
        }

        const isPasswordValid = await bcrypt.compare(password, userObj.password!);

        if (!isPasswordValid) {
            throw new Error("Invalid Password");
        }

        const token = generateToken({ id: userObj.id, email: userObj.email });

        return res.status(201)
            .json({
                message: "User Signed in successfully",
                user: {
                    id: userObj.id,
                    email: userObj.email
                },
                token: token
            });

    } catch (error: any) {

        return res.status(500)
            .json({
                error: {
                    message: error.message || "Error from User Signin Controller"
                }
            });
    }
}

function generateToken(data: any): string {

    const token = jwt.sign(
        data,
        process.env.JWT_SECRET!
    );

    return token;
}

async function sendOtpController(req: Request, res: Response) {

    try {

        const { email } = req.body;

        const userObj = await client.user.findFirst({
            where: {
                email: email
            }
        });

        if (!userObj) {
            throw new Error("User Not Exist");
        }

        const otp = generateOtp();

        const mailSent = await sendMail(email, "Password Reset Otp", `Password Reset OTP : ${otp}`);

        if (!mailSent) {
            throw new Error("Error sending mail");
        }

        await client.user.update({
            where: {
                email: email
            },
            data: {
                otp: otp,
                otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * (1000 * 60)),
                // forgetPasswordAttempt : userObj.forgetPasswordAttempt + 1
            }
        });

        return res.status(200)
            .json({
                success: true,
                otp: otp,
                message: "OTP sent to your email successfully"
            });

    } catch (error) {

        return res.status(500)
            .json({
                error: {
                    message: (error as any).message || "Error from Forget Password Controller"
                }
            });
    }
}

async function verifyOtpController(req: Request, res: Response) {

    try {

        const { email, otp } = req.body;

        const userObj = await client.user.findFirst({
            where: {
                email: email
            }
        });

        if (!userObj) {
            throw new Error("User Not Exist");
        }

        if (userObj.otpExpiresAt! < new Date()) {
            throw new Error("OTP Expired");
        }

        if (userObj.otp !== otp) {
            throw new Error("Invalid OTP");
        }

        const resetToken = crypto.randomUUID();

        await client.user.update({
            where: {
                email: email
            },
            data: {
                otp: null,
                otpExpiresAt: null,
                forgetPasswordToken: resetToken,
                forgetPasswordTokenExpiresAt: new Date(Date.now() + FORGET_PASSWORD_TOKEN_EXPIRY_MINUTES * (1000 * 60)),
            }
        });

        return res.status(200)
            .json({
                message: "OTP verified successfully",
                resetToken: resetToken,
                success: true,
            });

    } catch (error) {

        return res.status(500)
            .json({
                error: {
                    message: (error as any).message || "Error from Verify Otp Controller"
                }
            });
    }

}

async function forgetPasswordController(req: Request, res: Response) {

    try {

        const { email, resetToken, newPassword, confirmPassword } = req.body;

        const userObj = await client.user.findFirst({
            where: {
                email: email
            }
        });

        if (!userObj) {
            throw new Error("User Not Exist");
        }

        if (!userObj.forgetPasswordToken || !userObj.forgetPasswordTokenExpiresAt) {
            throw new Error("No Reset Token Found. Please request a new one.");
        }

        if (userObj.forgetPasswordToken !== resetToken) {
            throw new Error("Invalid Reset Token");
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        await client.user.update({
            where: {
                email: email
            },
            data: {
                password: passwordHash,
                forgetPasswordToken: null,
                forgetPasswordTokenExpiresAt: null,
            }
        });

        return res.status(200)
            .json({
                message: "Password reset successfully",
                success: true
            });
    }
    catch (error) {

        return res.status(500)
            .json({
                error: {
                    message: (error as any).message || "Error from Forget Password Controller"
                }
            });

    }

}

async function googleAuthController(req: Request, res: Response) {
    try {

        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({ error: { message: "Missing idToken" } });
        }

        const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
        const payload = await response.json();

        if (!response.ok || payload.error) {
            return res.status(401).json({ error: { message: "Invalid Google token" } });
        }

        const { email, email_verified } = payload;

        if (!email_verified) {
            return res.status(403).json({ error: { message: "Email not verified" } });
        }

        let user = await client.user.findFirst({ where: { email } });

        if (!user) {
            user = await client.user.create({
                data: { email, password: null }
            });
        }

        const token = generateToken({ id: user.id, email: user.email });

        return res.status(200).json({
            message: "Google authentication successful",
            token,
            user: { id: user.id, email: user.email }
        });
    } catch (error) {
        console.error("Google auth error:", error);
        return res.status(500).json({ error: { message: "Google authentication failed" } });
    }
}

export { signupController, signinController, sendOtpController, verifyOtpController, forgetPasswordController, googleAuthController };
