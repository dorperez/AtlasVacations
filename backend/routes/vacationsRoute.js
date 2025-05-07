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
const dotenv_1 = __importDefault(require("dotenv"));
const authMiddleware_1 = __importDefault(require("../middlewares/authMiddleware"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const vacationsRoute = (app, db) => __awaiter(void 0, void 0, void 0, function* () {
    const uploadDir = path_1.default.join(__dirname, '..', 'uploads', 'vacations-images');
    if (!fs_1.default.existsSync(uploadDir)) {
        fs_1.default.mkdirSync(uploadDir, { recursive: true });
    }
    app.use('/vacations-images', express_1.default.static(path_1.default.join(__dirname, '..', 'uploads', 'vacations-images')));
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now();
            cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
        }
    });
    const upload = (0, multer_1.default)({ storage });
    app.get('/demo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield db.execute(`
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
    }));
    app.get("/vacations", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const query = "SELECT * FROM vacations";
            const [allVacations] = yield db.execute(query, []);
            res.status(200).json({ msg: "Got all vacations successfully ", data: allVacations });
        }
        catch (err) {
            res.status(500).json({ msg: "Internal error occur", data: err.message });
        }
    }));
    app.get("/vacation/:vacationID", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { vacationID } = req.params;
            const query = "SELECT * FROM vacations WHERE vacationID = ?";
            const [vacation] = yield db.execute(query, [vacationID]);
            res.status(200).json({ msg: "Got vacation with ID: " + vacationID + " successfully", data: vacation });
        }
        catch (err) {
            res.status(500).json({ msg: "Internal error occur", data: err.message });
        }
    }));
    app.get("/user/:userID/vacations", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userID } = req.params;
            const query = "SELECT * FROM followers WHERE userID = ?";
            const [allVacations] = yield db.execute(query, [userID]);
            res.status(200).json({ msg: "Got all users vacations by user ID successfully ", data: allVacations });
        }
        catch (err) {
            res.status(500).json({ msg: "Internal error occur", data: err.message });
        }
    }));
    app.get("/followers", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const query = "SELECT * FROM followers";
            const [response] = yield db.execute(query, []);
            res.status(200).json({ msg: "Got All followers successfully ", data: response });
        }
        catch (err) {
            res.status(500).json({ msg: "Internal error occurred", data: err.message });
        }
    }));
    app.post("/addToLikedVacations", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userID, vacationID } = req.body;
            const query = "INSERT INTO followers (userID, vacationID) VALUES (?,?)";
            const [response] = yield db.execute(query, [userID, vacationID]);
            res.status(200).json({ msg: "Vacation added to liked vacations successfully ", data: response });
        }
        catch (err) {
            res.status(500).json({ msg: "Internal error occur", data: err.message });
        }
    }));
    app.delete("/removeFromLikedVacations", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userID, vacationID } = req.body;
            const query = "DELETE FROM followers WHERE userID = ? AND vacationID = ?";
            const [response] = yield db.execute(query, [userID, vacationID]);
            if (response.affectedRows > 0) {
                res.status(200).json({ msg: "Vacation removed from liked vacations successfully", data: response });
            }
            else {
                res.status(404).json({ msg: "Vacation not found in liked list", data: {} });
            }
        }
        catch (err) {
            res.status(500).json({ msg: "Internal error occurred", data: err.message });
        }
    }));
    app.delete("/removeVacation/:vacationID", authMiddleware_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { vacationID } = req.params;
        const user = req.user;
        if (user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied: Admins only" });
        }
        try {
            const query = "DELETE FROM vacations WHERE vacationID = ?";
            const [response] = yield db.execute(query, [vacationID]);
            if (response.affectedRows > 0) {
                res.status(200).json({ msg: "Vacation removed successfully", data: response });
            }
            else {
                res.status(404).json({ msg: "Vacation not found", data: {} });
            }
        }
        catch (err) {
            res.status(500).json({ msg: "Internal error occurred", data: err.message });
        }
    }));
    app.patch("/edit/:vacationID", authMiddleware_1.default, upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { vacationID } = req.params;
        const { title, description, startDate, endDate, price } = req.body;
        const user = req.user;
        if (user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied: Admins only" });
        }
        try {
            // Check if vacation exists
            const [existingVacations] = yield db.execute("SELECT * FROM vacations WHERE vacationID = ?", [vacationID]);
            if (existingVacations.length === 0) {
                return res.status(404).json({ msg: "Vacation not found" });
            }
            const currentVacation = existingVacations[0];
            const newImageName = (_a = req.file) === null || _a === void 0 ? void 0 : _a.filename;
            const finalImageName = newImageName || currentVacation.imageName;
            // Delete old image if a new one was uploaded
            if (newImageName && currentVacation.imageName) {
                const oldImagePath = path_1.default.join(__dirname, "..", "uploads", "vacation-images", currentVacation.imageName);
                if (fs_1.default.existsSync(oldImagePath)) {
                    fs_1.default.unlinkSync(oldImagePath);
                }
            }
            // Update vacation in DB
            const updateQuery = `
                UPDATE vacations
                SET title = ?, description = ?, startDate = ?, endDate = ?, price = ?, imageName = ?
                WHERE vacationID = ?
            `;
            const formattedStartDate = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ');
            const formattedEndDate = new Date(endDate).toISOString().slice(0, 19).replace('T', ' ');
            yield db.execute(updateQuery, [
                title,
                description,
                formattedStartDate,
                formattedEndDate,
                price,
                finalImageName,
                vacationID,
            ]);
            res.status(200).json({ msg: "Vacation updated successfully", vacationID });
        }
        catch (err) {
            console.error("Error updating vacation:", err);
            res.status(500).json({ msg: "Internal server error", error: err.message });
        }
    }));
    app.post('/uploadImage', authMiddleware_1.default, upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const user = req.user;
        if (user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied: Admins only" });
        }
        try {
            res.status(200).json({
                msg: 'File uploaded successfully!',
                imageName: req.file.filename,
            });
        }
        catch (err) {
            console.error('Error uploading file:', err);
            res.status(500).json({ msg: "Internal server error", error: err.message });
        }
    }));
    app.post('/vacation/add', authMiddleware_1.default, upload.single('image'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const user = req.user;
        if (user.role !== "admin") {
            return res.status(403).json({ msg: "Access denied: Admins only" });
        }
        const { title, description, startDate, endDate, price } = req.body;
        if (!title || !description || !startDate || !endDate || !price) {
            return res.status(400).json({ msg: "Missing vacation fields." });
        }
        try {
            const newVacation = {
                title,
                description,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                price: Number(price),
                imageName: req.file.filename
            };
            const query = "INSERT INTO vacations (title, description, startDate, endDate, price, imageName) VALUES (?,?,?,?,?,?)";
            const [response] = yield db.execute(query, [newVacation.title, newVacation.description, newVacation.startDate, newVacation.endDate, newVacation.price, newVacation.imageName]);
            if (response.affectedRows > 0) {
                res.status(201).json({ msg: "Vacation added successfully", data: response });
            }
            else {
                res.status(404).json({ msg: "Vacation not added ...", data: {} });
            }
        }
        catch (err) {
            console.error('Error adding vacation:', err);
            res.status(500).json({ msg: "Internal server error", error: err.message });
        }
    }));
});
exports.default = vacationsRoute;
