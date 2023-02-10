const express = require('express');

const {
  getAllUsers,
  updateMe,
  deleteMe,
  getFavAirports,
  addFavAirport,
  removeFavAirport,
} = require('./userController');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updateMyPassword,
} = require('./authController');
const { protect } = require('./authController');

const router = express.Router();

// current user related
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);
router
  .route('/favAirports')
  .get(protect, getFavAirports)
  .post(protect, addFavAirport)
  .delete(protect, removeFavAirport);

// auth related
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', protect, updateMyPassword);

router.route('/').get(getAllUsers); //.post(createUser);

module.exports = router;
