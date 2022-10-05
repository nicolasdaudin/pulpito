const { RESULTS_SEARCH_LIMIT, DEFAULT_SORT_FIELD } = require('../config');
const airportService = require('../airports/airportService');
const { filterParams } = require('../common/validatorService');

const filterByMaxConnections = (itinerary, maxConnections) => {
  let nbConnections = 0;
  if (itinerary.flights) {
    // if several origins
    nbConnections = itinerary.flights.reduce(
      (max, flight) =>
        Math.max(
          max,
          flight.route.oneway.connections.length,
          flight.route.return.connections.length
        ),
      0
    );
  } else {
    nbConnections = Math.max(
      flight.route.oneway.connections.length,
      flight.route.return.connections.length
    );
  }
  return nbConnections <= maxConnections;
};

const filterByPriceRange = (itinerary, priceFrom, priceTo) => {
  let minPrice = 2000;
  let maxPrice = 0;
  if (itinerary.flights) {
    // if several origins
    minPrice = itinerary.flights.reduce(
      (min, flight) => Math.min(min, flight.price),
      minPrice
    );
    maxPrice = itinerary.flights.reduce(
      (max, flight) => Math.max(max, flight.price),
      maxPrice
    );
  } else {
    // if one origin
    minPrice = flight.price;
    maxPrice = flight.price;
  }

  return minPrice >= priceFrom && maxPrice <= priceTo;
};

const filter = (itineraries, filterParams) => {
  let result = JSON.parse(JSON.stringify(itineraries));

  // filter by max number of connections allowed on each individual flight
  if (filterParams.maxConnections) {
    console.log(result.length);
    result = result.filter((itinerary) => {
      const filtered = filterByMaxConnections(
        itinerary,
        filterParams.maxConnections
      );
      return filtered;
    });
    console.log(result.length);
  }

  // filter by price range
  if (filterParams.priceFrom) {
    result = result.filter((itinerary) => {
      const filtered = filterByPriceRange(
        itinerary,
        filterParams.priceFrom,
        filterParams.priceTo
      );
      return filtered;
    });
  }

  return result;
};

// TODO : refactor all of this as an ES6 class holding the itineraries on which we could apply paginate and sort methods...
const paginate = (itineraries, filterParams) => {
  const page = filterParams.page ?? 1;
  const limit = filterParams.limit ?? RESULTS_SEARCH_LIMIT;
  const result = JSON.parse(JSON.stringify(itineraries));
  return result.slice((page - 1) * limit, page * limit);
  // return result;
};

const sort = (itineraries, filterParams) => {
  const sortBy = filterParams.sort ?? DEFAULT_SORT_FIELD;
  const result = JSON.parse(JSON.stringify(itineraries));
  if (sortBy === 'price') return result.sort((a, b) => a.price - b.price);
  if (sortBy === 'distance')
    return result.sort((a, b) => a.distance - b.distance);
  return result.sort((a, b) => a.price - b.price);
};

const applyFilters = (itineraries, filterParams) => {
  console.log('applyfilters - filterParams', filterParams);
  let filtered = filter(itineraries, filterParams);
  filtered = sort(filtered, filterParams);
  filtered = paginate(filtered, filterParams);
  return filtered;
};

const getCurrentUrlFromRequest = (req) => {
  const urlSearchParamsBase = new URLSearchParams();
  const { departureDate, returnDate, origins } = req.body?.departureDate
    ? req.body
    : req.query;
  if (departureDate) urlSearchParamsBase.append('departureDate', departureDate);
  if (returnDate) urlSearchParamsBase.append('returnDate', returnDate);
  if (origins) {
    origins.flyFrom.forEach((_, i) => {
      urlSearchParamsBase.append('origins[][flyFrom]', origins.flyFrom[i]);
      urlSearchParamsBase.append('origins[][adults]', origins.adults[i]);
      urlSearchParamsBase.append('origins[][children]', origins.children[i]);
      urlSearchParamsBase.append('origins[][infants]', origins.infants[i]);
    });
  }
  return urlSearchParamsBase;
};

const fillAirportDescriptions = (iataCodes) => {
  return iataCodes.map((iataCode) => {
    const airportInfo = airportService.findByIataCode(iataCode);
    return `${airportInfo.municipality} - ${airportInfo.name} (${airportInfo.iata_code}) - ${airportInfo.country}`;
  });
};

const buildNavigationUrlsFromRequest = (req, baseUrl, hasNextUrl) => {
  const urlSearchParamsBase = getCurrentUrlFromRequest(req);
  console.log(
    'buildNavigationUrlsFromRequest - req.filter.page',
    req.filter.page
  );

  const currentPage = req.filter.page ? +req.filter.page : 1;
  const sortParam = req.filter.sort ? `&sort=${req.filter.sort}` : '';

  const previousPage = currentPage - 1;
  const nextPage = currentPage + 1;

  const previous =
    previousPage > 0
      ? `${baseUrl}?${urlSearchParamsBase.toString()}&page=${previousPage}${sortParam}`
      : null;
  const next = hasNextUrl
    ? `${baseUrl}?${urlSearchParamsBase.toString()}&page=${nextPage}${sortParam}`
    : null;

  const sortByPrice = `${baseUrl}?${urlSearchParamsBase.toString()}&sort=price`;
  const sortByDistance = `${baseUrl}?${urlSearchParamsBase.toString()}&sort=distance`;

  console.log('buildNavigationUrlsFromRequest - previous', previous);
  console.log('buildNavigationUrlsFromRequest - next', next);
  console.log('buildNavigationUrlsFromRequest - sortParam', sortParam);
  console.log('buildNavigationUrlsFromRequest - sortByPrice', sortByPrice);
  console.log(
    'buildNavigationUrlsFromRequest - sortByDistance',
    sortByDistance
  );

  return {
    previous,
    next,
    sortByPrice,
    sortByDistance,
  };
};

module.exports = {
  filter,
  paginate,
  sort,
  getCurrentUrlFromRequest,
  applyFilters,
  fillAirportDescriptions,
  buildNavigationUrlsFromRequest,
};
