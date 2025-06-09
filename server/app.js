import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from "express-session";
import MongoStore from 'connect-mongo'; // Correct import
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import guideRouter from './Routes/GuideRoutes.js';
import reviewRouter from './Routes/ReviewRoutes.js';
import tourPhotosRouter from './Routes/TourPhotoRoutes.js';
import locationRouter from'./Routes/TouristLocationRoutes.js'

dotenv.config();

const app = express();

// Configure CORS
const allowedOrigins = [
    'http://localhost:3000',
    'https://ceylontopguild.vercel.app'
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['set-cookie']
}));

app.options('*', cors());

// Trust proxy for Render
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session configuration with proper MongoStore initialization
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    proxy: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain: process.env.NODE_ENV === 'production' ? 'topguide.onrender.com' : undefined,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Debug middleware
app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    next();
});

app.use((req, res, next) => {
    res.on('finish', () => {
        console.log('SET-COOKIE HEADERS:', res.getHeader('Set-Cookie'));
    });
    next();
});

guideRouter.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;

        const guide = await Guide.findOne({ "contact.email": email });

        if (!guide) {
            return res.status(401).json({ error: "Invalid email" });
        }

        const isMatch = await bcrypt.compare(password, guide.account.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        if (!guide.account.isVerified) {
            return res.status(403).json({ error: "Your account is awaiting approval." });
        }

        req.session.guide = {
            id: guide._id,
            fullName: guide.fullName,
            email: guide.email,
            isVerified: guide.account.isVerified
        }

        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Session error' });
            }

            // Manually set cookie header if needed
            const cookie = req.session.cookie;
            res.setHeader('Set-Cookie', [
                `ctg.sid=${req.sessionID}; ` +
                `Path=/; ` +
                `HttpOnly; ` +
                `Secure; ` +
                `SameSite=None; ` +
                `Domain=topguide.onrender.com; ` +
                `Max-Age=${cookie.maxAge}`
            ]);

            res.json({ message: 'Logged in' });
        });

        res.cookie("sessionID", req.sessionID, { httpOnly: true, secure: false });

        console.log('New session:', req.sessionID);
        console.log('Set-Cookie header:', req.headers['set-cookie']);

        res.status(200).json({ message: "Login Successful!", guide: req.session.guide });
    } catch (error) {
        console.log("Login error:", error);
        res.status(500).json({ error: "Login failed." });
    }
})


// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/guides', guideRouter);
app.use('/reviews', reviewRouter);
app.use("/tourPhotos", tourPhotosRouter);
app.use('/locations', locationRouter);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        session: req.sessionID,
        sessionStore: req.sessionStore.name
    });
});

// MongoDB connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }
        
        await mongoose.connect(mongoURI);
        console.log("Connected to MongoDB");

        const port = process.env.PORT || 5000;
        app.listen(port, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
        });
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};

connectDB();

export default app;