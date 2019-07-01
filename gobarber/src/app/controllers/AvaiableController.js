import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';
import Appointment from '../models/Appointment';

class AvaiableController {
  async index(req, res) {
    const { date } = req.query;

    if (!date) return res.status(400).json({ error: 'Invalid Date' });

    const searchDate = Number(date);

    const appointments = await Appointment.findAll({
      where: {
        provider_id: req.params.providerId,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
        },
      },
    });

    const schedule = [
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
    ];

    const adjustTimeToBeFullHour = time => {
      const [hour, minute] = time.split(':');
      return setSeconds(setMinutes(setHours(searchDate, hour), minute), 0);
    };

    const getFormatedDate = date => format(date, "yyyy-MM-dd'T'HH:mm:ssxxx");

    const dateIsAvaiableAfterNow = date => isAfter(date, new Date());

    const timeIsNotAvaiable = time =>
      !appointments.find(
        appointment => format(appointment.date, 'HH:mm') === time
      );

    const avaiable = schedule.map(time => {
      const dateFullHour = adjustTimeToBeFullHour(time);

      return {
        time,
        value: getFormatedDate(dateFullHour),
        avaiable:
          dateIsAvaiableAfterNow(dateFullHour) && timeIsNotAvaiable(time),
      };
    });

    return res.json(avaiable);
  }
}

export default new AvaiableController();
