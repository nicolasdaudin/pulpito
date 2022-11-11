const express = require('express');

const {
  getCheapestDestinations,
  getCommonDestinations,
  getCheapestWeekend,
} = require('./destinationsController');
const {
  validateRequestParamsOneOrigin,
  validateRequestParamsManyOrigins,
  validateRequestParamsWeekend,
  filterParams,
} = require('../common/validatorService');

const router = express.Router();

// router.route('/protect').get(protect, getSpecialProtectedRoute);
router
  .route('/cheapest')
  .get(filterParams, validateRequestParamsOneOrigin, getCheapestDestinations);
router
  .route('/common')
  .get(filterParams, validateRequestParamsManyOrigins, getCommonDestinations);

// TODO: params validation is missing
router
  .route('/cheapestWeekend')
  .get(filterParams, validateRequestParamsWeekend, getCheapestWeekend);
module.exports = router;
