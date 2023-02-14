import express from 'express';

import { getAirports } from './airportController';

export const router = express.Router();

router.get('/', getAirports);
