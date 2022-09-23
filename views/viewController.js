const destinationsService = require('../destinations/destinationsService');
const { catchAsync, catchAsyncKiwi } = require('../utils/catchAsync');
const DateTime = require('luxon').DateTime;
const airportService = require('../airports/airportService');
const helper = require('../utils/apiHelper');
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
    const commonItineraries = await destinationsService.buildCommonItineraries(
      allOriginParams,
      originCodes,
      req.filter
    );

    req.query.origins.flyFromDesc = req.query.origins.flyFrom.map(
      (iataCode) => {
        const airportInfo = airportService.findByIataCode(iataCode);
        return `${airportInfo.municipality} - ${airportInfo.name} (${airportInfo.iata_code}) - ${airportInfo.country}`;
      }
    );

    console.log('getCommon req.query', req.query);

    const urlSearchParamsBase = new URLSearchParams();
    const { departureDate, returnDate, origins } = req.query;
    if (departureDate)
      urlSearchParamsBase.append('departureDate', departureDate);
    if (returnDate) urlSearchParamsBase.append('returnDate', returnDate);
    if (origins) {
      origins.flyFrom.forEach((_, i) => {
        urlSearchParamsBase.append('origins[][flyFrom]', origins.flyFrom[i]);
        urlSearchParamsBase.append('origins[][adults]', origins.adults[i]);
        urlSearchParamsBase.append('origins[][children]', origins.children[i]);
        urlSearchParamsBase.append('origins[][infants]', origins.infants[i]);
      });
    }
    console.log(
      'getCommon urlSearchParamsBase',
      urlSearchParamsBase.toString()
    );

    console.log('req.filter.page', req.filter.page);
    const previousPage = +req.filter.page - 1;
    const nextPage = +req.filter.page + 1;
    const previous =
      previousPage > 0
        ? `/common?${urlSearchParamsBase.toString()}&page=${previousPage}`
        : null;
    const next =
      commonItineraries.length === RESULTS_SEARCH_LIMIT
        ? `/common?${urlSearchParamsBase.toString()}&page=${nextPage}`
        : null;

    console.log('previous', previous);
    console.log('next', next);
    // const commonItineraries = [];
    res.status(200).render('common', {
      status: 'success',
      results: commonItineraries.length,
      data: commonItineraries,
      request: req.query,
      pagination: {
        previous,
        next,
      },
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
    const commonItineraries = await destinationsService.buildCommonItineraries(
      allOriginParams,
      originCodes
    );

    req.body.origins.flyFromDesc = req.body.origins.flyFrom.map((iataCode) => {
      const airportInfo = airportService.findByIataCode(iataCode);
      return `${airportInfo.municipality} - ${airportInfo.name} (${airportInfo.iata_code}) - ${airportInfo.country}`;
    });

    console.log('searchFlights req.body', req.body);

    const urlSearchParamsBase = new URLSearchParams();
    const { departureDate, returnDate, origins } = req.body;
    if (departureDate)
      urlSearchParamsBase.append('departureDate', departureDate);
    if (returnDate) urlSearchParamsBase.append('returnDate', returnDate);
    if (origins) {
      origins.flyFrom.forEach((_, i) => {
        urlSearchParamsBase.append('origins[][flyFrom]', origins.flyFrom[i]);
        urlSearchParamsBase.append('origins[][adults]', origins.adults[i]);
        urlSearchParamsBase.append('origins[][children]', origins.children[i]);
        urlSearchParamsBase.append('origins[][infants]', origins.infants[i]);
      });
    }

    urlSearchParamsBase.append('page', 2);
    console.log(
      'searchFlights urlSearchParamsBase',
      urlSearchParamsBase.toString()
    );

    // const commonItineraries = [];
    res.status(200).render('common', {
      status: 'success',
      results: commonItineraries.length,
      data: commonItineraries,
      request: req.body,
      pagination: {
        next: '/common?' + urlSearchParamsBase.toString(),
      },
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
