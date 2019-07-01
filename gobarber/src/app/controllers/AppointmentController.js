import * as Yup from 'yup'
import { startOfHour, parseISO, isBefore, format, subHours} from 'date-fns'
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment'
import User from '../models/User'
import File from '../models/File'
import Notification from '../schemas/Notification'
import Mail from '../../lib/Mail';

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

    // is provider?
    const isProvider = await User.findOne({ where: {
      id: provider_id,
      provider: true
    }})

    if (!isProvider)
      return res.status(401).json({ error: 'You can only create appointments with providers '})


    // user cannot appointment himself
    const isUserAProvider = req.userId === provider_id
    if (isUserAProvider)
      return res.status(400).json({ error: 'You can not appointment yourself'})


    // check for past dates
    const hourStart = startOfHour(parseISO(date))

    if (isBefore(hourStart, new Date()))
      return res.status(400).json({error: 'Past dates are not allowed'})


    const checkDateAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart
      }
    })

    if (checkDateAvailability)
      return res.status(400).json({error: 'Date is unavailable'})


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

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email']
        }
      ]
    });

    const userCannotCancel = appointment.user_id !== req.userId
    if(userCannotCancel)
      return res.status(401).json({error: "You do not have permission to cancel"})

    const dateMinus2h = subHours(appointment.date, 2);
    const timeIsBeforeNow = isBefore(dateMinus2h, new Date());

    if(timeIsBeforeNow)
      return res.status(401).json({ error: "You can only cancel appoitment 2 hours in advance."})

    appointment.canceled_at = new Date();

    await appointment.save()

    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento Cancelado',
      text: 'Você tem um novo cancelamento.'
    })

    return res.json(appointment)
  }
}

export default new AppointmentController()
