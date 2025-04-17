import mongoose from "mongoose";

const tourPhotoSchema = new mongoose.Schema({
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guide",
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    default: "",
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const TourPhoto = mongoose.model("TourPhoto", tourPhotoSchema);
export default TourPhoto;
