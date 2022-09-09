const { cleanItineraryData } = require('../utils/apiHelper');
const groupByToMap = require('core-js-pure/actual/array/group-by-to-map');
const AppError = require('../utils/appError');
const { catchAsync, catchAsyncKiwi } = require('../utils/catchAsync');
const flightService = require('../data/flightService');
const axios = require('axios').default;
const destinationsService = require('./destinationsService');

/**
 * Find cheapest destinations from this origin.
 * By default, if nothing is specified for adults, we search for 1 adult per destination.
 *
 * FIXME: improve error handling, check if some parameters do not exist ...
 *
 * @param {*} req
 * @param {*} res
 */
const getCheapestDestinations = catchAsyncKiwi(async (req, res, next) => {
  const params = flightService.prepareDefaultParams(req.query);

  const response = await flightService.getFlights(params);
  // console.log('response.data.data', response.data.data);

  const flights = response.data.data.map(cleanItineraryData);

  res.status(200).json({
    status: 'success',
    results: flights.length, //response.data.data.length,
    data: flights, //flights,
  });
});

/**
 * Find common destinations to several origins.
 * By default, if nothing is specified for adults, we search for 1 adult per destination.
 *
 * FIXME: improve error handling, check if some parameters do not exist ...
 * @param {*} req
 * @param {*} res
 */
const getCommonDestinations = catchAsyncKiwi(async (req, res, next) => {
  const allOriginsParams = flightService.prepareSeveralOriginParams(req.query);

  // const instance = prepareAxiosRequest();

  const origins = req.query.origin.split(',');

  const commonItineraries = await destinationsService.buildCommonItineraries(
    allOriginsParams,
    origins
  );

  res.status(200).json({
    status: 'success',
    results: commonItineraries.length,
    data: commonItineraries,
  });
});

const getCheapestWeekend = catchAsyncKiwi(async (req, res, next) => {
  const params = flightService.prepareDefaultParams(req.query);

  const response = await flightService.getWeekendFlights(params);
  console.log('request.params', response.request.path);
  // console.log('response.data.data', response.data.data);

  const flights = response.data.data.map(cleanItineraryData);

  res.status(200).json({
    status: 'success',
    results: flights.length, //response.data.data.length,
    data: flights, //flights,
  });
});

module.exports = {
  getCheapestDestinations,
  getCommonDestinations,
  getCheapestWeekend,
};
