const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Sends the password reset token email
 * @param {*} req req object from express
 * @param {*} email the email to send to
 * @param {*} resetToken the reset token generated
 */
const sendPasswordResetTokenEmail = async (req, email, resetToken) => {
  // try with mailtrap.io
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Please submit a PATCH request with your new password and passwordConfirm to: ${resetURL}\nIf you didn't forget your password, please ignore this email!`;

  await sendMail({
    email,
    subject: 'Your password reset token (valid for 10 min)',
    message,
  });
};

/**
 * The actual call to send an email
 * @param {*} options email options
 * @returns true if email was successfully sent
 */
const sendMail = async (options) => {
  return await transport.sendMail({
    from: `"Pulpito 🐙" <hello@pulpito.com>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  });
};

module.exports = {
  sendPasswordResetTokenEmail,
};
