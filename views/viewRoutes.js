const express = require('express');
const viewController = require('./viewController');

const router = express.Router();

router.get('/', viewController.getHome);

// temp, to integrate PUG from template
router.get('/common', viewController.getCommon);

router.post('/common', viewController.getCommon);
module.exports = router;
