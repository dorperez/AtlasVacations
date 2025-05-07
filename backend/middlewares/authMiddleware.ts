import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import env from "dotenv"
import UserType from "../types/UserType"
env.config()

interface extendedRequest extends Request {
    user: UserType
}

const authMiddleware = (req: extendedRequest, res: Response, next: NextFunction) => {
    const token = req.header("x-auth-token")
    if (!token) {
        console.log("Tried with headers: ",token);
        return res.status(401).json({ msg: "You have no access to view this page" })
    }

    try {
        const decode = jwt.verify(token, process.env.MYSECRET || "")
        req.user = decode as UserType
        next()
    } catch (err: any) {
        return res.status(401).json({ msg: "Token is not valid", data: err.message })
    }
}

export default authMiddleware