import { RegularFlightsParams } from '../../common/types';
import {
  DEFAULT_FIRST_PAGE_OF_RESULT,
  DEFAULT_SORT_FIELD,
  RESULTS_SEARCH_LIMIT,
} from '../../config';
import { getFilterParamsFromQueryParams } from './validatorHelper';

describe('Validator Helper', () => {
  describe('getFilterParamsFromQueryParams', () => {
    test("should return an object with param 'sort'", function () {
      const query: RegularFlightsParams = {
        origin: 'MAD',
        departureDate: '23032023',
        returnDate: '26032023',
        sort: 'price',
      };

      const filter = getFilterParamsFromQueryParams(query);
      expect(filter.sort).toBe('price');
    });

    test("should remove param 'sort' from req.query", function () {
      const query: RegularFlightsParams = {
        origin: 'MAD',
        departureDate: '23032023',
        returnDate: '26032023',
        sort: 'price',
      };

      getFilterParamsFromQueryParams(query);
      expect(query.sort).toBeUndefined();
    });

    test("should return an object with default params 'sort', 'limit' and 'page' even when not present", function () {
      const query: RegularFlightsParams = {
        origin: 'MAD',
        departureDate: '23032023',
        returnDate: '26032023',
      };

      const filter = getFilterParamsFromQueryParams(query);
      expect(filter.sort).toBe(DEFAULT_SORT_FIELD);
      expect(filter.limit).toBe(RESULTS_SEARCH_LIMIT);
      expect(filter.page).toBe(DEFAULT_FIRST_PAGE_OF_RESULT);
    });

    test("should return an object with params 'maxConnections', 'priceFrom', 'priceTo' when present", function () {
      const query: RegularFlightsParams = {
        origin: 'MAD',
        departureDate: '23032023',
        returnDate: '26032023',
        maxConnections: '2',
        priceFrom: '32',
        priceTo: '56',
      };

      const filter = getFilterParamsFromQueryParams(query);
      expect(filter.maxConnections).toBe(2);
      expect(filter.priceFrom).toBe(32);
      expect(filter.priceTo).toBe(56);
    });
  });
});
