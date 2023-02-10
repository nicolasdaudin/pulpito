const validatorService = require('./validatorService');
const { RESULTS_SEARCH_LIMIT, DEFAULT_SORT_FIELD } = require('../config');
const AppError = require('../utils/appError');

describe('ValidatorService', function () {
  describe('filterParams', function () {
    let req, res, next;
    beforeEach(() => {
      res = {
        status: jest.fn().mockImplementation(function () {
          // console.log('calling res.status');
          return this;
        }),
        json: jest.fn().mockImplementation(function (obj) {
          // console.log('calling res.json');
          this.data = obj.data;
          this.message = obj.message;
        }),
        data: null,
        message: null,
      };

      req = {};

      next = jest.fn().mockImplementation(function (err) {
        console.error(err);
      });
    });

    test("should add param 'sort' to req.filter", function () {
      req = { query: { origin: 'MAD', sort: 'price' } };

      validatorService.filterParams(req, res, next);
      expect(req.filter.sort).toBe('price');
    });

    test("should remove param 'sort' from req.query", function () {
      req = { query: { origin: 'MAD', sort: 'price' } };

      validatorService.filterParams(req, res, next);
      expect(req.query.sort).toBeUndefined();
    });

    test("should not add param 'origin' to req.filter", function () {
      req = { query: { origin: 'MAD', sort: 'price' } };

      validatorService.filterParams(req, res, next);
      expect(req.filter.origin).toBeUndefined();
    });

    test('should add default params to req.filter even when not present', function () {
      req = { query: { origin: 'MAD' } };

      validatorService.filterParams(req, res, next);
      expect(req.filter.sort).toBe(DEFAULT_SORT_FIELD);
      expect(req.filter.limit).toBe(RESULTS_SEARCH_LIMIT);
      expect(req.filter.page).toBe(1);
    });

    test('should add params maxConnections, priceFrom, priceTo to req.filter when  present', function () {
      req = {
        query: { origin: 'MAD', maxConnections: 2, priceFrom: 32, priceTo: 56 },
      };

      validatorService.filterParams(req, res, next);
      expect(req.filter.maxConnections).toBe(2);
      expect(req.filter.priceFrom).toBe(32);
      expect(req.filter.priceTo).toBe(56);
    });
  });

  describe('validate middleware', function () {
    let req, res, next;
    beforeEach(() => {
      res = {
        status: jest.fn().mockImplementation(function () {
          // console.log('calling res.status');
          return this;
        }),
        json: jest.fn().mockImplementation(function (obj) {
          // console.log('calling res.json');
          this.data = obj.data;
          this.message = obj.message;
        }),
        data: null,
        message: null,
      };

      req = {};

      next = jest.fn().mockImplementation(function (err) {
        console.error(err);
      });
    });

    describe('validateRequestParamsWeekend', function () {
      test('should call next with no arguments when params are ok', function () {
        req = {
          query: {
            origin: 'MAD',
            destination: 'BXL',
            departureDateFrom: '22/06/2022',
            departureDateTo: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsWeekend(req, res, next);
        // expect(next).toHaveBeenCalledWith() is always true, whether next is called without any argument or with an error.
        expect(next).not.toHaveBeenCalledWith(expect.any(AppError));
      });
      test('should call next with an AppError when origin param is missing', function () {
        req = {
          query: {
            destination: 'BXL',
            departureDateFrom: '22/06/2022',
            departureDateTo: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsWeekend(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/missing(.*)origin/),
          })
        );
      });
      test('should call next with an AppError when destination param is missing', function () {
        req = {
          query: {
            origin: 'BXL',
            departureDateFrom: '22/06/2022',
            departureDateTo: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsWeekend(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/missing(.*)destination/),
          })
        );
      });
      test('should call next with an AppError when departureDateFrom param is missing', function () {
        req = {
          query: {
            origin: 'BXL',
            destination: 'MAD',
            departureDateTo: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsWeekend(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/missing(.*)departureDateFrom/),
          })
        );
      });
      test('should call next with an AppError when departureDateTo param is missing', function () {
        req = {
          query: {
            origin: 'BXL',
            destination: 'MAD',
            departureDateFrom: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsWeekend(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/missing(.*)departureDateTo/),
          })
        );
      });
      test('should call next with an AppError when origin param contains numeric characters', function () {
        req = {
          query: {
            origin: 'BXL2',
            destination: 'MAD',
            departureDateFrom: '22/06/2022',
            departureDateTo: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsWeekend(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/expected(.*)origin/),
          })
        );
      });
    });

    describe('validateRequestParamsOneOrigin', function () {
      test('should call next with no arguments when params are ok', function () {
        req = {
          query: {
            origin: 'MAD',
            departureDate: '22/06/2022',
            returnDate: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsOneOrigin(req, res, next);
        expect(next).not.toHaveBeenCalledWith(expect.any(AppError));
      });
      test('should call next with an AppError when origin param is missing', function () {
        req = {
          query: {
            departureDate: '22/06/2022',
            returnDate: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsOneOrigin(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/missing(.*)origin/),
          })
        );
      });

      test('should call next with an AppError when departureDate param is missing', function () {
        req = {
          query: {
            origin: 'BXL',
            returnDate: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsOneOrigin(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/missing(.*)departureDate/),
          })
        );
      });

      test('should call next with an AppError when returnDate param is missing', function () {
        req = {
          query: {
            origin: 'BXL',
            departureDate: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsOneOrigin(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/missing(.*)returnDate/),
          })
        );
      });
      test('should call next with an AppError when origin param contains numeric characters', function () {
        req = {
          query: {
            origin: 'BXL2',
            departureDate: '22/06/2022',
            returnDate: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsOneOrigin(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/expected(.*)origin/),
          })
        );
      });
    });

    describe('validateRequestParamsManyOrigins', function () {
      test('should call next with no arguments when params are ok', function () {
        req = {
          query: {
            origin: 'MAD,BRU',
            departureDate: '22/06/2022',
            returnDate: '29/06/2022',
            adults: '2,2',
          },
        };

        validatorService.validateRequestParamsManyOrigins(req, res, next);
        expect(next).not.toHaveBeenCalledWith(expect.any(AppError));
      });
      test('should call next with an AppError when origin param is missing', function () {
        req = {
          query: {
            departureDate: '22/06/2022',
            returnDate: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsManyOrigins(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/missing(.*)origin/),
          })
        );
      });

      test('should call next with an AppError when departureDate param is missing', function () {
        req = {
          query: {
            origin: 'MAD,BXL',
            returnDate: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsManyOrigins(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/missing(.*)departureDate/),
          })
        );
      });

      test('should call next with an AppError when returnDate param is missing', function () {
        req = {
          query: {
            origin: 'MAD,BXL',
            departureDate: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsManyOrigins(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/missing(.*)returnDate/),
          })
        );
      });
      test('should call next with an AppError when origin param contains wrong separator character', function () {
        req = {
          query: {
            origin: 'MAD-BXL',
            departureDate: '22/06/2022',
            returnDate: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsManyOrigins(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/expected(.*)origin/),
          })
        );
      });

      test('should call next with an AppError when number of adults specified is not the same as number of origins specified', function () {
        req = {
          query: {
            origin: 'MAD,BXL',
            adults: '3,2,2',
            departureDate: '22/06/2022',
            returnDate: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsManyOrigins(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/same(.*)adults/),
          })
        );
      });

      test('should call next with an AppError when number of children specified is not the same as number of origins specified', function () {
        req = {
          query: {
            origin: 'MAD,BXL',
            children: '3,2,2',
            departureDate: '22/06/2022',
            returnDate: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsManyOrigins(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/same(.*)children/),
          })
        );
      });

      test('should call next with an AppError when number of infants specified is not the same as number of origins specified', function () {
        req = {
          query: {
            origin: 'MAD,BXL',
            infants: '3,2,2',
            departureDate: '22/06/2022',
            returnDate: '29/06/2022',
          },
        };

        validatorService.validateRequestParamsManyOrigins(req, res, next);
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/same(.*)infants/),
          })
        );
      });
    });

    // no need for tests for checkMissingParams or checkWrongTypeParams
    // their functionality is covered by testing the different validate middlewares
  });
});
