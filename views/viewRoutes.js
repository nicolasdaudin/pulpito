const express = require('express');
const viewController = require('./viewController');
const { filterParams } = require('../common/validatorService');

const router = express.Router();

router.get('/', viewController.getHome);

// temp, to integrate PUG from template
router.get('/common', filterParams, viewController.getCommon);

// TODO: param requests are not 'validated' although they are validated on front-end
// we use filterParams to add an empty filter object on req parameter.
router.post('/common', filterParams, viewController.searchFlights);
module.exports = router;
