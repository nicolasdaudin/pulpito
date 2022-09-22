const express = require('express');

const {
  getCheapestDestinations,
  getCommonDestinations,
  getCheapestWeekend,
} = require('./destinationsController');
const {
  validateRequestParamsOneOrigin,
  validateRequestParamsManyOrigins,
  filterParams,
} = require('../common/validatorService');

const { protect } = require('../user/authController');

const router = express.Router();

// router.route('/protect').get(protect, getSpecialProtectedRoute);
router
  .route('/cheapest')
  .get(validateRequestParamsOneOrigin, getCheapestDestinations);
router
  .route('/common')
  .get(filterParams, validateRequestParamsManyOrigins, getCommonDestinations);

router.route('/cheapestWeekend').get(getCheapestWeekend);
module.exports = router;
