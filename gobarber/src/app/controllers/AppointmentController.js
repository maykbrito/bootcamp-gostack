import Appointment from '../models/Appointment'
import User from '../models/User'
import * as Yup from 'yup'

class AppointmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    })

    if(!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails'})
    }

    const { provider_id, date} = req.body

    const isProvider = await User.findOne({ where: {
      id: provider_id,
      provider: true
    }})

    if (!isProvider) {
      res.status(401).json({ error: 'You can only create appointments with providers '})
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date
    })

    return res.json(appointment);
  }
}

export default new AppointmentController()
