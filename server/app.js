import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from "express-session";
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
import guideRouter from './Routes/GuideRoutes.js';
import reviewRouter from './Routes/ReviewRoutes.js';
import tourPhotosRouter from './Routes/TourPhotoRoutes.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

// Configure CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://ceylontopguild.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['set-cookie']
}));

app.options('*', cors()); // Handle preflight requests

// Trust proxy for Render
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Enhanced session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  proxy: true, // Required for HTTPS behind proxy
  name: 'ctg.sid', // Unique session cookie name
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Debug middleware (remove in production)
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Cookies:', req.cookies);
  next();
});

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/guides', guideRouter);
app.use('/reviews', reviewRouter);
app.use("/tourPhotos", tourPhotosRouter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    session: req.sessionID,
    cookies: req.cookies
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

export default app;