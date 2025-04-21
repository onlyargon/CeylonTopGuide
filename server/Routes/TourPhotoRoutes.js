import express from 'express';
import multer from 'multer';
import TourPhoto from '../Models/TourPhotos.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Multer memory storage (no need for disk storage since we're uploading to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post("/upload", upload.single("photo"), async (req, res) => {
  try {
    // Verify file exists
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Verify guideId exists (now comes from form data)
    if (!req.body.guideId) {
      return res.status(400).json({ error: "Guide ID is required" });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "tour_photos",
          resource_type: "auto"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      // Pipe the file buffer to Cloudinary
      uploadStream.end(req.file.buffer);
    });

    // Save to database
    const newPhoto = new TourPhoto({
      guideId: req.body.guideId,
      imagePath: result.secure_url,
      cloudinaryId: result.public_id
    });

    await newPhoto.save();
    res.status(201).json(newPhoto);

  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ 
      error: "Upload failed",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get all photos by guide - unchanged
router.get("/guide/:guideId", async (req, res) => {
  try {
    const photos = await TourPhoto.find({ guideId: req.params.guideId })
      .sort({ createdAt: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ 
      error: "Failed to fetch photos",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Delete photo endpoint - matches frontend
router.delete('/:photoId', async (req, res) => {
  try {
    const photo = await TourPhoto.findById(req.params.photoId);
    if (!photo) return res.status(404).json({ message: 'Photo not found' });

    // Delete from Cloudinary first
    if (photo.cloudinaryId) {
      await cloudinary.uploader.destroy(photo.cloudinaryId);
    }

    // Then delete from database
    await TourPhoto.findByIdAndDelete(req.params.photoId);

    res.json({ message: 'Photo deleted successfully' });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ 
      error: "Delete failed",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router;