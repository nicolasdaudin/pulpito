const { RESULTS_SEARCH_LIMIT, DEFAULT_SORT_FIELD } = require('../config');
const airportService = require('../airports/airportService');

/**
 * Checks if the flights for that itinerary have more than maxConnections
 * @param {*} itinerary the itinerary
 * @param {*} maxConnections max number of connections
 * @returns true if number of connections is less or equal to the allowed max number of connections
 */
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
      itinerary.route.oneway.connections.length,
      itinerary.route.return.connections.length
    );
  }
  return nbConnections <= maxConnections;
};

/**
 * Checks if all flight for that itinerary are inside a price range
 * @param {*} itinerary itinerary
 * @param {*} priceFrom price lower limit
 * @param {*} priceTo price upper limit
 * @returns true if flight prices are above priceFrom and below priceTo
 */
const filterByPriceRange = (itinerary, priceFrom, priceTo) => {
  // flight.price has the total price for all passengers of that flight
  // we want to compare with the price per adult

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
    minPrice = itinerary.fare.adults;
    maxPrice = itinerary.fare.adults;
  }

  return (
    (!priceFrom || minPrice >= priceFrom) && (!priceTo || maxPrice <= priceTo)
  );
};

/**
 * Returns an object with the necessary info to display the results and the search filters, like current sort parameter, min possible itinerary price, max possible price....
 * @param {*} itineraries
 * @param {*} filterParams
 * returns an object representing the filters used. Has the following properties: minPossiblePrice, maxPossiblePrice, priceFrom, priceTo, maxConnections
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
 * Filteres itineraries that passed the different params in filterParams
 * @param {*} itineraries the itineraris to be filtered
 * @param {*} filterParams the filters to apply to the itineraries (maxConnections, priceFrom, ...)
 * @returns a copy of the itineraries after filtering
 */
const filter = (itineraries, filterParams) => {
  let result = JSON.parse(JSON.stringify(itineraries));

  // filter by max number of connections allowed on each individual flight
  if (filterParams.maxConnections) {
    result = result.filter((itinerary) => {
      const filtered = filterByMaxConnections(
        itinerary,
        filterParams.maxConnections
      );
      return filtered;
    });
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

/**
 * Paginate the itineraries according to filterParams.page and filterParams.limit, if existing
 * @param {*} itineraries the itineraries to be paginated
 * @param {*} filterParams the filters to apply. Specifically we use filterParams.page (default 1) and filterParams.limit (default RESULTS_SEARCH_LIMIT)
 * @returns a paginated copy of the itineraries
 */
const paginate = (itineraries, filterParams) => {
  const page = filterParams.page ?? 1;
  const limit = filterParams.limit ?? RESULTS_SEARCH_LIMIT;
  const result = JSON.parse(JSON.stringify(itineraries));
  return result.slice((page - 1) * limit, page * limit);
  // return result;
};

/**
 * Sort the itineraries according to filterParams.sort, if existing. Either distance or price
 * @param {*} itineraries the itineraries to be paginated
 * @param {*} filterParams the filters to apply. Specifically we use filterParams.sort (default DEFAULT_SORT_FIELD)
 * @returns a sorted copy of the itineraries
 */
const sort = (itineraries, filterParams) => {
  const sortBy = filterParams.sort ?? DEFAULT_SORT_FIELD;
  const result = JSON.parse(JSON.stringify(itineraries));
  if (sortBy === 'price') return result.sort((a, b) => a.price - b.price);
  if (sortBy === 'distance')
    return result.sort((a, b) => a.distance - b.distance);
  return result.sort((a, b) => a.price - b.price);
};

/**
 * Apply the different filters (sort, paginate, filter...) in filterParams, in order
 * @param {*} itineraries itineraries to be filtered, sorted, paginated
 * @param {*} filterParams filters
 * @returns a copy of the itineraries
 */
const applyFilters = (itineraries, filterParams) => {
  if (!itineraries || !filterParams) return itineraries;

  let filtered = filter(itineraries, filterParams);
  filtered = sort(filtered, filterParams);
  filtered = paginate(filtered, filterParams);
  return filtered;
};

/**
 * Gets the current base url from the request object
 * @param {*} req
 * @returns a URLSearchPArams object representing the current url for that request
 */
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

/**
 * When a user searches for the first time, airport info are retrieved from frontend thanks to a call to /api/vX/airports/?q= ....airportTo avoid calling
 * When the search is answered, the front is rerendered. Part of it is the search form, that we refill with the data used by the user.
 * To avoid to make a new call to /api airports, we just prefill the airport descriptions for the airports chosen by the user.
 * @param {*} iataCodes city iata codes chosen by the user
 * @returns array with the airport descrptions for each iata code
 */
const fillAirportDescriptions = (iataCodes) => {
  return iataCodes.map((iataCode) => {
    const airportInfo = airportService.findByIataCode(iataCode);
    return `${airportInfo.municipality} - ${airportInfo.name} (${airportInfo.iata_code}) - ${airportInfo.country}`;
  });
};

/**
 * Buils the different navigation url for that next request
 * @param {*} req the express req object
 * @param {*} route the current route
 * @param {*} hasNextUrl true if we should add a next url
 * @returns an object representing the navigation links, with the following properties: previous, next, sort, sortByPrice, sortByDistance. Each property has an URL based on the base current url.
 */
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
