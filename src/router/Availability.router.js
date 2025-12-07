import express from 'express'
import auth from '../middlewares/auth.middlewares.js'
import { availabilitySchema } from '../validator/availability.Validation.js'
import { addOrUpdateAvailability } from '../controllers/availability.controller.js'

const AvailabilityRouter = express.Router()

AvailabilityRouter.post('/', auth, async (req, res, next) => {
  try {
    availabilitySchema.parse(req.body)
    next()
  } catch (err) {
    return res.status(400).json({ msg: 'Validation error', err })
  }
}, addOrUpdateAvailability)

export { AvailabilityRouter }
