import mongoose from "mongoose";

const counsellorSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  services: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    }
  ],

  fullname: {
    type: String
  },

  email: {
    type: String
  },

  gender: {
    type: String
  },

  phone_number: {
    type: String
  },

  gender: {
    type: String
  },

  role: {
    type: String,
    default: "counsellor"
  },

  dob: {
    type: String
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


  documents: {
    government_id: { type: String, required: true },
    profile_picture: { type: String, required: true },
    qualification_certificates: { type: String, required: true },
    licence: { type: String, required: true },
    experince_letter: { type: String },
    additional_documents: { type: String },
  },
  session_type: {
    type: [String],
    enum: ["video", "audio", "chat"],
    required: true
  },

  Admin_approved: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: ["active", "inactive", "banned"],
    default: "active"
  },
  history: [
    {
      customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      visitDate: { type: Date, default: Date.now },
      notes: { type: String }, // optional notes about the session
    }
  ]
}, { timestamps: true });

export const Counsellor = mongoose.model("Counsellor", counsellorSchema);
