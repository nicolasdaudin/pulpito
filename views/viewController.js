const destinationsService = require('../destinations/destinationsService');
const { catchAsync, catchAsyncKiwi } = require('../utils/catchAsync');
const DateTime = require('luxon').DateTime;
const airportService = require('../airports/airportService');
const helper = require('../utils/apiHelper');
const resultsHelper = require('../utils/resultsHelper');
const { RESULTS_SEARCH_LIMIT } = require('../config');

exports.getHome = (req, res) => {
  res.render('home');
};

exports.getCommon = catchAsync(async (req, res, next) => {
  console.log('getCommon req.query', req.query);
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
    let commonItineraries = await destinationsService.buildCommonItineraries(
      allOriginParams,
      originCodes
    );
    const filters = resultsHelper.getFilters(commonItineraries, req.filter);
    console.log('searchFlights filters', filters);

    commonItineraries = resultsHelper.applyFilters(
      commonItineraries,
      req.filter
    );

    req.query.origins.flyFromDesc = resultsHelper.fillAirportDescriptions(
      req.query.origins.flyFrom
    );

    const navigation = resultsHelper.buildNavigationUrlsFromRequest(
      req,
      `/common`,
      commonItineraries.length === RESULTS_SEARCH_LIMIT
    );

    res.status(200).render('common', {
      status: 'success',
      results: commonItineraries.length,
      data: commonItineraries,
      request: req.query,
      filters,
      navigation,
    });
  } catch (err) {
    res.status(err.response.status).render('common', {
      status: 'error',
      results: 0,
      error: err.response.data.error,
    });
  }
});

exports.searchFlights = catchAsync(async (req, res, next) => {
  const allOriginParams = helper.prepareSeveralOriginAPIParamsFromView(
    req.body
  );

  const originCodes = req.body.origins.flyFrom;

  try {
    let commonItineraries = await destinationsService.buildCommonItineraries(
      allOriginParams,
      originCodes
    );

    const filters = resultsHelper.getFilters(commonItineraries, req.filter);
    console.log('searchFlights filters', filters);
    commonItineraries = resultsHelper.applyFilters(
      commonItineraries,
      req.filter
    );

    req.body.origins.flyFromDesc = resultsHelper.fillAirportDescriptions(
      req.body.origins.flyFrom
    );

    const navigation = resultsHelper.buildNavigationUrlsFromRequest(
      req,
      `/common`,
      commonItineraries.length === RESULTS_SEARCH_LIMIT
    );

    // const commonItineraries = [];
    res.status(200).render('common', {
      status: 'success',
      results: commonItineraries.length,
      data: commonItineraries,
      request: req.body,
      filters,
      navigation,
    });
  } catch (err) {
    console.error(err);
    res.status(err.response?.status ?? 500).render('common', {
      status: 'error',
      results: 0,
      error: err.response?.data.error ?? err.message,
    });
  }
});
