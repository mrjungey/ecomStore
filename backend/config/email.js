const nodemailer = require("nodemailer") 

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}) 

async function sendMail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
    }) 
  } catch (err) {
    console.error("Email send failed:", err.message) 
  }
}

module.exports = { sendMail } 
