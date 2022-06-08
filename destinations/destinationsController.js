const { cleanItineraryData } = require('../utils/helper');
const groupByToMap = require('core-js-pure/actual/array/group-by-to-map');
const AppError = require('../utils/appError');
const { catchAsync, catchAsyncKiwi } = require('../utils/catchAsync');
const flightService = require('../data/flightService');
const axios = require('axios').default;
const isCommonDestination = (destination, origins) => {
  // for each origin ('every'), I want to find it at least once as an origin ('cityCodeFrom') in the list of flights corresponding to this destination ('destinations.get(key)')
  return origins.every(
    (origin) =>
      destination.findIndex((value) => value.cityCodeFrom === origin) > -1
  );
};

const prepareAxiosRequest = () => {
  return axios.create({
    baseURL: process.env.KIWI_URL,
    headers: {
      apikey: process.env.KIWI_API_KEY,
    },
    params: {
      max_stopovers: 2,
      partner_market: 'fr',
      lang: 'fr',
      limit: 1000,
      flight_type: 'round',
      ret_from_diff_airport: 0,
      ret_to_diff_airport: 0,
      one_for_city: 1,
      fly_to: 'anywhere',
    },
  });
};

const prepareItineraryData = (dest, itineraries) => {
  const itinerary = { cityTo: dest };

  // corresponding origins to that particular destination
  // itinerary.flights will have one item per origin
  itinerary.flights = itineraries.filter(
    (itinerary) => itinerary.cityTo === dest
  );

  // common to all origins, for that particular destination
  itinerary.countryTo = itinerary.flights[0].countryTo.name;
  itinerary.cityCodeTo = itinerary.flights[0].cityCodeTo;

  // compute total price
  itinerary.totalPrice = itinerary.flights.reduce(
    (sum, flight) => sum + flight.price,
    0
  );

  // total distance
  itinerary.totalDistance = itinerary.flights.reduce(
    (sum, flight) => sum + flight.distance,
    0
  );

  // total duration departure
  itinerary.totalDurationDepartureInMinutes = itinerary.flights.reduce(
    (sum, flight) => sum + flight.duration.departure / 60,
    0
  );

  // total duration return
  itinerary.totalDurationReturnInMinutes = itinerary.flights.reduce(
    (sum, flight) => sum + flight.duration['return'] / 60,
    0
  );

  return itinerary;
};

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
  // const adults = req.query.adults
  //   ? req.query.adults.split(',')
  //   : new Array(origins.length).fill(1);
  // const children = req.query.children
  //   ? req.query.children.split(',')
  //   : new Array(origins.length).fill(0);
  // const infants = req.query.infants
  //   ? req.query.infants.split(',')
  //   : new Array(origins.length).fill(0);

  // create one GET call for each origin
  const searchDestinations = allOriginsParams.map((params) =>
    flightService.getFlights(params)
  );

  const responses = await Promise.all(searchDestinations);

  // concat data coming from all the GET calls into one 'allResponses' variable
  // for eahc GET call, we concat the value from data.data (contain all he info for each itinerary)
  const allResponses = responses.reduce(
    (acc, curr) => acc.concat(curr.data.data),
    []
  );

  // remove unnecessary fields
  // FIXME: this operation takes 500-700 ms to complete, check inside cleanItineraryData

  // console.log(`${allResponses.length} itineraries need to be cleaned`);
  const itineraries = allResponses.map(cleanItineraryData);

  // group the array by field item.flyTo and extract all possible destinations
  // Array.groupByToMap is in stage 3 proposal
  // can be switched to lodash.groupBy (https://lodash.com/docs/4.17.15#groupBy)
  const destinations = groupByToMap(itineraries, (item) => {
    return item.cityTo;
  });

  // only the destinations that are common to all the origins in that request
  // i.e. if origins is ['JFK','LON', 'CDG'] and all origins have destination 'Dubai' but only 'JFK' and 'CDG' have destination 'Bangkok', only 'Dubai' will kept
  const filteredDestinationCities = Array.from(destinations.keys()).filter(
    (key) => isCommonDestination(destinations.get(key), origins)
  );

  console.log(
    `${filteredDestinationCities.length} common destinations found: ${filteredDestinationCities}`
  );

  // For each destination, have an array with the flights, total price and total distance and total duration
  // (preparing for display)
  const commonItineraries = filteredDestinationCities.map((dest) =>
    prepareItineraryData(dest, itineraries)
  );

  res.status(200).json({
    status: 'success',
    results: commonItineraries.length,
    data: commonItineraries,
  });
});

const getSpecialProtectedRoute = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'got access to protected route',
  });
});

module.exports = {
  getCheapestDestinations,
  getCommonDestinations,
  getSpecialProtectedRoute,
  prepareItineraryData,
};
