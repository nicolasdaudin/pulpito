const express = require('express');

const { getAirports } = require('./airportController');

const router = express.Router();

router.get('/', getAirports);

module.exports = router;
