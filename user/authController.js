const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./userModel');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const email = require('../utils/email');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // can not be access or modified in any way by the browser (to avoid cross-site sripting attacks), the browser will store it and send it along with every request}
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true; // cookie only sent on an encrypted connection, HTTPS only

  // remove password from output
  user.password = undefined;

  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'success',
    // token,
    data: {
      user,
    },
  });
};
// sort of createUser but in the context of AUTH it's a signup.
// it's a signup = we create the user and log in, that's why we send back the token
exports.signup = catchAsync(async (req, res, next) => {
  // we could have done User.create(req.body) but we would allow API users to register themselves as 'admin' just by putting role=admin in the body. Doing this manually field by field prevents people to register as admin.
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email, inactive: false }).select(
    '+password'
  );
  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(
      new AppError('Incorrect email or password, or inactive user', 401)
    );
  }

  // 3) If everything ok, send token to client

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 401: data is correct but not enough to get the ressources requested
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token (jwt.verify)
  // jwt.verify verifies the token and calls a callback. So insteead of adding a callback, we promisify the function to make it 'cleaner'
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  // (and also check that the payload has not been altered)
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued (we would need to reissue the token)
  // FIXME: at the moment, the user changed password date is only set upon creation (but at the moment, there's no way to update the user)
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

// PASS WORD RESET
// 1- provide your email address to a forgot password route
// 2- you receive an email with a link that you can click
// 3- you input a new password in that page
// IN OUR CASE
// 1 - we request a new password
// 2 - we receive a token in an email
// 3 - we send back this token with a new password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // if we don't set up this option, we can't save the reset token
  // (and we don't need to validate since there are no inputs here)
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  // try with mailtrap.io
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Please submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await email.sendMail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    // if there has been an error, we reset the password reset token thing
    user.passwordResetToken = undefined;
    user.passwordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was en error sending the email. Please try again later!'
      ),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const token = req.params.token;
  const { password, passwordConfirm } = req.body;
  if (!token || !password || !passwordConfirm) {
    return next(
      new AppError(
        'Please provide reset token, password and password confirmation!',
        400
      )
    );
  }

  const encrypted = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: encrypted,
    passwordResetExpiresAt: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // 3) Update password for the user
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;

  await user.save();

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
  // 1) get user
  const user = await User.findById(req.user._id).select('+password');

  const { current, password, passwordConfirm } = req.body;
  if (!current || !password || !passwordConfirm) {
    return next(
      new AppError(
        'Please provide current password, new password and password confirmation!',
        400
      )
    );
  }

  // 2) Check if POSTed current password is correct
  // console.log(user.password);
  if (!(await user.isCorrectPassword(current, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = password;
  user.passwordConfirm = passwordConfirm;

  await user.save();

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
