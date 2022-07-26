const express = require('express');
const viewController = require('./viewController');

const router = express.Router();

router.get('/', viewController.getHome);
router.post('/common', viewController.getCommon);
module.exports = router;
