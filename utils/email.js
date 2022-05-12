const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendMail = async (options) => {
  return await transport.sendMail({
    from: `"Pulpito 🐙" <hello@pulpito.com>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  });
};
