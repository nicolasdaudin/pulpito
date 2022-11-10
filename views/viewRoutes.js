const express = require('express');
const viewController = require('./viewController');
const { filterParams } = require('../common/validatorService');

const router = express.Router();

router.get('/', viewController.getHome);

router.get('/search', viewController.getSearchPage);

router.get('/common', filterParams, viewController.searchFlights);

// TODO: param requests are not 'validated' here although they are validated on front-end
// we use filterParams to add an empty filter object on req parameter.
router.post('/common', filterParams, viewController.searchFlights);
module.exports = router;
