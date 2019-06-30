import {startOfDay, endOfDay, parseISO} from 'date-fns'
import User from '../models/User'
import Appointment from '../models/Appointment'
import { Op } from 'sequelize'

class ScheduleController {
  async index (req, res) {
    const checkIsProvider = await User.findOne({
      where: {
        id: req.userId,
        provider: true,
      }
    })

    if (!checkIsProvider)
      return res.status(401).json({ error: 'You must be a provider'})

    const { date } = req.query;
    const parsedDate = parseISO(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)]
        }
      },
      order: ['date']
    })

    return res.json(appointments)
  }
}

export default new ScheduleController()
