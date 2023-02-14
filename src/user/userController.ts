import User from './userModel';
import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import utils from '../utils/utils';
import { findByIataCode } from '../airports/airportService';

/**
 * Get all users
 * @param {*} req
 * @param {*} res
 */
const getAllUsers = async (req, res) => {
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
 * Updates currently logged in user
 */
const updateMe = catchAsync(async (req, res, next) => {
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
  const filteredBody = utils.filterObj(req.body, allowedFields);

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
 * Deletes currently logged-in user
 */
const deleteMe = catchAsync(async (req, res) => {
  // 3) Update user
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * Get favorite airports for the currently logged-in user
 */
const getFavAirports = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    data: {
      favAirports: user.favAirports,
    },
  });
});

/**
 * Add a favorite airport to the list of favorite airports for that user
 */
const addFavAirport = catchAsync(async (req, res, next) => {
  if (!req.body.airport) {
    return next(new AppError('Please specify an airport', 400));
  }
  if (!findByIataCode(req.body.airport)) {
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
 * Remove a favorite airport from the list of favorite airports for that user
 */
const removeFavAirport = catchAsync(async (req, res, next) => {
  if (!req.body.airport) {
    return next(new AppError('Please specify an airport', 400));
  }
  if (!findByIataCode(req.body.airport)) {
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

export = {
  addFavAirport,
  deleteMe,
  getAllUsers,
  getFavAirports,
  removeFavAirport,
  updateMe,
};
