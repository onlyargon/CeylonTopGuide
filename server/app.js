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

app.use(cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
}));

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 3600000 }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use('/guides', guideRouter);
app.use('/reviews', reviewRouter);
app.use("/tourPhotos", tourPhotosRouter);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(process.env.PORT || 5000, () => {
        console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
})
.catch((err) => console.log(err));
