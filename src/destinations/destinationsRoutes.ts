import express from 'express';

import destinationsController from './destinationsController';
import validatorService from '../common/validatorService';

export const router = express.Router();

// router.route('/protect').get(protect, getSpecialProtectedRoute);
router
  .route('/cheapest')
  .get(
    validatorService.filterParams,
    validatorService.validateRequestParamsOneOrigin,
    destinationsController.getCheapestDestinations
  );
router
  .route('/common')
  .get(
    validatorService.filterParams,
    validatorService.validateRequestParamsManyOrigins,
    destinationsController.getCommonDestinations
  );

// TODO: params validation is missing
router
  .route('/cheapestWeekend')
  .get(
    validatorService.filterParams,
    validatorService.validateRequestParamsWeekend,
    destinationsController.getCheapestWeekend
  );
