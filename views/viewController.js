const destinationsService = require('../destinations/destinationsService');
const { catchAsync, catchAsyncKiwi } = require('../utils/catchAsync');
const DateTime = require('luxon').DateTime;
const airportService = require('../airports/airportService');
const helper = require('../utils/apiHelper');

exports.getHome = (req, res) => {
  res.render('home');
};

exports.getCommon = catchAsync(async (req, res, next) => {
  if (!req.query || !req.query.origins) {
    return res.status(200).render('common', {
      status: 'success',
      results: 0,
      data: [],
    });
  }

  const allOriginParams = helper.prepareSeveralOriginAPIParamsFromView(
    req.query
  );

  const originCodes = req.query.origins.flyFrom;

  try {
    const commonItineraries = await destinationsService.buildCommonItineraries(
      allOriginParams,
      originCodes
    );

    req.query.origins.flyFromDesc = req.query.origins.flyFrom.map(
      (iataCode) => {
        const airportInfo = airportService.findByIataCode(iataCode);
        return `${airportInfo.municipality} - ${airportInfo.name} (${airportInfo.iata_code}) - ${airportInfo.country}`;
      }
    );

    // const commonItineraries = [];
    res.status(200).render('common', {
      status: 'success',
      results: commonItineraries.length,
      data: commonItineraries,
      request: req.query,
    });
  } catch (err) {
    res.status(err.response.status).render('common', {
      status: 'error',
      results: 0,
      error: err.response.data.error,
    });
  }
});

exports.getFlights = catchAsync(async (req, res, next) => {
  const allOriginParams = helper.prepareSeveralOriginAPIParamsFromView(
    req.body
  );

  const originCodes = req.body.origins.flyFrom;

  try {
    const commonItineraries = await destinationsService.buildCommonItineraries(
      allOriginParams,
      originCodes
    );

    req.body.origins.flyFromDesc = req.body.origins.flyFrom.map((iataCode) => {
      const airportInfo = airportService.findByIataCode(iataCode);
      return `${airportInfo.municipality} - ${airportInfo.name} (${airportInfo.iata_code}) - ${airportInfo.country}`;
    });

    // const commonItineraries = [];
    res.status(200).render('common', {
      status: 'success',
      results: commonItineraries.length,
      data: commonItineraries,
      request: req.body,
    });
  } catch (err) {
    res.status(err.response.status).render('common', {
      status: 'error',
      results: 0,
      error: err.response.data.error,
    });
  }
});
