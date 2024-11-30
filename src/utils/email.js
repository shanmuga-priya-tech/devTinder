const nodemailer = require("nodemailer");

const sendMail = async (options) => {
  //create transport
  const transporter = nodemailer.createTransport({
    //get this details from mailtrap
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.ADMIN_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //create email options
  const emailOptions = {
    from: process.env.ADMIN_EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //send email
  await transporter.sendMail(emailOptions);
};

module.exports = sendMail;
