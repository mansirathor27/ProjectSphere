import nodeMailer from "nodemailer";

export const sendEmail = async ({ to, subject, message }) => {

  const transporter = nodeMailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true, // REQUIRED for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    html: message,
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};