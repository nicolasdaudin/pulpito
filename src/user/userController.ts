import { catchAsync } from '../utils/catchAsync';
import AppError from '../utils/appError';
import utils from '../utils/utils';
import { findByIataCode } from '../airports/airportService';
import { UserRepository } from './userRepository';
import { NextFunction, Request, Response } from 'express-serve-static-core';
import { HydratedDocument } from 'mongoose';
import { IUser } from './userModel';

/**
 * Get all users
 * @param {*} req
 * @param {*} res
 */
const getAllUsers = async (req: Request, res: Response) => {
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
// TODO: improve, it should not be coupled to mongoose implementation (HydratedDocument)
const updateMe = catchAsync(
  async (
    req: Request & { user: HydratedDocument<IUser> },
    res: Response,
    next: NextFunction
  ) => {
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
    const updatedUser = await UserRepository.updateOne(
      req.user.id,
      filteredBody
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  }
);

/**
 * Deletes currently logged-in user
 */
const deleteMe = catchAsync(
  async (req: Request & { user: HydratedDocument<IUser> }, res: Response) => {
    // 3) Update user
    await UserRepository.deleteOne(req.user.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);

/**
 * Get favorite airports for the currently logged-in user
 */
const getFavAirports = catchAsync(
  async (req: Request & { user: HydratedDocument<IUser> }, res: Response) => {
    const user = await UserRepository.findOne(req.user.id);

    res.status(200).json({
      status: 'success',
      data: {
        favAirports: user.favAirports,
      },
    });
  }
);

/**
 * Add a favorite airport to the list of favorite airports for that user
 */
const addFavAirportToUser = catchAsync(
  async (
    req: Request & { user: HydratedDocument<IUser> },
    res: Response,
    next: NextFunction
  ) => {
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

    const updatedUser = (await UserRepository.addFavAirportToUser(
      req.user.id,
      req.body.airport
    )) as IUser;

    res.status(200).json({
      status: 'success',
      data: {
        favAirports: updatedUser.favAirports,
      },
    });
  }
);

/**
 * Remove a favorite airport from the list of favorite airports for that user
 */
const removeFavAirport = catchAsync(
  async (
    req: Request & { user: HydratedDocument<IUser> },
    res: Response,
    next: NextFunction
  ) => {
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
  }
);

export = {
  addFavAirport: addFavAirportToUser,
  deleteMe,
  getAllUsers,
  getFavAirports,
  removeFavAirport,
  updateMe,
};
