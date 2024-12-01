const nodemailer = require("nodemailer");
const { google } = require("googleapis");

//oauth
const CLIENT_ID = process.env.OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.OAUTH_REFRESH_TOKEN;
const REDIRECT_URI = "https://developers.google.com/oauthplayground"; //DONT EDIT THIS
const MY_EMAIL = process.env.ADMIN_EMAIL;

const sendEmail = async (options) => {
  let transporter;

  //create transport
  if (process.env.NODE_ENV === "production") {
    //send using gmail ouath
    //gmail
    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    const ACCESS_TOKEN = await oAuth2Client.getAccessToken();

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: MY_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: ACCESS_TOKEN,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      //get this details from mailtrap
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.ADMIN_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  //create email options
  const emailOptions = {
    from: `Shan from <${process.env.ADMIN_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  //send email
  await transporter.sendMail(emailOptions);
};

module.exports = sendEmail;
