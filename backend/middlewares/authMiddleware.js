"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authMiddleware = (req, res, next) => {
    const token = req.header("x-auth-token");
    if (!token) {
        console.log("Tried with headers: ", token);
        return res.status(401).json({ msg: "You have no access to view this page" });
    }
    try {
        const decode = jsonwebtoken_1.default.verify(token, process.env.MYSECRET || "");
        req.user = decode;
        next();
    }
    catch (err) {
        return res.status(401).json({ msg: "Token is not valid", data: err.message });
    }
};
exports.default = authMiddleware;
