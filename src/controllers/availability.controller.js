import Availability from '../models/Availability.models.js'

export const addOrUpdateAvailability = async (req, res) => {
  try {
    const counsellorId = req.user.id
    const { day, startTime, endTime } = req.body

    const existing = await Availability.findOne({ counsellorId, day })

    if (existing) {
      existing.startTime = startTime
      existing.endTime = endTime
      await existing.save()
      return res.json({
        msg: 'Availability updated',
        data: existing
      })
    }

    const created = await Availability.create({
      counsellorId,
      day,
      startTime,
      endTime
    })

    res.json({
      msg: 'Availability added',
      data: created
    })
  } catch (err) {
    res.status(500).json({ msg: 'Error', err })
  }
}
