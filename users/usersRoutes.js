const express = require('express');

const { getUsers, createUser } = require('./usersController');

const router = express.Router();

router.route('/').get(getUsers).post(createUser);

module.exports = router;
