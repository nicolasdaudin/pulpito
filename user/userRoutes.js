const express = require('express');

const { getAllUsers, createUser } = require('./userController');
const { signup, login } = require('./authController');

const router = express.Router();

// special route for auth
router.post('/signup', signup);
router.post('/login', login);

router.route('/').get(getAllUsers).post(createUser);

module.exports = router;
