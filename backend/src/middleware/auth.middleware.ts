import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

async function authMiddleware(req: Request, res: Response, next: NextFunction) {

    try {

        const authHeader = req.headers["authorization"];

        if (!authHeader) {
            throw new Error("No Token Provided");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new Error("No Token Provided");
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);

        if (!decodedToken) {
            throw new Error("Invalid Token");
        }

        req.user = decodedToken as { id: string, email: string };

        next();

    } catch (error: any) {

        return res.status(401).json({
            error: {
                message: error.message || "Unauthorized Access"
            }
        });

    }



}

export { authMiddleware };