import * as Yup from 'yup'
import { startOfHour, parseISO, isBefore, format} from 'date-fns'
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment'
import User from '../models/User'
import File from '../models/File'
import Notification from '../schemas/Notification'

class AppointmentController {
  async index( req, res ) {

    const { page = 1 } = req.query

    const appointments = await Appointment.findAll({
      where: {
        user_id: req.userId,
        canceled_at: null,
      },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page -1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes:['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url']
            }
          ]
        }
      ]
    })

    return res.json(appointments);
  }

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

    // check for past dates
    const hourStart = startOfHour(parseISO(date))

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({error: 'Past dates are not allowed'})
    }


    const checkDateAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart
      }
    })

    if (checkDateAvailability) {
      return res.status(400).json({error: 'Date is unavailable'})
    }


    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date
    })

    // Notify provider
    const user = await User.findByPk(req.userId);
    const formmatedDate = format(
      hourStart,
      "dd 'de' MMMM', às' H:mm'h'",
      {locale: pt}
    )

    Notification.create({
      content: `Novo agendamento de ${user.name} para dia ${formmatedDate}`,
      user: provider_id
    })

    return res.json(appointment);
  }
}

export default new AppointmentController()
