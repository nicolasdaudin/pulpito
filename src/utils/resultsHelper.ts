import {
  DestinationWithItineraries,
  FilterParams,
  Itinerary,
  RegularFlightsParams,
  WeekendFlightsParams,
} from '../common/types';
import cloneDeep from 'lodash.clonedeep';

import { RESULTS_SEARCH_LIMIT, DEFAULT_SORT_FIELD } from '../config';
import { Request } from 'express-serve-static-core';
import { TypedRequestQueryWithFilter } from '../common/interfaces';

/**
 * Checks if the itineraries for that destination have more than maxConnections
 * @param {*} destination the destination with its itineraries
 * @param {*} maxConnections max number of connections
 * @returns true if number of connections is less or equal to the allowed max number of connections
 */
const filterByMaxConnections = <T>(source: T, maxConnections: number) => {
  let nbConnections = 0;

  if (isDestinationWithItineraries(source)) {
    // if several origins
    nbConnections = source.itineraries.reduce(
      (max, itinerary) =>
        Math.max(
          max,
          itinerary.onewayRoute.connections.length,
          itinerary.returnRoute?.connections.length
        ),
      0
    );
  }

  if (isItinerary(source)) {
    nbConnections = Math.max(
      source.onewayRoute.connections.length,
      source.returnRoute?.connections.length
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
const filterByPriceRange = <T>(
  source: T,
  priceFrom: number,
  priceTo: number
) => {
  // flight.price has the total price for all passengers of that flight
  // we want to compare with the price per adult

  let minPrice = 20000;
  let maxPrice = 0;
  if (isDestinationWithItineraries(source)) {
    // if several origins
    minPrice = source.itineraries.reduce(
      (min, itinerary) => Math.min(min, itinerary.price),
      minPrice
    );
    maxPrice = source.itineraries.reduce(
      (max, itinerary) => Math.max(max, itinerary.price),
      maxPrice
    );
  }

  if (isItinerary(source)) {
    // if one origin
    minPrice = source.price;
    maxPrice = source.price;
  }

  return (
    (!priceFrom || minPrice >= priceFrom) && (!priceTo || maxPrice <= priceTo)
  );
};

/**
 * Returns an object with the necessary info to display the results and the search filters, like the filtered minimum price (requested by the user in the filterParams), the filtered maximum price (requested by the user in filterParams), the minimum possible itinerary price (out of all the itineraries), the maximum possible price (out of all the itineraries)....
 * Currently only works for search with several origins (getCommon) since it is the only one implemented in the webapp
 * @param {*} destinations
 * @param {*} filterParams
 * returns an object representing the filters used. Has the following properties: minPossiblePrice, maxPossiblePrice, priceFrom, priceTo, maxConnections
 */
const getFilters = (
  destinations: DestinationWithItineraries[],
  filterParams: FilterParams
) => {
  const minPossiblePrice = destinations.reduce((min, destination) => {
    const tempMin = destination.itineraries.reduce((min, itinerary) => {
      // itinerary.price has the total price for all passengers of that flight
      // we want to compare with the price per adult
      return Math.min(min, itinerary.price);
    }, 20000);
    return Math.min(tempMin, min);
  }, 20000);

  const maxPossiblePrice = destinations.reduce((max, destination) => {
    const tempMax = destination.itineraries.reduce(
      (max, itinerary) => Math.max(max, itinerary.price),
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
const filter = <T>(source: T[], filterParams: FilterParams) => {
  const resultAfterClone = cloneDeep(source);
  let result: Array<typeof resultAfterClone[number]> = resultAfterClone;

  // filter by max number of connections allowed on each individual flight
  if (filterParams.maxConnections !== undefined) {
    result = result.filter((itinerary: T) => {
      const filtered = filterByMaxConnections(
        itinerary,
        filterParams.maxConnections
      );
      return filtered;
    });
  }

  // filter by price range
  if (filterParams.priceFrom || filterParams.priceTo) {
    result = result.filter((itinerary: T) => {
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
const paginate = <T>(source: T[], filterParams: FilterParams) => {
  const page = filterParams.page ?? 1;
  const limit = filterParams.limit ?? RESULTS_SEARCH_LIMIT;
  return source.slice((page - 1) * limit, page * limit);
};

/**
 * Sort the itineraries according to filterParams.sort, if existing. Either distance or price
 * @param {*} itineraries the itineraries to be paginated
 * @param {*} filterParams the filters to apply. Specifically we use filterParams.sort (default DEFAULT_SORT_FIELD)
 * @returns a sorted copy of the itineraries
 */
const sort = <T extends { price: number; distance: number }>(
  source: T[],
  filterParams: FilterParams
) => {
  const resultAfterClone = cloneDeep(source);
  const sortBy = filterParams.sort ?? DEFAULT_SORT_FIELD;

  if (sortBy === 'price')
    return resultAfterClone.sort((a, b) => a.price - b.price);
  if (sortBy === 'distance')
    return resultAfterClone.sort((a, b) => a.distance - b.distance);
  return resultAfterClone.sort((a, b) => a.price - b.price);
};

/**
 * Apply the different filters (sort, paginate, filter...) in filterParams, in order
 * @param {*} itineraries itineraries to be filtered, sorted, paginated
 * @param {*} filterParams filters
 * @returns a copy of the itineraries
 */
const applyFilters = <T extends { price: number; distance: number }>(
  source: T[],
  filterParams: FilterParams
): T[] => {
  if (!source || !filterParams) return source;

  let filtered = filter(source, filterParams);
  filtered = sort(filtered, filterParams);
  filtered = paginate(filtered, filterParams);
  return filtered;
};

/**
 * Gets the current base url from the request object
 * @param {*} req
 * @returns a URLSearchPArams object representing the current url for that request
 */
const getCurrentUrlFromRequest = (req: Request) => {
  const urlSearchParamsBase = new URLSearchParams();
  const { departureDate, returnDate, origins } = req.body?.departureDate
    ? req.body
    : req.query;
  if (departureDate) urlSearchParamsBase.append('departureDate', departureDate);
  if (returnDate) urlSearchParamsBase.append('returnDate', returnDate);
  if (origins) {
    origins.flyFrom.forEach((_: any, i: number) => {
      urlSearchParamsBase.append('origins[][flyFrom]', origins.flyFrom[i]);
      urlSearchParamsBase.append('origins[][adults]', origins.adults[i]);
      urlSearchParamsBase.append('origins[][children]', origins.children[i]);
      urlSearchParamsBase.append('origins[][infants]', origins.infants[i]);
    });
  }
  return urlSearchParamsBase;
};

/**
 * Buils the different navigation url for that next request
 * @param {*} req the express req object
 * @param {*} route the current route
 * @param {*} hasNextUrl true if we should add a next url
 * @returns an object representing the navigation links, with the following properties: previous, next, sort, sortByPrice, sortByDistance. Each property has an URL based on the base current url.
 */
const buildNavigationUrlsFromRequest = (
  req: TypedRequestQueryWithFilter<RegularFlightsParams | WeekendFlightsParams>,
  route: string,
  hasNextUrl: boolean
) => {
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

const isItinerary = (value: unknown): value is Itinerary => {
  return (value as Itinerary).onewayRoute !== undefined;
};
const isDestinationWithItineraries = (
  value: unknown
): value is DestinationWithItineraries => {
  return (value as DestinationWithItineraries).itineraries !== undefined;
};

export = {
  filterByMaxConnections,
  filterByPriceRange,
  filter,
  paginate,
  sort,
  getCurrentUrlFromRequest,
  applyFilters,
  getFilters,
  buildNavigationUrlsFromRequest,
};
