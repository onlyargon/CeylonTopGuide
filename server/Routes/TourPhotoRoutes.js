import express from 'express';
import upload from '../middleware/upload.js'; // Use existing multer config
import TourPhoto from '../Models/TourPhotos.js';

const router = express.Router();

// Upload photo
router.post("/upload", upload.single("photo"), async (req, res) => {
    try {
      const { guideId, caption } = req.body;
  
      if (!guideId) {
        return res.status(400).json({ error: "Guide ID is required." });
      }
  
      const newPhoto = new TourPhoto({
        guideId,
        imagePath: req.file.filename,
        caption: caption || "",
      });
  
      await newPhoto.save();
      res.status(201).json(newPhoto);
    } catch (err) {
      res.status(500).json({ error: "Failed to upload photo." });
    }
  });

// Get all photos by guide
router.get("/guide/:guideId", async (req, res) => {
  try {
    const photos = await TourPhoto.find({ guideId: req.params.guideId }).sort({ uploadedAt: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch photos." });
  }
});

// Optional: Delete a photo
router.delete("/:photoId", async (req, res) => {
  try {
    await TourPhoto.findByIdAndDelete(req.params.photoId);
    res.json({ message: "Photo deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

router.delete('/:photoId', async (req, res) => {
    try {
      const photo = await TourPhoto.findById(req.params.photoId);
      if (!photo) return res.status(404).json({ message: 'Photo not found' });
  
      // Remove file from uploads folder
      const filePath = path.join('uploads', photo.photoPath);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Failed to delete file:', err);
      });
  
      // Remove from DB
      await TourPhoto.findByIdAndDelete(req.params.photoId);
  
      res.json({ message: 'Photo deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

export default router;
