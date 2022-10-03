const helper = require('./resultsHelper.js');
const { RESULTS_SEARCH_LIMIT } = require('../config');

describe('Results Helper', () => {
  describe('paginate', () => {
    const items = [
      'item1',
      'item2',
      'item3',
      'item4',
      'item5',
      'item6',
      'item7',
      'item8',
      'item9',
      'item10',
    ];

    test('should return only some items for regular cases', () => {
      const result = helper.paginate(items, { page: 2, limit: 3 });
      expect(result).toStrictEqual(['item4', 'item5', 'item6']);
    });

    test('should return the first items for the first page', () => {
      const result = helper.paginate(items, { page: 1, limit: 3 });
      expect(result).toStrictEqual(['item1', 'item2', 'item3']);
    });

    test('should return the last items for the last page', () => {
      const result = helper.paginate(items, { page: 4, limit: 3 });
      expect(result).toStrictEqual(['item10']);
    });

    test('should return no items if page is too big', () => {
      const result = helper.paginate(items, { page: 5, limit: 3 });
      expect(result).toStrictEqual([]);
    });

    test('should return all the items if limit is bigger than the number of items', () => {
      const result = helper.paginate(items, { page: 1, limit: 12 });
      expect(result).toStrictEqual(items);
    });

    test('should return a subset of the array if no pagination filters', () => {
      const manyResults = [
        items,
        items,
        items,
        items,
        items,
        items,
        items,
        items,
        items,
      ].flat();
      const result = helper.paginate(manyResults, {});
      expect(result).toHaveLength(RESULTS_SEARCH_LIMIT);
    });

    test.todo(
      'should return results based on default values if page filter has been specified, but not the limit filter'
    );

    test.todo(
      'should return results based on default values if limit filter has been specified, but not the page filter'
    );
  });

  describe('getURLFromRequest', () => {
    test('return a well-formed URLSearchParams object from req.query', () => {
      const req = {
        query: {
          departureDate: '2022-09-22',
          origins: {
            flyFrom: ['MAD', 'LIS'],
            adults: ['1', '1'],
            children: ['0', '0'],
            infants: ['0', '0'],
          },
        },
      };

      const url = helper.getURLFromRequest(req);
      expect(url).toBeInstanceOf(URLSearchParams);
      expect(url.get('departureDate')).toBe('2022-09-22');
      expect(url.getAll('origins[][flyFrom]')).toEqual(
        expect.arrayContaining(['MAD', 'LIS'])
      );
    });
    test('return a well-formed URLSearchParams object from req.body', () => {
      const req = {
        body: {
          departureDate: '2022-09-22',
          origins: {
            flyFrom: ['MAD', 'LIS'],
            adults: ['1', '1'],
            children: ['0', '0'],
            infants: ['0', '0'],
          },
        },
      };

      const url = helper.getURLFromRequest(req);
      expect(url).toBeInstanceOf(URLSearchParams);
      expect(url.get('departureDate')).toBe('2022-09-22');
      expect(url.getAll('origins[][flyFrom]')).toEqual(
        expect.arrayContaining(['MAD', 'LIS'])
      );
    });
  });
});
