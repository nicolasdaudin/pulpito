const express = require('express');

const {
  getCheapestDestinations,
  getCommonDestinations,
} = require('./destinationsController');
const {
  validateRequestParamsOneOrigin,
  validateRequestParamsManyOrigins,
} = require('../utils/validator');

const router = express.Router();

router
  .route('/cheapest')
  .get(validateRequestParamsOneOrigin, getCheapestDestinations);
router
  .route('/common')
  .get(validateRequestParamsManyOrigins, getCommonDestinations);

module.exports = router;
