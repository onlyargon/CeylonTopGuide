import express from 'express';
import TouristLocation from '../Models/TouristLocation.js';
import Guide from '../Models/GuideModel.js'

const router = express.Router();

// Get all locations
router.get('/', async (req, res) => {
  try {
    const locations = await TouristLocation.find();
    res.json(locations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/locations/:id
router.get('/:id', async (req, res) => {
    try {
      const location = await TouristLocation.findById(req.params.id);
      if (!location) return res.status(404).json({ message: "Location not found" });
  
      const guides = await Guide.find({
        'professionalDetails.tourRegions': location.region
      });
  
      res.json({ location, guides });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// Add a new location
router.post('/', async (req, res) => {
  const location = new TouristLocation({
    name: req.body.name,
    description: req.body.description,
    coordinates: req.body.coordinates,
    image: req.body.image,
    region: req.body.region
  });

  try {
    const newLocation = await location.save();
    res.status(201).json(newLocation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
