import mongoose from "mongoose";

const GuideSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    required: true,
  },
  nationality: {
    type: String,
    required: true
  },
  profilePhoto: {
    type: String,
  },
  contact: {
    email: {
      type: String,
      required: true,
      unique: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      district: String,
      province: String
    }
  },
  professionalDetails: {
    languagesSpoken: [{
      type: String
    }],
    experienceYears: {
      type: Number,
      required: true
    },
    specialties: [{
      type: String
    }],
    tourRegions: [{
      type: String
    }]
  },
  guideRank: {
    type: String
  },
  verificationDocuments: {
    governmentID: {
      type: String
    },
    tourGuideLicense: {
      type: String
    }
  },
  availability: {
    type: String,
  },
  pricing: {
    hourlyRate: {
      type: Number
    },
    dailyRate: {
      type: Number
    },
    paymentMethods: [{
      type: String
    }]
  },
  account: {
    username: {
      type: String,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  additionalInfo: {
    bio: {
      type: String
    },
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isVerified: {
    type: Boolean,
  },
  averageRating: {
    type: Number,
    default: 0
  },
  pastTourPhotos: {
    type: [String],
    default: [],
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isActive: {
    type: Boolean,
    default: true
  }

});

const Guide = mongoose.model("Guide", GuideSchema);
export default Guide; 
