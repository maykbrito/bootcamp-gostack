import nodemailer from 'nodemailer'
import mailConfig from '../config/mail'

class Mail {
  constructor() {
    const { auth, host, port, secure } = mailConfig
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: auth.user ? auth : null
    })
  }

  sendMail(message) {
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...message
    })
  }
}

export default new Mail()
