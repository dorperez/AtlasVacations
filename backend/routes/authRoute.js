"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getAllUsers_1 = __importDefault(require("../functions/getAllUsers"));
const authRoute = (app, db) => __awaiter(void 0, void 0, void 0, function* () {
    app.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Checks if user exist
            const allUsersQuery = "SELECT * from users";
            const [response] = yield db.execute(allUsersQuery, []);
            //console.log(response);
            res.status(200).json({ msg: "Got all users successfully", data: response });
        }
        catch (err) {
            res.status(500).json({ msg: "Internal error occur..", data: err });
        }
    }));
    app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { name, lastName, email, password } = req.body;
            if (!name || !lastName || !email || !password) {
                return res.status(400).json({ msg: "Please enter valid fields" });
            }
            const respo = yield (0, getAllUsers_1.default)();
            const allUsers = respo.data;
            //console.log(allUsers);
            const isUserExist = allUsers.find((user) => user.email === email);
            if (isUserExist) {
                return res.status(400).json({ msg: "User already exist with this email" });
            }
            const query = "INSERT INTO users (name, lastName, email, password) VALUES(?,?,?,?)";
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const [response] = yield db.execute(query, [name, lastName, email, hashedPassword]);
            res.status(200).json({ msg: "User registered successfully", data: response });
        }
        catch (err) {
            res.status(500).json({ msg: "Internal error occur", data: err.message });
        }
    }));
    app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ msg: "Please enter valid fields" });
            }
            const respo = yield (0, getAllUsers_1.default)();
            const allUsers = respo.data;
            //console.log(allUsers);
            const user = allUsers.find((user) => user.email === email);
            if (!user) {
                return res.status(400).json({ msg: "User not exist" });
            }
            //console.log(`${password} , ${user.password}`);
            const isMatch = yield bcrypt_1.default.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: "Incorrect Password" });
            }
            const token = jsonwebtoken_1.default.sign({ email, name: user.name, role: user.role }, process.env.MYSECRET || "", { expiresIn: "1h" });
            res.status(200).json({ msg: "User logged in successfully", data: token });
        }
        catch (err) {
            res.status(500).json({ msg: "Internal error occur", data: err.message });
        }
    }));
    app.get('/userdemo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield db.execute(`
            INSERT INTO users (name, lastName, email, password, role) VALUES
            ('Dor', 'Perez', 'mr.dorperez@gmail.com', 'dorperez', 'admin')
        `);
        res.status(200).json({ msg: "User added successfully" });
    }));
    app.get('/user/:userEmail', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { userEmail } = req.params;
        //console.log("User by email route: ", userEmail);
        try {
            const allUsersQuery = "SELECT * from users WHERE email = ?";
            const [response] = yield db.execute(allUsersQuery, [userEmail]);
            //console.log(response);
            res.status(200).json({ msg: "Got user by email successfully", data: response });
        }
        catch (err) {
            res.status(500).json({ msg: "Internal error occur..", data: err });
        }
    }));
    app.post('/verifyToken', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ msg: "No token provided" });
        }
        try {
            jsonwebtoken_1.default.verify(token, process.env.MYSECRET || ""); // Will throw an error if the token is expired
            res.status(200).json({ msg: "Token is valid", data: "valid" });
        }
        catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ msg: "Token expired", data: 'jwt expired' });
            }
            else {
                console.error("Error verifying token:", err);
                return res.status(500).json({ msg: "Internal server error", data: err });
            }
        }
    }));
    //set user admin
    app.get('/setAdmin/:email', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        // get current user
        const { email } = req.params;
        if (!email) {
            return res.status(400).json({ msg: "Please enter valid fields" });
        }
        const respo = yield (0, getAllUsers_1.default)();
        const allUsers = respo.data;
        //console.log(allUsers);
        const user = allUsers.find((user) => user.email === email);
        if (!user) {
            return res.status(400).json({ msg: "User is not exist" });
        }
        try {
            const query = "UPDATE users SET role = 'admin' WHERE email = ?";
            const [response] = yield db.execute(query, [email]);
            res.status(200).json({ msg: "User set as admin successfully", data: response });
        }
        catch (err) {
            res.status(500).json({ msg: "Internal error occur", data: err.message });
        }
    }));
});
exports.default = authRoute;
