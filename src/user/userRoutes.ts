import express from 'express';

import userController from './userController';
import authController from './authController';

export const router = express.Router();

// current user related
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router
  .route('/favAirports')
  .get(authController.protect, userController.getFavAirports)
  .post(authController.protect, userController.addFavAirport)
  .delete(authController.protect, userController.removeFavAirport);

// auth related
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updateMyPassword
);

router.route('/').get(userController.getAllUsers); //.post(createUser);
