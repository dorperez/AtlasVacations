import express from "express"
import { Request, Response } from "express"
import env from "dotenv"
env.config()
import cors from "cors"
import bodyParser from "body-parser"
import mysql from "mysql2/promise"
import authRoute from "./routes/authRoute"
import vacationsRoute from "./routes/vacationsRoute"

const app = express()
app.use(cors())
app.use(bodyParser.json())
const PORT = 3000

const isDocker = process.env.IS_DOCKER === 'true';

const dbConfig = {
    host: isDocker ? 'db' : 'localhost',
    port: isDocker ? 3306 : 3206,
    user: 'myuser',
    password: 'mypassword',
    database: 'vacationsDatabase'
}

let db: mysql.Connection

const connectDB = async () => {
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
        try {
            db = await mysql.createConnection(dbConfig);
            console.log('Connected to MySQL database');
            startTables();
            break; 
        } catch (err) {
            console.error('Error connecting to MySQL:', err);
            attempts++;
            console.log(`Retrying connection (${attempts}/${maxAttempts})...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    if (attempts === maxAttempts) {
        console.error('Max connection attempts reached. Exiting...');
        process.exit(1);
    }
};

const startTables = async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                userID INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                lastName VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL DEFAULT 'user'
            )
        `);

        await db.execute(`
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
        await db.execute(`
            CREATE TABLE IF NOT EXISTS followers (
                followRowID INT AUTO_INCREMENT PRIMARY KEY,
                userID INT NOT NULL,
                vacationID INT NOT NULL,
                FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
                FOREIGN KEY (vacationID) REFERENCES vacations(vacationID) ON DELETE CASCADE
            )
        `);

        await authRoute(app, db)
        await vacationsRoute(app, db)

        console.log('Tables are ready');
    } catch (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
};

connectDB();

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ msg: "Server is up and running!" })
})

app.listen(PORT, () => {
    console.log("Server is up and running on http://localhost:" + process.env.PORT);
})



