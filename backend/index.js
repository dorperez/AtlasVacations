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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const promise_1 = __importDefault(require("mysql2/promise"));
const authRoute_1 = __importDefault(require("./routes/authRoute"));
const vacationsRoute_1 = __importDefault(require("./routes/vacationsRoute"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const PORT = 3000;
const isDocker = process.env.IS_DOCKER === 'true';
const dbConfig = {
    host: isDocker ? 'db' : 'localhost',
    port: isDocker ? 3306 : 3206,
    user: 'myuser',
    password: 'mypassword',
    database: 'vacationsDatabase'
};
let db;
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
        try {
            db = yield promise_1.default.createConnection(dbConfig);
            console.log('Connected to MySQL database');
            startTables();
            break;
        }
        catch (err) {
            console.error('Error connecting to MySQL:', err);
            attempts++;
            console.log(`Retrying connection (${attempts}/${maxAttempts})...`);
            yield new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    if (attempts === maxAttempts) {
        console.error('Max connection attempts reached. Exiting...');
        process.exit(1);
    }
});
const startTables = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                userID INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                lastName VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL DEFAULT 'user'
            )
        `);
        yield db.execute(`
            CREATE TABLE IF NOT EXISTS vacations (
                vacationID INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description VARCHAR(255) NOT NULL,
                startDate DATETIME NOT NULL,
                endDate DATETIME NOT NULL,
                price VARCHAR(255) NOT NULL,
                imageName VARCHAR(255) NOT NULL
            )
        `);
        yield db.execute(`
            CREATE TABLE IF NOT EXISTS followers (
                followRowID INT AUTO_INCREMENT PRIMARY KEY,
                userID INT NOT NULL,
                vacationID INT NOT NULL,
                FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
                FOREIGN KEY (vacationID) REFERENCES vacations(vacationID) ON DELETE CASCADE
            )
        `);
        yield (0, authRoute_1.default)(app, db);
        yield (0, vacationsRoute_1.default)(app, db);
        console.log('Tables are ready');
    }
    catch (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
});
connectDB();
app.get("/", (req, res) => {
    res.status(200).json({ msg: "Server is up and running!" });
});
app.listen(PORT, () => {
    console.log("Server is up and running on http://localhost:" + process.env.PORT);
});
