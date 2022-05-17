const express = require('express');

const { search } = require('./airportController');

const router = express.Router();

router.get('/search/:q', search);

module.exports = router;
