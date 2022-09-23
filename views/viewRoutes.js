const express = require('express');
const viewController = require('./viewController');
const { filterParams } = require('../common/validatorService');

const router = express.Router();

router.get('/', viewController.getHome);

// temp, to integrate PUG from template
router.get('/common', filterParams, viewController.getCommon);

// TODO: param requests are not 'validated' although they are validated on front-end
router.post('/common', viewController.searchFlights);
module.exports = router;
