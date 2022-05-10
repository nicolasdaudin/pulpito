const jwt = require('jsonwebtoken');
const User = require('./userModel');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
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
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.isCorrectPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
