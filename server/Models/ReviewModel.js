// Models/ReviewModel.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  guideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guide',
    required: true
  },
  guideName: {
    type: String,
    required: true
  },
  reviewerEmail: {
    type: String,
    required: true
  },
  reviewText: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  verified: { type: Boolean, default: false },
  verificationToken: String
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
