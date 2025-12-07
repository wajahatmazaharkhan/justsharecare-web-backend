import mongoose from "mongoose";

const counsellorSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  counselling_type: {
    type: String,
    required: true
  },

  specialties: {
    type: String,
    required: true
  },

  bio: {
    type: String,
    required: true
  },

  qualifications: {
    type: String,
    required: true
  },

  years_experience: {
    type: Number,
    required: true
  },

  languages: [{
    type: String
  }],

  rating: {
    type: Number,
    default: 0
  },

  rating_count: {
    type: Number,
    default: 0
  },

  contact_number: {
    type: String,
    required: true
  },

  hourly_rate: {
    type: Number,
    required: true
  },

  availability: {
    type: String,
    required: true
  },

  calendar_integration: {
    type: Boolean,
    default: false
  },

  profile_picture_url: {
    type: String
  },

  documents: [{
    type: String
  }],

  session_type: {
    type: String,
    enum: ["chat", "audio", "video"],
    required: true
  },

  status: {
    type: String,
    enum: ["active", "inactive", "banned"],
    default: "active"
  }

}, { timestamps: true });

export const Counsellor =  mongoose.model("Counsellor", counsellorSchema);
