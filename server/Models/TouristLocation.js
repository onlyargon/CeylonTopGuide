import mongoose from 'mongoose';

const touristLocationSchema = new mongoose.Schema({
  name: String,
  description: String,
  coordinates: {
    lat: Number,
    lng: Number,
  },
  image: String,
  region: String // e.g., "Central Province", "Kandy", etc.
});

export default mongoose.model('TouristLocation', touristLocationSchema);