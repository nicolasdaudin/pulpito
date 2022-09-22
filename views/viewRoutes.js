const express = require('express');
const viewController = require('./viewController');

const router = express.Router();

router.get('/', viewController.getHome);

// temp, to integrate PUG from template
router.get('/common', viewController.getCommon);

// TODO: param requests are not 'validated' although they are validated on front-end
router.post('/common', viewController.getFlights);
module.exports = router;
