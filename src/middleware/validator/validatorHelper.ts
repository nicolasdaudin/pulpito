import {
  DEFAULT_FIRST_PAGE_OF_RESULT,
  DEFAULT_SORT_FIELD,
  RESULTS_SEARCH_LIMIT,
} from '../../config';
import { FilterParams, QueryParams } from '../../common/types';

export const getFilterParamsFromQueryParams = (
  query: QueryParams
): FilterParams => {
  const filter = {} as FilterParams;
  if (query.sort) {
    filter.sort = query.sort;
    delete query.sort;
  } else {
    filter.sort = DEFAULT_SORT_FIELD;
  }

  if (query.limit) {
    filter.limit = +query.limit;
    delete query.limit;
  } else {
    filter.limit = RESULTS_SEARCH_LIMIT;
  }

  if (query.page) {
    filter.page = +query.page;
    delete query.page;
  } else {
    filter.page = DEFAULT_FIRST_PAGE_OF_RESULT;
  }

  if (query.maxConnections) {
    filter.maxConnections = +query.maxConnections;
    delete query.maxConnections;
  }

  if (query.priceFrom) {
    filter.priceFrom = +query.priceFrom;
    delete query.priceFrom;
  }

  if (query.priceTo) {
    filter.priceTo = +query.priceTo;
    delete query.priceTo;
  }

  return filter;
};
