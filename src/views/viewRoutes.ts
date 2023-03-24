import express from 'express';
import { filterParams } from '../middleware/validator/validatorService';
import viewController from './viewController';

export const router = express.Router();

router.get('/', viewController.getHome);

router.get('/search', viewController.getSearchPage);

router.get('/common', filterParams, viewController.searchFlights);

// TODO: param requests are not 'validated' here although they are validated on front-end
// we use filterParams to add an empty filter object on req parameter.
router.post('/common', filterParams, viewController.searchFlights);
