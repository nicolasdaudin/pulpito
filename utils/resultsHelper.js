const { RESULTS_SEARCH_LIMIT, DEFAULT_SORT_FIELD } = require('../config');

// TODO : refactor all of this as an ES6 class holding the itineraries on which we could apply paginate and sort methods...

const paginate = (itineraries, filterParams) => {
  const page = filterParams?.page ?? 1;
  const limit = filterParams?.limit ?? RESULTS_SEARCH_LIMIT;
  const result = JSON.parse(JSON.stringify(itineraries));
  return result.slice((page - 1) * limit, page * limit);
  // return result;
};

const sort = (itineraries, filterParams) => {
  const sortBy = filterParams?.sort ?? DEFAULT_SORT_FIELD;
  const result = JSON.parse(JSON.stringify(itineraries));
  if (sortBy === 'price') return result.sort((a, b) => a.price - b.price);
  if (sortBy === 'distance')
    return result.sort((a, b) => a.distance - b.distance);
  return result.sort((a, b) => a.price - b.price);
};

const applyFilters = (itineraries, filterParams) => {
  console.log('applyfilters - filterParams', filterParams);
  let filtered = sort(itineraries, filterParams);
  filtered = paginate(filtered, filterParams);
  return filtered;
};

const getURLFromRequest = (req) => {
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

module.exports = {
  paginate,
  sort,
  getURLFromRequest,
  applyFilters,
};
