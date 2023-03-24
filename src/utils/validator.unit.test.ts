import pulpitoValidator from './validator';
import validator from 'validator';
import { ParamModel } from '../common/types';

describe('validator utils', () => {
  describe('isCommaSeparatedAlpha', () => {
    test('should return true when argument is a unique string of letters', function () {
      expect(pulpitoValidator.isCommaSeparatedAlpha('MAD')).toBe(true);
    });
    test('should return true when argument is a comma separated string of letters', function () {
      expect(pulpitoValidator.isCommaSeparatedAlpha('MAD,OPO,BRU')).toBe(true);
    });
    test('should return false when argument contains numbers', function () {
      expect(pulpitoValidator.isCommaSeparatedAlpha('MAD2')).toBe(false);
      expect(pulpitoValidator.isCommaSeparatedAlpha('MAD2,OPO,BRU')).toBe(
        false
      );
    });
    test('should return false when argument has not the correct comma-separator', function () {
      expect(pulpitoValidator.isCommaSeparatedAlpha('MAD;OPO;BRU')).toBe(false);
      expect(pulpitoValidator.isCommaSeparatedAlpha('MAD-OPO-BRU')).toBe(false);
      expect(pulpitoValidator.isCommaSeparatedAlpha('MAD OPO BRU')).toBe(false);
    });
    test('should return false when argument is empty', function () {
      expect(pulpitoValidator.isCommaSeparatedAlpha('')).toBe(false);
    });
    test('should return false when argument ends with a comma', function () {
      expect(pulpitoValidator.isCommaSeparatedAlpha('MAD,')).toBe(false);
    });
  });

  describe('isCommaSeparatedNumeric', () => {
    test('should return true when argument is a number', function () {
      expect(pulpitoValidator.isCommaSeparatedNumeric('1')).toBe(true);
    });
    test('should return true when argument is a comma separated string of numbers', function () {
      expect(pulpitoValidator.isCommaSeparatedNumeric('1,1,1')).toBe(true);
    });
    test('should return false when argument contains letters', function () {
      expect(pulpitoValidator.isCommaSeparatedNumeric('MAD')).toBe(false);
      expect(pulpitoValidator.isCommaSeparatedNumeric('1,2,a')).toBe(false);
    });
    test('should return false when argument has not the correct comma-separator', function () {
      expect(pulpitoValidator.isCommaSeparatedNumeric('1;2;3')).toBe(false);
      expect(pulpitoValidator.isCommaSeparatedNumeric('1-2-3')).toBe(false);
      expect(pulpitoValidator.isCommaSeparatedNumeric('1 2 3')).toBe(false);
    });
    test('should return false when argument is empty', function () {
      expect(pulpitoValidator.isCommaSeparatedNumeric('')).toBe(false);
    });
    test('should return false when argument ends with a comma', function () {
      expect(pulpitoValidator.isCommaSeparatedNumeric('2,4,')).toBe(false);
    });
  });

  describe('findMissingParams', () => {
    const model = [
      {
        name: 'requiredParam1',
        required: true,
      },
      {
        name: 'requiredParam2',
        required: true,
      },
      {
        name: 'requiredParam3',
        required: true,
      },
      {
        name: 'nonRequiredParam1',
        required: false,
      },
    ] as ParamModel[];

    test('should return an empty array if no parameters from given model are missing', () => {
      const params = {
        requiredParam1: 'foo',
        requiredParam2: 'bar',
        requiredParam3: 'foobar',
        nonRequiredParam1: 'foobar',
      };
      expect(pulpitoValidator.findMissingParams(model, params)).toEqual([]);
    });
    test('should return an array of the missing parameters names when they are missing', function () {
      const params = {
        requiredParam3: 'foobar',
        nonRequiredParam1: 'foobar',
        nonRequiredParam2: 'boofar',
      };
      expect(pulpitoValidator.findMissingParams(model, params)).toContain(
        'requiredParam1'
      );
      expect(pulpitoValidator.findMissingParams(model, params)).toContain(
        'requiredParam2'
      );
    });
  });

  describe('findWrongTypeParams', () => {
    const model = [
      {
        name: 'alphaParam',
        typeCheck: validator.isAlpha,
      },
      {
        name: 'numericParam',
        typeCheck: validator.isNumeric,
      },
      {
        name: 'dateParam',
        typeCheck: (str) => validator.isDate(str, { format: 'DD/MM/YYYY' }),
      },
    ] as ParamModel[];

    test('should return an empty array if parameters have the correct type', () => {
      const params = {
        alphaParam: 'foo',
        numericParam: '42',
        dateParam: '22/06/1984',
      };
      expect(pulpitoValidator.findWrongTypeParams(model, params)).toEqual([]);
    });

    test(`should return ['alphaParam'] when alphaParam contains something else than letters`, () => {
      const params = {
        alphaParam: 'adaafafa4',
        numericParam: '42',
        dateParam: '22/06/1984',
      };
      expect(pulpitoValidator.findWrongTypeParams(model, params)).toEqual([
        'alphaParam',
      ]);
    });

    test(`should return ['numericParam'] when numericParam contains letters`, () => {
      const params = {
        alphaParam: 'foo',
        numericParam: '4a2',
        dateParam: '22/06/1984',
      };
      expect(pulpitoValidator.findWrongTypeParams(model, params)).toEqual([
        'numericParam',
      ]);
    });

    test(`should return ['dateParam'] when dateParam is not of the correct format`, () => {
      const params = {
        alphaParam: 'foo',
        numericParam: '42',
        dateParam: '1984/06/22',
      };
      expect(pulpitoValidator.findWrongTypeParams(model, params)).toEqual([
        'dateParam',
      ]);
    });

    test(`should return an array that contains 'alphaNumeric' and 'numericParam' when both parameters have a wrong type`, () => {
      const params = {
        alphaParam: 'f4oo',
        numericParam: '4a2',
        dateParam: '22/06/1984',
      };
      expect(pulpitoValidator.findWrongTypeParams(model, params)).toContain(
        'alphaParam'
      );
      expect(pulpitoValidator.findWrongTypeParams(model, params)).toContain(
        'numericParam'
      );
    });
  });
});
