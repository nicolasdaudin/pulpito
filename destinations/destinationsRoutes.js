const express = require('express');

const {
  getCheapestDestinations,
  getCommonDestinations,
} = require('./destinationsController');
const {
  validateRequestParamsOneOrigin,
  validateRequestParamsManyOrigins,
} = require('../utils/validator');
const { protect } = require('../user/authController');

const router = express.Router();

// router.route('/protect').get(protect, getSpecialProtectedRoute);
router
  .route('/cheapest')
  .get(validateRequestParamsOneOrigin, getCheapestDestinations);
router
  .route('/common')
  .get(validateRequestParamsManyOrigins, getCommonDestinations);

module.exports = router;
