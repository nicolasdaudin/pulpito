import express from 'express';

import {
  getCheapestDestinations,
  getCommonDestinations,
  getCheapestWeekend,
} from './destinationsController';
import {
  validateRequestParamsOneOrigin,
  validateRequestParamsManyOrigins,
  validateRequestParamsWeekend,
  filterParams,
} from '../common/validatorService';

export const router = express.Router();

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
