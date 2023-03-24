import express from 'express';

import destinationsController from './destinationsController';
import {
  validateRequestParamsManyOrigins,
  validateRequestParamsOneOrigin,
  validateRequestParamsWeekend,
  filterParams,
} from '../middleware/validator/validatorService';

export const router = express.Router();

// router.route('/protect').get(protect, getSpecialProtectedRoute);
router
  .route('/cheapest')
  .get(
    filterParams,
    validateRequestParamsOneOrigin,
    destinationsController.getCheapestDestinations
  );
router
  .route('/common')
  .get(
    filterParams,
    validateRequestParamsManyOrigins,
    destinationsController.getCommonDestinations
  );

// TODO: params validation is missing
router
  .route('/cheapestWeekend')
  .get(
    filterParams,
    validateRequestParamsWeekend,
    destinationsController.getCheapestWeekend
  );
