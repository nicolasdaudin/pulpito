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
});
