import express from 'express';
import Guide from '../Models/GuideModel.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';
import fs from 'fs';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import Review from '../Models/ReviewModel.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.resolve();

const uploadDirectory = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Cloudinary storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ceylon-top-guide', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }] // Optional transformations
  }
});


const upload = multer({ storage: storage });

const router = express.Router();

router.use(cookieParser());

router.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE),
    secure: process.env.NODE_ENV === 'production', // HTTPS in production
    httpOnly: true
  }
}));

//Login Route

router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const guide = await Guide.findOne({ "contact.email": email });

    if (!guide) {
      return res.status(401).json({ error: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, guide.account.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (!guide.account.isVerified) {
      return res.status(403).json({ error: "Your account is awaiting approval." });
    }

    req.session.guide = {
      id: guide._id,
      fullName: guide.fullName,
      email: guide.email,
      isVerified: guide.account.isVerified
    }

    res.cookie("sessionID", req.sessionID, { httpOnly: true, secure: false });

    console.log('New session:', req.sessionID);
    console.log('Set-Cookie header:', req.headers['set-cookie']);

    res.status(200).json({ message: "Login Successful!", guide: req.session.guide });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ error: "Login failed." });
  }
})

// Logout Route
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: "Logout failed." });
    }
    res.clearCookie("sessionID");
    res.json({ message: "Logged out successfully." });
  });
});

router.use('/uploads', express.static('uploads'));



