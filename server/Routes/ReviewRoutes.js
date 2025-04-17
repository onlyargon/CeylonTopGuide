// routes/ReviewRoutes.js
import express from 'express';
import Review from '../Models/ReviewModel.js';
import Guide from '../Models/GuideModel.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const router = express.Router();

// Submit a review (with email verification)
router.post('/', async (req, res) => {
  try {
    const { guideId, reviewerEmail, reviewText, rating } = req.body;
    const guide = await Guide.findById(guideId);
    if (!guide) return res.status(404).json({ error: 'Guide not found' });

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');

    const newReview = new Review({
      guideId,
      guideName: guide.fullName,
      reviewerEmail,
      reviewText,
      rating,
      verificationToken: token,
      verified: false
    });

    await newReview.save();

    // Setup email transporter (you can switch to SendGrid/Mailgun in prod)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'heshaltempdissanayake@gmail.com',
        pass: 'qxts aaww ymia hzfc' // Use App Password (Google security)
      }
    });

    const verificationUrl = `http://localhost:5000/reviews/verify/${token}`;

    await transporter.sendMail({
      from: '"Mail" <heshaltempdissanayake@gmail.com>',
      to: reviewerEmail,
      subject: 'Verify your review',
      html: `
        <p>Thanks for submitting a review! Please click the link below to verify it:</p>
        <a href="${verificationUrl}">Verify your review</a>
      `
    });

    res.status(200).json({ message: 'Verification email sent. Please confirm your review from your inbox.' });

  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

router.get('/verify/:token', async (req, res) => {
  try {
    const review = await Review.findOne({ verificationToken: req.params.token });

    if (!review) {
      return res.status(400).send('Invalid or expired verification token.');
    }

    review.verified = true;
    review.verificationToken = undefined;
    await review.save();

    // Recalculate average rating only using verified reviews
    await recalculateAverageRating(review.guideId);

    res.send('Your review has been verified and published!');
  } catch (err) {
    console.error('Error verifying review:', err);
    res.status(500).send('Failed to verify review.');
  }
});

// Get all reviews for a guide
router.get('/guide/:guideId', async (req, res) => {
  try {
    const reviews = await Review.find({ guideId: req.params.guideId }).sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});


// Update a review
router.put('/:reviewId', async (req, res) => {
  try {
    const { reviewText, rating } = req.body;
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    review.reviewText = reviewText;
    review.rating = rating;
    await review.save();

    // Recalculate average rating
    await recalculateAverageRating(review.guideId);

    res.status(200).json({ message: 'Review updated successfully', review });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete a review
router.delete('/:reviewId', async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const guideId = review.guideId;

    // Use deleteOne on the document instance
    await review.deleteOne();

    await recalculateAverageRating(guideId);

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});


const recalculateAverageRating = async (guideId) => {
  const reviews = await Review.find({ guideId, verified: true });

  if (reviews.length === 0) {
    await Guide.findByIdAndUpdate(guideId, { averageRating: 0 });
    return;
  }

  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = parseFloat((total / reviews.length).toFixed(1));

  await Guide.findByIdAndUpdate(guideId, { averageRating: avgRating });
};

// Force recalculate average rating (for public profile refresh)
router.post('/recalculate/:guideId', async (req, res) => {
  try {
    await recalculateAverageRating(req.params.guideId);
    res.status(200).json({ message: 'Average rating recalculated' });
  } catch (err) {
    console.error('Error recalculating average rating:', err);
    res.status(500).json({ error: 'Failed to recalculate average rating' });
  }
});




export default router;
