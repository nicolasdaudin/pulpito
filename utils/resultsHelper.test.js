const helper = require('./resultsHelper.js');
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
      const result = helper.paginate(items, 2, 3);
      console.log(result);
      expect(result).toStrictEqual(['item4', 'item5', 'item6']);
    });

    test('should return the first items for the first page', () => {
      const result = helper.paginate(items, 1, 3);
      console.log(result);
      expect(result).toStrictEqual(['item1', 'item2', 'item3']);
    });

    test('should return the last items for the last page', () => {
      const result = helper.paginate(items, 4, 3);
      console.log(result);
      expect(result).toStrictEqual(['item10']);
    });

    test('should return no items if page is too big', () => {
      const result = helper.paginate(items, 5, 3);
      console.log(result);
      expect(result).toStrictEqual([]);
    });

    test('should return all the items if limit is bigger than the number of items', () => {
      const result = helper.paginate(items, 1, 12);
      console.log(result);
      expect(result).toStrictEqual([
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
      ]);
    });
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
