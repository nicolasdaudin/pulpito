const destinationsService = require('../destinations/destinationsService');
const { catchAsync, catchAsyncKiwi } = require('../utils/catchAsync');
const DateTime = require('luxon').DateTime;
const airportService = require('../airports/airportService');
const helper = require('../utils/apiHelper');
const resultsHelper = require('../utils/resultsHelper');
const { RESULTS_SEARCH_LIMIT } = require('../config');

exports.getHome = (req, res) => {
  if (req.query.lang) {
    const lang = req.query.lang;
    res.cookie('lang', lang, { maxAge: 900000 });
  }
  res.status(200).render('home');
};

exports.getSearchPage = (req, res) => {
  res.status(200).render('search', {
    status: 'success',
    results: 0,
    data: [],
  });
};

exports.searchFlights = catchAsync(async (req, res, next) => {
  const requestParams = req.body && req.body.origins ? req.body : req.query;
  console.log('searchFlights requestParams', requestParams);

  if (!requestParams || !requestParams.origins) {
    return res.status(200).render('search', {
      status: 'success',
      results: 0,
      data: [],
    });
  }

  const allOriginParams =
    helper.prepareSeveralOriginAPIParamsFromView(requestParams);

  const originCodes = requestParams.origins.flyFrom;

  try {
    let commonItineraries = await destinationsService.buildCommonItineraries(
      allOriginParams,
      originCodes
    );

    const filters = resultsHelper.getFilters(commonItineraries, req.filter);

    commonItineraries = resultsHelper.applyFilters(
      commonItineraries,
      req.filter
    );

    requestParams.origins.flyFromDesc = resultsHelper.fillAirportDescriptions(
      requestParams.origins.flyFrom
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
      request: requestParams,
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
