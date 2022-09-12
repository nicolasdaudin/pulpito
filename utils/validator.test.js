const validator = require('./validator');

describe('validator utils ', () => {
  describe('isCommaSeparatedAlpha', () => {
    test('should return true when argument is a comma separated string of letters', function () {
      expect(validator.isCommaSeparatedAlpha('MAD')).toBe(true);
      expect(validator.isCommaSeparatedAlpha('MAD,OPO,BRU')).toBe(true);
    });
    test('should return false when argument is not a comma separated string of letters', function () {
      expect(validator.isCommaSeparatedAlpha('MAD2')).toBe(false);
      expect(validator.isCommaSeparatedAlpha('MAD2,OPO,BRU')).toBe(false);
      expect(validator.isCommaSeparatedAlpha('MAD;OPO;BRU')).toBe(false);
      expect(validator.isCommaSeparatedAlpha('MAD-OPO-BRU')).toBe(false);
      expect(validator.isCommaSeparatedAlpha('MAD OPO BRU')).toBe(false);
    });
  });

  describe('isCommaSeparatedNumeric', () => {
    test('should return true when argument is a comma separated string of numbers', function () {
      expect(validator.isCommaSeparatedNumeric('1')).toBe(true);
      expect(validator.isCommaSeparatedNumeric('1,1,1')).toBe(true);
    });
    test('should return false when argument is not a comma separated string of numbers', function () {
      expect(validator.isCommaSeparatedNumeric('MAD')).toBe(false);
      expect(validator.isCommaSeparatedNumeric('1,2,a')).toBe(false);
      expect(validator.isCommaSeparatedNumeric('1;2;3')).toBe(false);
      expect(validator.isCommaSeparatedNumeric('1-2-3')).toBe(false);
      expect(validator.isCommaSeparatedNumeric('1 2 3')).toBe(false);
    });
  });

  describe('validateRequestParamsManyOrigins', () => {});

  describe('validateRequestParamsOneOrigin', () => {});
});
