import { Request, Response } from "express"
import mysql from "mysql2/promise"
import env from "dotenv"
import authMiddleware from "../middlewares/authMiddleware"
import UserType from "../types/UserType"
import multer from "multer"
import fs from "fs"
import express from "express"
import path from "path"
import dateToString from "../functions/utils/dateToString"
import { start } from "repl"
import VacationType from "../types/VacationType"


env.config()

const vacationsRoute = async (app: any, db: mysql.Connection) => {

    const uploadDir = path.join(__dirname, '..', 'uploads', 'vacations-images')

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
    }

    app.use('/vacations-images', express.static(path.join(__dirname, '..', 'uploads', 'vacations-images')))

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir)
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now()
            cb(null, uniqueSuffix + path.extname(file.originalname))
        }
    })
    const upload = multer({ storage })


    app.get('/demo', async (req: Request, res: Response) => {
        await db.execute(`
            INSERT INTO vacations (title, description, startDate, endDate, price, imageName) VALUES
            ('Trip to Paris', 'Explore the romantic city of Paris with iconic landmarks like the Eiffel Tower.', '2025-07-01 08:00:00', '2025-07-07 20:00:00', '1200', 'paris.jpg'),
            ('Beach in Maldives', 'Relax on the pristine beaches of the Maldives with crystal-clear waters.', '2025-08-05 10:00:00', '2025-08-12 18:00:00', '2500', 'maldives.jpg'),
            ('Safari in Kenya', 'Experience the thrill of a safari in Kenya, spotting wildlife in their natural habitat.', '2025-09-10 06:00:00', '2025-09-20 22:00:00', '1800', 'kenya.jpg'),
            ('New York City Tour', 'Discover the vibrant culture, food, and sights of New York City.', '2025-06-15 09:00:00', '2025-06-22 21:00:00', '1500', 'newyork.jpg'),
            ('Tokyo Adventure', 'Immerse yourself in the bustling city of Tokyo, blending tradition and modernity.', '2025-10-03 07:00:00', '2025-10-10 19:00:00', '1700', 'tokyo.jpg'),
            ('Rome Historical Tour', 'Walk through the ancient ruins and historic sites of Rome.', '2025-05-20 08:30:00', '2025-05-27 19:30:00', '1100', 'rome.jpg'),
            ('Dubai Luxury Trip', 'Indulge in the luxury of Dubai, with shopping, beaches, and skyscrapers.', '2025-11-11 12:00:00', '2025-11-18 23:59:00', '3000', 'dubai.jpg'),
            ('Sydney Beach Vacation', 'Enjoy a relaxing beach vacation in Sydney, with great views and activities.', '2025-12-01 07:00:00', '2025-12-10 22:00:00', '2200', 'sydney.jpg'),
            ('Canada Rockies Tour', 'Explore the stunning landscapes of the Canadian Rockies.', '2025-04-10 06:00:00', '2025-04-17 21:00:00', '1600', 'canada.jpg'),
            ('Bali Retreat', 'Experience peace and serenity in Bali, with lush landscapes and tranquil beaches.', '2025-03-15 09:00:00', '2025-03-22 20:30:00', '1400', 'bali.jpg'),
            ('Thailand Island Hopping', 'Go island hopping around Thailand’s beautiful and secluded islands.', '2025-02-10 10:00:00', '2025-02-17 18:00:00', '1300', 'thailand.jpg'),
            ('Switzerland Ski Trip', 'Hit the slopes in the Swiss Alps for an exciting ski adventure.', '2025-01-05 08:00:00', '2025-01-12 22:00:00', '2000', 'switzerland.jpg')
        `);
        res.json({ message: 'Demo Data created' });
    });

    app.get("/vacations", authMiddleware, async (req: Request, res: Response) => {
        try {
            const query = "SELECT * FROM vacations"
            const [allVacations] = await db.execute(query, [])
            res.status(200).json({ msg: "Got all vacations successfully ", data: allVacations })
        } catch (err: any) {
            res.status(500).json({ msg: "Internal error occur", data: err.message })
        }
    })

    app.get("/vacation/:vacationID", authMiddleware, async (req: Request, res: Response) => {
        try {
            const { vacationID } = req.params
            const query = "SELECT * FROM vacations WHERE vacationID = ?"
            const [vacation] = await db.execute(query, [vacationID])
            res.status(200).json({ msg: "Got vacation with ID: " + vacationID + " successfully", data: vacation })
        } catch (err: any) {
            res.status(500).json({ msg: "Internal error occur", data: err.message })
        }
    })

    app.get("/user/:userID/vacations", authMiddleware, async (req: Request, res: Response) => {
        try {
            const { userID } = req.params
            const query = "SELECT * FROM followers WHERE userID = ?"
            const [allVacations] = await db.execute(query, [userID])
            res.status(200).json({ msg: "Got all users vacations by user ID successfully ", data: allVacations })
        } catch (err: any) {
            res.status(500).json({ msg: "Internal error occur", data: err.message })
        }
    })

    app.get("/followers", authMiddleware, async (req: Request, res: Response) => {
        try {
            const query = "SELECT * FROM followers"
            const [response] = await db.execute(query, []) as [mysql.ResultSetHeader, any]
            res.status(200).json({ msg: "Got All followers successfully ", data: response })
        } catch (err: any) {
            res.status(500).json({ msg: "Internal error occurred", data: err.message })
        }
    })

    app.post("/addToLikedVacations", authMiddleware, async (req: Request, res: Response) => {
        try {
            const { userID, vacationID } = req.body
            const query = "INSERT INTO followers (userID, vacationID) VALUES (?,?)"
            const [response] = await db.execute(query, [userID, vacationID])
            res.status(200).json({ msg: "Vacation added to liked vacations successfully ", data: response })
        } catch (err: any) {
            res.status(500).json({ msg: "Internal error occur", data: err.message })
        }
    })

    app.delete("/removeFromLikedVacations", authMiddleware, async (req: Request, res: Response) => {
        try {
            const { userID, vacationID } = req.body
            const query = "DELETE FROM followers WHERE userID = ? AND vacationID = ?"
            const [response] = await db.execute(query, [userID, vacationID]) as [mysql.ResultSetHeader, any]
            if (response.affectedRows > 0) {
                res.status(200).json({ msg: "Vacation removed from liked vacations successfully", data: response })
            } else {
                res.status(404).json({ msg: "Vacation not found in liked list", data: {} })
            }
        } catch (err: any) {
            res.status(500).json({ msg: "Internal error occurred", data: err.message })
        }
    })

    app.delete("/removeVacation/:vacationID", authMiddleware, async (req: Request, res: Response) => {
        const { vacationID } = req.params
        const user = (req as any).user as UserType

        if (user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied: Admins only" })
        }

        try {
            const query = "DELETE FROM vacations WHERE vacationID = ?"
            const [response] = await db.execute(query, [vacationID]) as [mysql.ResultSetHeader, any]

            if (response.affectedRows > 0) {
                res.status(200).json({ msg: "Vacation removed successfully", data: response })
            } else {
                res.status(404).json({ msg: "Vacation not found", data: {} })
            }
        } catch (err: any) {
            res.status(500).json({ msg: "Internal error occurred", data: err.message })
        }
    })

    app.patch("/edit/:vacationID", authMiddleware, upload.single("image"), async (req: Request, res: Response) => {
        const { vacationID } = req.params
        const { title, description, startDate, endDate, price } = req.body
        const user = (req as any).user as UserType

        if (user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied: Admins only" })
        }

        try {
            // Check if vacation exists
            const [existingVacations] = await db.execute(
                "SELECT * FROM vacations WHERE vacationID = ?",
                [vacationID]
            ) as any[]

            if (existingVacations.length === 0) {
                return res.status(404).json({ msg: "Vacation not found" })
            }

            const currentVacation = existingVacations[0]
            const newImageName = req.file?.filename
            const finalImageName = newImageName || currentVacation.imageName

            // Delete old image if a new one was uploaded
            if (newImageName && currentVacation.imageName) {
                const oldImagePath = path.join(__dirname, "..", "uploads", "vacation-images", currentVacation.imageName)
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath)
                }
            }

            // Update vacation in DB
            const updateQuery = `
                UPDATE vacations
                SET title = ?, description = ?, startDate = ?, endDate = ?, price = ?, imageName = ?
                WHERE vacationID = ?
            `

            const formattedStartDate = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ')
            const formattedEndDate = new Date(endDate).toISOString().slice(0, 19).replace('T', ' ')

            await db.execute(updateQuery, [
                title,
                description,
                formattedStartDate,
                formattedEndDate,
                price,
                finalImageName,
                vacationID,
            ])

            res.status(200).json({ msg: "Vacation updated successfully", vacationID })
        } catch (err: any) {
            console.error("Error updating vacation:", err)
            res.status(500).json({ msg: "Internal server error", error: err.message })
        }
    })

    app.post('/uploadImage', authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' })
        }

        const user = (req as any).user as UserType

        if (user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied: Admins only" })
        }

        try {
            res.status(200).json({
                msg: 'File uploaded successfully!',
                imageName: req.file.filename,
            })
        } catch (err: any) {
            console.error('Error uploading file:', err)
            res.status(500).json({ msg: "Internal server error", error: err.message })
        }
    })


    app.post('/vacation/add', authMiddleware, upload.single('image'), async (req: Request, res: Response) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' })
        }

        const user = (req as any).user as UserType

        if (user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied: Admins only" })
        }

        const { title, description, startDate, endDate, price } = req.body

        if (!title || !description || !startDate || !endDate || !price) {
            return res.status(400).json({ msg: "Missing vacation fields." })
        }

        try {
            const newVacation = {
                title,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                price: Number(price),
                imageName: req.file.filename
            }

            const query = "INSERT INTO vacations (title, description, startDate, endDate, price, imageName) VALUES (?,?,?,?,?,?)"
            const [response] = await db.execute(query, [newVacation.title, newVacation.description, newVacation.startDate, newVacation.endDate, newVacation.price, newVacation.imageName]) as [mysql.ResultSetHeader, any]
            if (response.affectedRows > 0) {
                res.status(201).json({ msg: "Vacation added successfully", data: response })
            } else {
                res.status(404).json({ msg: "Vacation not added ...", data: {} })
            }
        } catch (err: any) {
            console.error('Error adding vacation:', err)
            res.status(500).json({ msg: "Internal server error", error: err.message })
        }
    })

}

export default vacationsRoute