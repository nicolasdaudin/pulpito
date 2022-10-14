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

// flight.price has the total price for all passengers of that flight
// we want to compare with the price per adult
const filterByPriceRange = (itinerary, priceFrom, priceTo) => {
  let minPrice = 20000;
  let maxPrice = 0;
  if (itinerary.flights) {
    // if several origins
    minPrice = itinerary.flights.reduce(
      (min, flight) => Math.min(min, flight.fare.adults),
      minPrice
    );
    maxPrice = itinerary.flights.reduce(
      (max, flight) => Math.max(max, flight.fare.adults),
      maxPrice
    );
  } else {
    // if one origin
    minPrice = flight.fare.adults;
    maxPrice = flight.fare.adults;
  }

  return minPrice >= priceFrom && maxPrice <= priceTo;
};

/**
 * Returns an object with the necessary info to display the results and the search filters, like current sort parameter, min possible itinerary price, max possible price....
 * @param {*} itineraries
 * @param {*} filterParams
 */
const getFilters = (itineraries, filterParams) => {
  const minPossiblePrice = itineraries.reduce((min, itinerary) => {
    const tempMin = itinerary.flights.reduce((min, flight) => {
      // flight.price has the total price for all passengers of that flight
      // we want to compare with the price per adult
      return Math.min(min, flight.fare.adults);
    }, 20000);
    return Math.min(tempMin, min);
  }, 20000);

  const maxPossiblePrice = itineraries.reduce((max, itinerary) => {
    const tempMax = itinerary.flights.reduce(
      (max, flight) => Math.max(max, flight.fare.adults),
      0
    );
    return Math.max(tempMax, max);
  }, 0);

  const priceFrom = filterParams.priceFrom;
  const priceTo = filterParams.priceTo;
  const maxConnections = filterParams.maxConnections;
  return {
    minPossiblePrice,
    maxPossiblePrice,
    priceFrom,
    priceTo,
    maxConnections,
  };
};

/**
 * Returns a copy of itineraries with only itineraries that passed the different params in filterParams
 * @param {*} itineraries
 * @param {*} filterParams
 * @returns
 */
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
  if (!itineraries || !filterParams) return itineraries;

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

const buildNavigationUrlsFromRequest = (req, route, hasNextUrl) => {
  const urlSearchParamsBase = getCurrentUrlFromRequest(req);

  const { page, sort, priceFrom, priceTo, maxConnections } = req.filter;

  const currentPage = page ? +page : 1;
  const sortParam = sort ? `&sort=${sort}` : '';
  const priceFromParam = priceFrom ? `&priceFrom=${priceFrom}` : '';
  const priceToParam = priceTo ? `&priceTo=${priceTo}` : '';
  const maxConnectionsParam = maxConnections
    ? `&maxConnections=${maxConnections}`
    : '';

  const previousPage = currentPage - 1;
  const nextPage = currentPage + 1;

  const baseUrl = `${route}?${urlSearchParamsBase.toString()}${priceFromParam}${priceToParam}${maxConnectionsParam}`;

  const previous =
    previousPage > 0 ? `${baseUrl}&page=${previousPage}${sortParam}` : null;
  const next = hasNextUrl ? `${baseUrl}&page=${nextPage}${sortParam}` : null;

  const sortByPrice = sort !== 'price' ? `${baseUrl}&sort=price` : '';
  const sortByDistance = sort !== 'distance' ? `${baseUrl}&sort=distance` : '';

  const navigation = {
    previous,
    next,
    sort,
    sortByPrice,
    sortByDistance,
  };

  return navigation;
};

module.exports = {
  filter,
  paginate,
  sort,
  getCurrentUrlFromRequest,
  applyFilters,
  getFilters,
  fillAirportDescriptions,
  buildNavigationUrlsFromRequest,
};
