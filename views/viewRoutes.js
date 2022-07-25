const express = require('express');
const viewController = require('./viewController');

const router = express.Router();

router.get('/', viewController.getHome);
module.exports = router;