// Tour Guide Registration Route/////////////////////////////////
router.post("/register", async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    // Validate required fields
    const requiredFields = ['email', 'username', 'password', 'fullName'];
    for (const field of requiredFields) {
      if (!req.body[field]?.trim()) {
        return res.status(400).json({ error: `${field} is required.` });
      }
    }

    // Check if email or username already exists
    const existingGuide = await Guide.findOne({
      $or: [
        { 'contact.email': req.body.email.trim() },
        { 'account.username': req.body.username.trim() }
      ]
    });

    if (existingGuide) {
      return res.status(400).json({ error: "Email or username already exists." });
    }

    // Parse JSON fields safely
    const parseJSONField = (field) => {
      try {
        return field ? JSON.parse(field) : undefined;
      } catch (e) {
        return field; // If it's already an object/array
      }
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create new guide with Cloudinary URLs
    const newGuide = new Guide({
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      nationality: req.body.nationality,
      profilePhoto: req.body.profilePhoto, // Direct Cloudinary URL
      contact: {
        email: req.body.email.trim(),
        phone: req.body.phone,
        address: parseJSONField(req.body.address),
      },
      professionalDetails: {
        languagesSpoken: parseJSONField(req.body.languagesSpoken) || [],
        experienceYears: req.body.experienceYears,
        specialties: parseJSONField(req.body.specialties) || [],
        tourRegions: parseJSONField(req.body.tourRegions) || [],
      },
      guideRank: req.body.guideRank || [],
      verificationDocuments: {
        governmentID: req.body.governmentID, // Direct Cloudinary URL
        tourGuideLicense: req.body.tourGuideLicense, // Direct Cloudinary URL
      },
      availability: req.body.availability,
      pricing: {
        hourlyRate: req.body.hourlyRate,
        dailyRate: req.body.dailyRate,
        paymentMethods: parseJSONField(req.body.paymentMethods) || [],
      },
      account: {
        username: req.body.username.trim(),
        password: hashedPassword,
        isVerified: false,
      },
      additionalInfo: {
        bio: req.body.bio || "",
      }
    });

    await newGuide.save();
    res.status(201).json({
      message: "Registration submitted, awaiting admin approval.",
      guide: {
        _id: newGuide._id,
        fullName: newGuide.fullName,
        email: newGuide.contact.email,
        governmentID: newGuide.verificationDocuments.governmentID,
        profilePhoto: newGuide.profilePhoto,
        tourGuideLicense: newGuide.verificationDocuments.tourGuideLicense,
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Registration failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


// Fetch Unverified Guides (Admin)
router.get('/unverified', async (req, res) => {
  try {
    const guides = await Guide.find({ "account.isVerified": false });
    res.status(200).json(guides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch Verified Guides (Public)
router.get('/verified', async (req, res) => {
  try {
    const guides = await Guide.find(
      {
        "account.isVerified": true,
        isActive: true
      },
      {
        fullName: 1,
        dateOfBirth: 1,
        gender: 1,
        nationality: 1,
        profilePhoto: 1,
        "contact.email": 1,
        "contact.phone": 1,
        "contact.address": 1,
        "professionalDetails.languagesSpoken": 1,
        "professionalDetails.experienceYears": 1,
        "professionalDetails.specialties": 1,
        "professionalDetails.tourRegions": 1,
        guideRank: 1,
        "verificationDocuments.governmentID": 1,
        "verificationDocuments.tourGuideLicense": 1,
        availability: 1,
        "pricing.hourlyRate": 1,
        "pricing.dailyRate": 1,
        "pricing.paymentMethods": 1,
        "account.username": 1,
        "account.password": 1,
        "additionalInfo.bio": 1,
        isActive: 1
      }
    );

    res.status(200).json(guides);
  } catch (error) {
    console.error("Error fetching verified guides:", error);
    res.status(500).json({ error: "Failed to retrieve verified guides." });
  }
});

// Add this new route
router.get('/verified/all', async (req, res) => {
  try {
    const guides = await Guide.find({
      "account.isVerified": true
    }).select({
      fullName: 1,
      dateOfBirth: 1,
      gender: 1,
      nationality: 1,
      profilePhoto: 1,
      "contact.email": 1,
      "contact.phone": 1,
      "contact.address": 1,
      "professionalDetails.languagesSpoken": 1,
      "professionalDetails.experienceYears": 1,
      "professionalDetails.specialties": 1,
      "professionalDetails.tourRegions": 1,
      guideRank: 1,
      "verificationDocuments.governmentID": 1,
      "verificationDocuments.tourGuideLicense": 1,
      availability: 1,
      "pricing.hourlyRate": 1,
      "pricing.dailyRate": 1,
      "pricing.paymentMethods": 1,
      "account.username": 1,
      "account.password": 1,
      "additionalInfo.bio": 1,
      isActive: 1
    });

    res.status(200).json(guides);
  } catch (error) {
    console.error("Error fetching all guides:", error);
    res.status(500).json({ error: "Failed to retrieve guides." });
  }
});


// Approve Guide (Admin) - Updated with email notification
router.put('/approve/:id', async (req, res) => {
  try {
    console.log('Attempting to approve guide:', req.params.id);

    // First find and update the guide
    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      { 'account.isVerified': true },
      { new: true }
    );

    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    console.log('Guide email:', guide.contact.email);

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true, // 465 is secure by default
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Email options
    const mailOptions = {
      from: 'hello@ceylontopguide.com',
      to: guide.contact.email,
      subject: 'Your Guide Application Has Been Approved!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to Ceylon TopGuide!</h1>
          <p>Dear ${guide.fullName},</p>
          <p>Great news! Your guide profile has been approved and is now live on TopGuide.</p>
          <!-- Rest of your HTML template -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p>With regards,</p>
            <p><strong>The CeylonTopGuide Team</strong></p>
            <p><a href="www.celyontopguide.com">www.celyontopguide.com</a></p>
          </div>
        </div>
      `
    };

    // Send email
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // You might want to continue even if email fails
    }

    res.json({
      message: 'Guide approved and notification email sent',
      guide: {
        id: guide._id,
        name: guide.fullName,
        email: guide.contact.email
      }
    });
  } catch (error) {
    console.error('Approval error:', error);
    res.status(500).json({
      error: 'Approval failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const guide = await Guide.findOne({ "contact.email": email });
    if (!guide) return res.status(404).json({ error: "Guide not found" });

    const token = crypto.randomBytes(20).toString('hex');
    guide.resetPasswordToken = token;
    guide.resetPasswordExpires = Date.now() + parseInt(process.env.RESET_PASSWORD_EXPIRES);
    await guide.save();

    const resetURL = `${process.env.CLIENT_ORIGIN}/reset-password/${token}`;

    // Replace your current nodemailer.createTransport configuration with this:

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true, // 465 is secure by default
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      to: guide.contact.email,
      from: 'hello@ceylontopguide.com',
      subject: 'Password Reset - Ceylon TopGuide',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>One Step Away from Resetting Your Password</h1>
        <p>Dear user,</p>
        <p>We received a request to reset your password for your TopGuide account. To proceed, please click the button below to verify your identity and set a new password:</p>
        <a href="${resetURL}">Reset your password</a>
        <p>If you didn’t request a password reset, you can safely ignore this email, your current password will remain unchanged.</p>
        <p>Thank you for being a part of our travel community!</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p>With regards,</p>
          <p><strong>The CeylonTopGuide Team</strong></p>
          <p><a href="www.celyontopguide.com">www.celyontopguide.com</a></p>
        </div>
      </div>
    `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset email sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  const { password } = req.body;
  try {
    const guide = await Guide.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!guide) return res.status(400).json({ error: "Token is invalid or expired" });

    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS));
    guide.account.password = hashedPassword;
    guide.resetPasswordToken = undefined;
    guide.resetPasswordExpires = undefined;
    await guide.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// Reject Guide (Admin)
router.delete('/reject/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReasons } = req.body; // Expecting an array of reasons

    // Find the guide first to get their email
    const guide = await Guide.findById(id);
    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true, // 465 is secure by default
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Format rejection reasons for email
    const formattedReasons = rejectionReasons.map(reason => {
      if (reason.type === 'predefined') {
        return `• ${reason.value}`;
      } else {
        return `• ${reason.customText}`;
      }
    }).join('\n');

    // Email options
    const mailOptions = {
      from: 'hello@ceylontopguide.com',
      to: guide.contact.email,
      subject: 'Your Guide Application Status',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Application Status Update</h1>
          <p>Dear ${guide.fullName},</p>
          <p>We regret to inform you that your guide application has not been approved at this time.</p>
          
          <h3>Reasons for Rejection:</h3>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            ${formattedReasons.replace(/\n/g, '<br>')}
          </div>
          
          <p>You may reapply after addressing these issues. If you have any questions, please contact our support team.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p>With regards,</p>
            <p><strong>The CeylonTopGuide Team</strong></p>
            <p><a href="www.celyontopguide.com">www.celyontopguide.com</a></p>
          </div>
        </div>
      `
    };

    // Send email first
    try {
      await transporter.sendMail(mailOptions);
      console.log('Rejection email sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return res.status(500).json({
        error: 'Failed to send rejection email',
        details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }

    // Delete the guide after successful email
    await Guide.findByIdAndDelete(id);
    res.json({ message: 'Guide rejected and notification sent' });

  } catch (error) {
    console.error('Rejection error:', error);
    res.status(500).json({
      error: 'Rejection failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get Guide Profile
router.get('/profile', async (req, res) => {
  try {
    console.log('Session:', req.session); // Debug log

    if (!req.session?.guide?.id) {
      return res.status(401).json({ error: "No active session" });
    }

    if (!req.session.guide) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const guide = await Guide.findById(req.session.guide.id)
      .select("-account.password")
      .lean();

    // Calculate average rating
    const reviews = await Review.find({ guideId: guide._id });
    guide.averageRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.status(200).json(guide);
  } catch (error) {
    console.error("Profile error:", error)
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update Guide Profile
router.put("/profile/update", async (req, res) => {
  try {
    if (!req.session.guide) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updatedGuide = await Guide.findByIdAndUpdate(
      req.session.guide.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-account.password");

    res.status(200).json({ message: "Profile updated", guide: updatedGuide });
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// Delete Guide Account
router.delete("/profile/delete", async (req, res) => {
  try {
    if (!req.session.guide) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // First get the guide to access image URLs
    const guide = await Guide.findById(req.session.guide.id);

    if (!guide) {
      return res.status(404).json({ error: "Guide not found" });
    }

    // Delete images from Cloudinary
    const { deleteFromCloudinary, getPublicIdFromUrl } = require('../utils/cloudinary');

    const imagesToDelete = [
      guide.profilePhoto,
      guide.verificationDocuments.governmentID,
      guide.verificationDocuments.tourGuideLicense
    ].filter(url => url);

    await Promise.all(imagesToDelete.map(async (url) => {
      const publicId = getPublicIdFromUrl(url);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }));

    // Delete the guide document
    await Guide.findByIdAndDelete(req.session.guide.id);
    req.session.destroy(); // Destroy session after deletion

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedGuide = await Guide.findByIdAndDelete(id);

    if (!deletedGuide) {
      return res.status(404).json({ error: "Guide not found" });
    }

    res.status(200).json({ message: "Guide deleted successfully" });
  } catch (error) {
    console.error("Delete failed:", error);
    res.status(500).json({ error: "Delete failed" });
  }
});


//Sort by Guide Rank

router.get('/verified/sort', async (req, res) => {
  try {
    const { rank, language, experienceYears, specialty, region, availability, maxHourlyRate, maxDailyRate, paymentMethod } = req.query;

    const guidesQuery = {
      "account.isVerified": true,
      isActive: true
    };

    if (rank && rank !== "All") {
      guidesQuery.guideRank = rank;
    }

    if (language && language !== "All") {
      guidesQuery["professionalDetails.languagesSpoken"] = language;
    }

    if (experienceYears && experienceYears !== "All") {
      guidesQuery["professionalDetails.experienceYears"] = parseInt(experienceYears);
    }

    if (specialty && specialty !== "All") {
      guidesQuery["professionalDetails.specialties"] = specialty;
    }

    if (region && region !== "All") {
      guidesQuery["professionalDetails.tourRegions"] = region;
    }

    if (availability && availability !== "All") {
      guidesQuery["availability"] = availability;
    }

    if (maxHourlyRate) {
      guidesQuery["pricing.hourlyRate"] = { $lte: parseFloat(maxHourlyRate) };
    }

    if (maxDailyRate) {
      guidesQuery["pricing.dailyRate"] = { $lte: parseFloat(maxDailyRate) };
    }

    if (paymentMethod && paymentMethod !== "All") {
      guidesQuery["pricing.paymentMethods"] = paymentMethod;
    }

    const guides = await Guide.find(guidesQuery, {
      fullName: 1,
      dateOfBirth: 1,
      gender: 1,
      nationality: 1,
      profilePhoto: 1,
      "contact.email": 1,
      "contact.phone": 1,
      "contact.address": 1,
      "professionalDetails.languagesSpoken": 1,
      "professionalDetails.experienceYears": 1,
      "professionalDetails.specialties": 1,
      "professionalDetails.tourRegions": 1,
      guideRank: 1,
      "verificationDocuments.governmentID": 1,
      "verificationDocuments.tourGuideLicense": 1,
      availability: 1,
      "pricing.hourlyRate": 1,
      "pricing.dailyRate": 1,
      "pricing.paymentMethods": 1,
      "account.username": 1,
      "account.password": 1,
      "additionalInfo.bio": 1,
      averageRating: 1
    });

    // Recalculate average rating for each guide
    for (const guide of guides) {
      const reviews = await Review.find({ guideId: guide._id });
      if (reviews.length > 0) {
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        guide.averageRating = total / reviews.length;
      } else {
        guide.averageRating = 0; // Or null
      }
    }

    res.status(200).json(guides);
  } catch (error) {
    console.error("Error fetching verified guides:", error);
    res.status(500).json({ error: "Failed to retrieve verified guides." });
  }
});

// Get a specific verified guide by ID (Public)
router.get('/verified/:id', async (req, res) => {
  try {
    const guide = await Guide.findOne(
      { _id: req.params.id, "account.isVerified": true },
      {
        fullName: 1,
        dateOfBirth: 1,
        gender: 1,
        nationality: 1,
        profilePhoto: 1,
        "contact.email": 1,
        "contact.phone": 1,
        "contact.address": 1,
        "professionalDetails.languagesSpoken": 1,
        "professionalDetails.experienceYears": 1,
        "professionalDetails.specialties": 1,
        "professionalDetails.tourRegions": 1,
        guideRank: 1,
        "verificationDocuments.governmentID": 1,
        "verificationDocuments.tourGuideLicense": 1,
        availability: 1,
        "pricing.hourlyRate": 1,
        "pricing.dailyRate": 1,
        "pricing.paymentMethods": 1,
        "account.username": 1,
        "additionalInfo.bio": 1,
        averageRating: 1,
        isActive: 1
      }
    );

    if (!guide) {
      return res.status(404).json({ error: "Guide not found or not verified" });
    }

    res.status(200).json(guide);
  } catch (error) {
    console.error("Error fetching guide profile:", error);
    res.status(500).json({ error: "Failed to retrieve guide profile." });
  }
});


// Get Top Rated Guides (Public)
router.get('/top-rated', async (req, res) => {
  try {
    const topGuides = await Guide.find({ "account.isVerified": true, isActive: true })
      .sort({ averageRating: -1 }) // Highest rated first
      .limit(5) // Adjust as needed
      .select({
        fullName: 1,
        profilePhoto: 1,
        averageRating: 1,
        "professionalDetails.specialties": 1,
        "professionalDetails.tourRegions": 1
      });

    res.status(200).json(topGuides);
  } catch (error) {
    console.error("Error fetching top-rated guides:", error);
    res.status(500).json({ error: "Failed to retrieve top-rated guides." });
  }
});

// Deactivate a guide
router.put('/deactivate/:id', async (req, res) => {
  try {
    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    res.json({
      message: 'Guide deactivated successfully',
      guide: {
        id: guide._id,
        name: guide.fullName,
        isActive: guide.isActive
      }
    });
  } catch (error) {
    console.error('Deactivation error:', error);
    res.status(500).json({
      error: 'Deactivation failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Reactivate a guide
router.put('/reactivate/:id', async (req, res) => {
  try {
    const guide = await Guide.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    );

    if (!guide) {
      return res.status(404).json({ error: 'Guide not found' });
    }

    res.json({
      message: 'Guide reactivated successfully',
      guide: {
        id: guide._id,
        name: guide.fullName,
        isActive: guide.isActive
      }
    });
  } catch (error) {
    console.error('Reactivation error:', error);
    res.status(500).json({
      error: 'Reactivation failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Deactivate guide account
router.put('/deactivate', async (req, res) => {
  try {
    if (!req.session.guide) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const guide = await Guide.findByIdAndUpdate(
      req.session.guide.id,
      { isActive: false },
      { new: true }
    );

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reactivate guide account
router.put('/reactivate', async (req, res) => {
  try {
    if (!req.session.guide) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const guide = await Guide.findByIdAndUpdate(
      req.session.guide.id,
      { isActive: true },
      { new: true }
    );

    res.json({ message: 'Account reactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Run this once in your routes file or directly in MongoDB
router.get('/fix-active-status', async (req, res) => {
  try {
    const result = await Guide.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    res.json({ message: `Updated ${result.nModified} guides` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


export default router;
