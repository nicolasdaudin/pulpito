const User = require('./userModel');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const airportService = require('../airports/airportService');

/**
 *
 * Get all users
 * @param {*} req
 * @param {*} res
 */
exports.getAllUsers = async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
};

/**
 * Remove fields from an object
 * @param {*} obj
 * @param  {...any} allowedFields
 */
const filterObj = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

// const areFieldsInBody(obj, allowedFields) => {
//   Object.keys(obj).forEach((el)) => {
//     if (allowedFields.includes(el)) {
//       return true;
//     }
//   }
//   return false;
// }

/**
 * Update a connected user. Only to update name and email.
 * If other fields are sent, they will NOT be updated.
 */
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  const allowedFields = ['name', 'email'];

  // 2) Filter out unwanted fields names that are not allowed to be updated, to avoid users to set themselves as admin, for example
  const filteredBody = filterObj(req.body, allowedFields);

  // 3) Update user
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true, // fields validator will be run, for example isEmail()
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

/**
 * Get a connected user's favorite airports
 */
exports.getFavAirports = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      favAirports: user.favAirports,
    },
  });
});

/**
 * Add a favorite airports to connected user's list of airport
 */
exports.addFavAirport = catchAsync(async (req, res, next) => {
  if (!req.body.airport) {
    return next(new AppError('Please specify an airport', 400));
  }
  if (!airportService.findByIataCode(req.body.airport)) {
    return next(
      new AppError(
        `We haven't found any airport with this IATA code. Please retry with an existing IATA code`,
        400
      )
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      $addToSet: { favAirports: req.body.airport },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      favAirports: updatedUser.favAirports,
    },
  });
});

/**
 * Remove a favorite airports from connected users
 */
exports.removeFavAirport = catchAsync(async (req, res, next) => {
  if (!req.body.airport) {
    return next(new AppError('Please specify an airport', 400));
  }
  if (!airportService.findByIataCode(req.body.airport)) {
    return next(
      new AppError(
        `We haven't found any airport with this IATA code. Please retry with an existing IATA code`,
        400
      )
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      $pullAll: { favAirports: [req.body.airport] },
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      favAirports: updatedUser.favAirports,
    },
  });
});

/**
 * Removes a connected user (actually makes him inactive)
 */
exports.deleteMe = catchAsync(async (req, res, next) => {
  // 3) Update user
  const deletedUser = await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
