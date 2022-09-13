const validator = require('./validator');

describe('validator utils ', () => {
  describe('isCommaSeparatedAlpha', () => {
    test('should return true when argument is a unique string of letters', function () {
      expect(validator.isCommaSeparatedAlpha('MAD')).toBe(true);
    });
    test('should return true when argument is a comma separated string of letters', function () {
      expect(validator.isCommaSeparatedAlpha('MAD,OPO,BRU')).toBe(true);
    });
    test('should return false when argument contains numbers', function () {
      expect(validator.isCommaSeparatedAlpha('MAD2')).toBe(false);
      expect(validator.isCommaSeparatedAlpha('MAD2,OPO,BRU')).toBe(false);
    });
    test('should return false when argument has not the correct comma-separator', function () {
      expect(validator.isCommaSeparatedAlpha('MAD;OPO;BRU')).toBe(false);
      expect(validator.isCommaSeparatedAlpha('MAD-OPO-BRU')).toBe(false);
      expect(validator.isCommaSeparatedAlpha('MAD OPO BRU')).toBe(false);
    });
    test('should return false when argument is empty', function () {
      expect(validator.isCommaSeparatedAlpha('')).toBe(false);
    });
    test('should return false when argument ends with a comma', function () {
      expect(validator.isCommaSeparatedAlpha('MAD,')).toBe(false);
    });
  });

  describe('isCommaSeparatedNumeric', () => {
    test('should return true when argument is a number', function () {
      expect(validator.isCommaSeparatedNumeric('1')).toBe(true);
    });
    test('should return true when argument is a comma separated string of numbers', function () {
      expect(validator.isCommaSeparatedNumeric('1,1,1')).toBe(true);
    });
    test('should return false when argument contains letters', function () {
      expect(validator.isCommaSeparatedNumeric('MAD')).toBe(false);
      expect(validator.isCommaSeparatedNumeric('1,2,a')).toBe(false);
    });
    test('should return false when argument has not the correct comma-separator', function () {
      expect(validator.isCommaSeparatedNumeric('1;2;3')).toBe(false);
      expect(validator.isCommaSeparatedNumeric('1-2-3')).toBe(false);
      expect(validator.isCommaSeparatedNumeric('1 2 3')).toBe(false);
    });
    test('should return false when argument is empty', function () {
      expect(validator.isCommaSeparatedNumeric('')).toBe(false);
    });
    test('should return false when argument ends with a comma', function () {
      expect(validator.isCommaSeparatedNumeric('2,4,')).toBe(false);
    });
  });

  describe('validateRequestParamsManyOrigins', () => {});

  describe('validateRequestParamsOneOrigin', () => {});
});
