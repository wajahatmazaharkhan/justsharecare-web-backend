const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // we have a model named 'User'
    required: true
  },
  
  // Reference to the Counsellor model (matches counsellor_id)
  counsellor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Counsellor', 
    required: true
  },

  scheduled_at: {
    type: Date,
    required: true
  },

  duration_minutes: {
    type: Number,
    required: true
  },

  session_type: {
    type: String,
    required: true,
    trim: true
    //  add an enum here if types are fixed, e.g.:
    // enum: ['video', 'audio', 'chat']
  },

  status: {
    type: String,
    default: 'pending',
    trim: true
    // Recommended to restrict values using enum:
    // enum: ['pending', 'confirmed', 'completed', 'cancelled']
  },

  price: {
    type: Number, // Using Number is standard, but use Decimal128 if you need exact financial precision
    required: true
  },

  payment_id: {
    type: String,
    default: null
  },

  zego_session_id: {
    type: String,
    default: null
  },

  notes: {
    type: String,
    default: ''
  }
}, {

  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});


export default mongoose.model('Appointment', appointmentSchema)
