const helper = require('../utils/apiHelper');
const groupByToMap = require('core-js-pure/actual/array/group-by-to-map');
const AppError = require('../utils/appError');
const { catchAsync, catchAsyncKiwi } = require('../utils/catchAsync');
const flightService = require('../data/flightService');
const destinationsService = require('./destinationsService');
const resultsHelper = require('../utils/resultsHelper');

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
  const params = helper.prepareDefaultAPIParams(req.query);

  const response = await flightService.getFlights(params);
  // console.log('response.data.data', response.data.data);
  let itineraries = response.data.data.map(helper.cleanItineraryData);

  itineraries = resultsHelper.paginate(itineraries, req.filter);

  res.status(200).json({
    status: 'success',
    results: itineraries.length, //response.data.data.length,
    data: itineraries, //itineraries,
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
  console.log('req.query', req.query);
  console.log('req.filter', req.filter);

  const allOriginsParams = helper.prepareSeveralOriginAPIParams(req.query);

  // const instance = prepareAxiosRequest();

  const origins = req.query.origin.split(',');

  let commonItineraries = await destinationsService.buildCommonItineraries(
    allOriginsParams,
    origins
  );

  // console.log('buildComm... filterParams', filterParams);
  // console.log('buildComm... commonItineraries', commonItineraries.length);

  // console.log('page,limit', page, limit);
  commonItineraries = resultsHelper.paginate(commonItineraries, req.filter);
  // console.log('buildComm... commonItineraries', commonItineraries.length);

  res.status(200).json({
    status: 'success',
    results: commonItineraries.length,
    data: commonItineraries,
  });
});

const getCheapestWeekend = catchAsyncKiwi(async (req, res, next) => {
  const params = helper.prepareDefaultAPIParams(req.query);

  const response = await flightService.getWeekendFlights(params);
  // console.log('request.params', response.request.path);
  // console.log('response.data.data', response.data.data);
  let itineraries = response.data.data.map(helper.cleanItineraryData);

  itineraries = resultsHelper.paginate(itineraries, req.filter);

  res.status(200).json({
    status: 'success',
    results: itineraries.length, //response.data.data.length,
    data: itineraries, //flights,
  });
});

module.exports = {
  getCheapestDestinations,
  getCommonDestinations,
  getCheapestWeekend,
};
