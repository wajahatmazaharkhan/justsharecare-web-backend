import mongoose from 'mongoose'

const availabilitySchema = new mongoose.Schema({
  counsellorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  day: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  }
}, { timestamps: true })

export default mongoose.model('Availability', availabilitySchema)
