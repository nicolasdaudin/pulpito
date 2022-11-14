const destinationsService = require('../destinations/destinationsService');
const { catchAsyncKiwi } = require('../utils/catchAsync');
const helper = require('../utils/apiHelper');
const resultsHelper = require('../utils/resultsHelper');
const { RESULTS_SEARCH_LIMIT } = require('../config');

/**
 * Home route for interface
 * @param {*} req
 * @param {*} res
 */
exports.getHome = (req, res) => {
  res.status(200).render('home');
};

/**
 * Search page route for interface, before filling the form
 * @param {*} req
 * @param {*} res
 */
exports.getSearchPage = (req, res) => {
  res.status(200).render('search', {
    status: 'success',
    totalResults: 0,
    shownResults: 0,
    data: [],
  });
};

/**
 * Search page route for interface, with results from the search
 */
exports.searchFlights = catchAsyncKiwi(async (req, res, next) => {
  const requestParams = req.body && req.body.origins ? req.body : req.query;

  if (!requestParams || !requestParams.origins) {
    return res.status(200).render('search', {
      status: 'success',
      totalResults: 0,
      shownResults: 0,
      data: [],
    });
  }
  console.info(
    'UX - Getting common destinations with these params',
    requestParams
  );

  const allOriginParams =
    helper.prepareSeveralOriginAPIParamsFromView(requestParams);

  const originCodes = requestParams.origins.flyFrom;

  try {
    let commonItineraries = await destinationsService.buildCommonItineraries(
      allOriginParams,
      originCodes
    );
    const totalResults = commonItineraries.length;

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
      totalResults,
      shownResults: commonItineraries.length,
      data: commonItineraries,
      request: requestParams,
      filters,
      navigation,
    });
  } catch (err) {
    console.error(err);
    res.status(err.response?.status ?? 500).render('common', {
      status: 'error',
      totalResults: 0,
      shownResults: 0,
      error: err.response?.data.error ?? err.message,
      request: requestParams,
    });
  }
});
