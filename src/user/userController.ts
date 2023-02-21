import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import utils from '../utils/utils';
import { findByIataCode } from '../airports/airportService';
import { UserRepository } from './userRepository';

/**
 * Get all users
 * @param {*} req
 * @param {*} res
 */
const getAllUsers = async (req, res) => {
  const users = await UserRepository.all();

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
  // FIXME: ça c'est une business rule
  const filteredBody = utils.filterObj(req.body, allowedFields);

  // 3) Update user
  // FIXME: le controller est directement couplé à MongoDB ... faudrait un service userService avec user.findMe, user.updateMe, ....
  // est-ce que pour séparer en couche on aurait pas mieux fait de mettre tous mes models ensemble au lieu de mettre par métier?
  const updatedUser = await UserRepository.updateOne(req.user.id, filteredBody);

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
  await UserRepository.deleteOne(req.user.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * Get favorite airports for the currently logged-in user
 */
const getFavAirports = catchAsync(async (req, res) => {
  const user = await UserRepository.findOne(req.user.id);

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
const addFavAirportToUser = catchAsync(async (req, res, next) => {
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

  const updatedUser = await UserRepository.addFavAirportToUser(
    req.user.id,
    req.body.airport
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

  const updatedUser = await UserRepository.removeFavAirportFromUser(
    req.user.id,
    req.body.airport
  );

  res.status(200).json({
    status: 'success',
    data: {
      favAirports: updatedUser.favAirports,
    },
  });
});

export = {
  addFavAirport: addFavAirportToUser,
  deleteMe,
  getAllUsers,
  getFavAirports,
  removeFavAirport,
  updateMe,
};
