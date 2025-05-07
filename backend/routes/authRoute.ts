import { Request, Response } from "express"
import mysql from "mysql2/promise"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import env from "dotenv"
env.config()
import UserType from "../types/UserType"
import getAllUsers from "../functions/getAllUsers"

const authRoute = async (app: any, db: mysql.Connection) => {

    app.get("/users", async (req: Request, res: Response) => {
        try {
            // Checks if user exist
            const allUsersQuery = "SELECT * from users"
            const [response] = await db.execute(allUsersQuery, [])
            //console.log(response);
            res.status(200).json({ msg: "Got all users successfully", data: response })
        } catch (err: any) {
            res.status(500).json({ msg: "Internal error occur..", data: err })
        }
    })

    app.post('/register', async (req: Request, res: Response) => {
        try {
            const { name, lastName, email, password } = req.body

            if (!name || !lastName || !email || !password) {
                return res.status(400).json({ msg: "Please enter valid fields" })
            }

            const respo = await getAllUsers()
            const allUsers: UserType[] = respo.data
            //console.log(allUsers);

            const isUserExist = allUsers.find((user: UserType) => user.email === email)
            if (isUserExist) {
                return res.status(400).json({ msg: "User already exist with this email" })
            }
            const query = "INSERT INTO users (name, lastName, email, password) VALUES(?,?,?,?)"
            const hashedPassword = await bcrypt.hash(password, 10)
            const [response] = await db.execute(query, [name, lastName, email, hashedPassword])
            res.status(200).json({ msg: "User registered successfully", data: response })
        } catch (err: any) {
            res.status(500).json({ msg: "Internal error occur", data: err.message })
        }
    })

    app.post('/login', async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body

            if (!email || !password) {
                return res.status(400).json({ msg: "Please enter valid fields" })
            }

            const respo = await getAllUsers()
            const allUsers: UserType[] = respo.data
            //console.log(allUsers);

            const user = allUsers.find((user: UserType) => user.email === email)
            if (!user) {
                return res.status(400).json({ msg: "User not exist" })
            }

            //console.log(`${password} , ${user.password}`);

            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) {
                return res.status(400).json({ msg: "Incorrect Password" })
            }

            const token = jwt.sign({ email, name: user.name, role: user.role }, process.env.MYSECRET || "MYSECRET", { expiresIn: "1h" })

            res.status(200).json({ msg: "User logged in successfully", data: token })
        } catch (err: any) {
            res.status(500).json({ msg: "Internal error occur", data: err.message })
        }
    })

    app.get('/userdemo', async (req: Request, res: Response) => {
        await db.execute(`
            INSERT INTO users (name, lastName, email, password, role) VALUES
            ('Dor', 'Perez', 'mr.dorperez@gmail.com', 'dorperez', 'admin')
        `);
        res.status(200).json({ msg: "User added successfully" })
    });

    app.get('/user/:userEmail', async (req: Request, res: Response) => {

        const { userEmail } = req.params
        //console.log("User by email route: ", userEmail);

        try {
            const allUsersQuery = "SELECT * from users WHERE email = ?"
            const [response] = await db.execute(allUsersQuery, [userEmail])
            //console.log(response);
            res.status(200).json({ msg: "Got user by email successfully", data: response })
        } catch (err: any) {
            res.status(500).json({ msg: "Internal error occur..", data: err })
        }
    });

    app.post('/verifyToken', async (req: Request, res: Response) => {
        const { token } = req.body

        if (!token) {
            return res.status(400).json({ msg: "No token provided" });
        }

        try {
            jwt.verify(token, process.env.MYSECRET || "MYSECRET"); // Will throw an error if the token is expired
            res.status(200).json({ msg: "Token is valid", data: "valid" });
        } catch (err: any) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ msg: "Token expired", data: 'jwt expired' });
            } else {
                console.error("Error verifying token:", err);
                return res.status(500).json({ msg: "Internal server error", data: err });
            }
        }
    });

    //set user admin
    app.get('/setAdmin/:email', async (req: Request, res: Response) => {
        // get current user

        const { email } = req.params
        
        if (!email) {
            return res.status(400).json({ msg: "Please enter valid fields" })
        }

        const respo = await getAllUsers()
        const allUsers: UserType[] = respo.data
        //console.log(allUsers);
        const user = allUsers.find((user: UserType) => user.email === email)
        if (!user) {
            return res.status(400).json({ msg: "User is not exist" })
        }

        try {
            const query = "UPDATE users SET role = 'admin' WHERE email = ?"
            const [response] = await db.execute(query, [email])
            res.status(200).json({ msg: "User set as admin successfully", data: response })
        } catch (err: any) {
            res.status(500).json({ msg: "Internal error occur", data: err.message })
        }
    })


}

export default authRoute