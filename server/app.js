import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from "express-session";
import dotenv from 'dotenv';
import guideRouter from './Routes/GuideRoutes.js';
import reviewRouter from './Routes/ReviewRoutes.js';
import tourPhotosRouter from './Routes/TourPhotoRoutes.js';

dotenv.config();

const app = express();

const allowedOrigins = [
  'http://localhost:3000', // local dev
  'https://ceylontopguild.vercel.app' // REMOVED TRAILING SLASH
];

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Added OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 3600000 }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/guides', guideRouter);
app.use('/reviews', reviewRouter);
app.use("/tourPhotos", tourPhotosRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.log(err));

export default app; // For testing purposes