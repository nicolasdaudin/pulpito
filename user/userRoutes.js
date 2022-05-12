const express = require('express');

const { getAllUsers, updateMe, deleteMe } = require('./userController');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updateMyPassword,
} = require('./authController');
const { protect } = require('../user/authController');

const router = express.Router();

// current user related
router.patch('/updateMe', protect, updateMe);
router.delete('/deleteMe', protect, deleteMe);

// auth related
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);
router.patch('/updateMyPassword', protect, updateMyPassword);

router.route('/').get(getAllUsers); //.post(createUser);

module.exports = router;
