import helper from '../utils/apiHelper';
import { catchAsyncKiwi } from '../utils/catchAsync';
import flightService from '../data/flightService';
import destinationsService from './destinationsService';
import resultsHelper from '../utils/resultsHelper';

/**
 * Find cheapest destinations from this origin.
 * By default, if nothing is specified for adults, we search for 1 adult per destination.
 *
 * FIXME: improve error handling, check if some parameters do not exist ...
 *
 * @param {*} req
 * @param {*} res
 */
const getCheapestDestinations = catchAsyncKiwi(async (req, res) => {
  const params = helper.prepareDefaultAPIParams(req.query);

  const flights = await flightService.getFlights(params);

  let itineraries = flights.map(helper.cleanItineraryData);
  const totalResults = itineraries.length;
  itineraries = resultsHelper.applyFilters(itineraries, req.filter);

  res.status(200).json({
    status: 'success',
    totalResults,
    shownResults: itineraries.length,
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
const getCommonDestinations = catchAsyncKiwi(async (req, res) => {
  console.info(
    'API - Getting common destinations with these params',
    req.query
  );
  const allOriginsParams = helper.prepareSeveralOriginAPIParams(req.query);

  // const instance = prepareAxiosRequest();

  const origins = req.query.origin.split(',');

  let commonItineraries = await destinationsService.buildCommonItineraries(
    allOriginsParams,
    origins
  );
  const totalResults = commonItineraries.length;
  commonItineraries = resultsHelper.applyFilters(commonItineraries, req.filter);
  res.status(200).json({
    status: 'success',
    totalResults,
    shownResults: commonItineraries.length,
    data: commonItineraries,
  });
});

const getCheapestWeekend = catchAsyncKiwi(async (req, res) => {
  const params = helper.prepareDefaultAPIParams(req.query);

  const flights = await flightService.getWeekendFlights(params);

  let itineraries = flights.map(helper.cleanItineraryData);
  const totalResults = itineraries.length;

  itineraries = resultsHelper.applyFilters(itineraries, req.filter);

  res.status(200).json({
    status: 'success',
    totalResults,
    shownResults: itineraries.length,
    data: itineraries, //flights,
  });
});

export = { getCheapestDestinations, getCommonDestinations, getCheapestWeekend };
