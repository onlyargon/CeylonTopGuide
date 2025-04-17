import express from 'express';
import Guide from '../Models/GuideModel.js';
//import upload from '../middleware/upload.js';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { error } from 'console';
import Review from '../Models/ReviewModel.js'
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const __dirname = path.resolve();

const uploadDirectory = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
})


const upload = multer({ storage: storage });

const router = express.Router();

router.use(cookieParser());

router.use(session({
  secret: '12345#abc',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 3600000 }
}))

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

// Tour Guide Registration Route
router.post("/register", upload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "governmentID", maxCount: 1 },
  { name: "tourGuideLicense", maxCount: 1 }
]), async (req, res) => {
  try {
    // Debugging logs
    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);

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
        console.error(`Error parsing ${field}:`, e);
        return undefined;
      }
    };

    // Hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create new guide
    const newGuide = new Guide({
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      nationality: req.body.nationality,
      profilePhoto: req.files['profilePhoto']?.[0]?.filename, // Store just filename
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
        governmentID: req.files['governmentID']?.[0]?.filename,
        tourGuideLicense: req.files['tourGuideLicense']?.[0]?.filename,
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
      { "account.isVerified": true },
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
        "additionalInfo.bio": 1
      }
    );

    res.status(200).json(guides);
  } catch (error) {
    console.error("Error fetching verified guides:", error);
    res.status(500).json({ error: "Failed to retrieve verified guides." });
  }
});


// Approve Guide (Admin)
router.put('/approve/:id', async (req, res) => {
  try {
    await Guide.findByIdAndUpdate(req.params.id, {
      'account.isVerified': true
    });
    res.json({ message: 'Guide approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reject Guide (Admin)
router.delete('/reject/:id', async (req, res) => {
  try {
    await Guide.findByIdAndDelete(req.params.id);
    res.json({ message: 'Guide rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Guide Profile
router.get("/profile", async (req, res) => {
  try {
    if (!req.session.guide) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const guide = await Guide.findById(req.session.guide.id).select("-account.password");
    if (!guide) {
      return res.status(404).json({ error: "Guide not found" });
    }

    res.status(200).json(guide);
  } catch (error) {
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
    const { rank, language, experienceYears , specialty , region , availability , maxHourlyRate , maxDailyRate ,paymentMethod} = req.query;

    const guidesQuery = {
      "account.isVerified": true
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
        averageRating: 1
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

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const guide = await Guide.findOne({ "contact.email": email });
    if (!guide) return res.status(404).json({ error: "Guide not found" });

    const token = crypto.randomBytes(20).toString('hex');
    guide.resetPasswordToken = token;
    guide.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await guide.save();

    const resetURL = `http://localhost:3000/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'heshaltempdissanayake@gmail.com',
        pass: 'qxts aaww ymia hzfc'
      }
    });

    const mailOptions = {
      to: guide.contact.email,
      from: 'heshaltempdissanayake@gmail.com',
      subject: 'Password Reset - Ceylon TopGuide',
      text: `You requested a password reset. Click this link to reset your password: ${resetURL}`
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

    const hashedPassword = await bcrypt.hash(password, 10);
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

// Get Top Rated Guides (Public)
router.get('/top-rated', async (req, res) => {
  try {
    const topGuides = await Guide.find({ "account.isVerified": true })
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



export default router;
