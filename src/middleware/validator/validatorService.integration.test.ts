import {
  validateRequestParamsManyOrigins,
  validateRequestParamsOneOrigin,
  validateRequestParamsWeekend,
} from './validatorService';
import AppError from '../../utils/appError';
import { TypedRequestQueryWithFilter } from '../../common/interfaces';
import {
  Itinerary,
  RegularFlightsParams,
  WeekendFlightsParams,
} from '../../common/types';
import { NextFunction, Response } from 'express-serve-static-core';

describe('ValidatorService', function () {
  // FIXME: all the tests depend on implementation details (like the error msg ...)
  describe('validate middleware', function () {
    let res: Partial<Response> & { data: Itinerary[]; message: string },
      next: NextFunction;
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
        data: [],
        message: '',
      };

      next = jest.fn().mockImplementation(function (err) {
        console.error(err);
      });
    });
    describe('validateRequestParamsWeekend', function () {
      let req: Partial<TypedRequestQueryWithFilter<WeekendFlightsParams>>;
      test('should call next with no arguments when params are ok', function () {
        req = {
          query: {
            origin: 'MAD',
            destination: 'BXL',
            departureDateFrom: '22/06/2022',
            departureDateTo: '29/06/2022',
          },
        };

        validateRequestParamsWeekend(
          req as TypedRequestQueryWithFilter<WeekendFlightsParams>,
          res as Response,
          next
        );
        // expect(next).toHaveBeenCalledWith() is always true, whether next is called without any argument or with an error.
        expect(next).not.toHaveBeenCalledWith(expect.any(AppError));
      });

      test('should call next with an AppError when origin param is missing', function () {
        req = {
          query: {
            destination: 'BXL',
            departureDateFrom: '22/06/2022',
            departureDateTo: '29/06/2022',
          } as WeekendFlightsParams,
        };

        validateRequestParamsWeekend(
          req as TypedRequestQueryWithFilter<WeekendFlightsParams>,
          res as Response,
          next
        );
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
          } as WeekendFlightsParams,
        };

        validateRequestParamsWeekend(
          req as TypedRequestQueryWithFilter<WeekendFlightsParams>,
          res as Response,
          next
        );
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
          } as WeekendFlightsParams,
        };

        validateRequestParamsWeekend(
          req as TypedRequestQueryWithFilter<WeekendFlightsParams>,
          res as Response,
          next
        );
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
          } as WeekendFlightsParams,
        };

        validateRequestParamsWeekend(
          req as TypedRequestQueryWithFilter<WeekendFlightsParams>,
          res as Response,
          next
        );
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

        validateRequestParamsWeekend(
          req as TypedRequestQueryWithFilter<WeekendFlightsParams>,
          res as Response,
          next
        );
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/expected(.*)origin/),
          })
        );
      });
    });

    describe('validateRequestParamsOneOrigin', function () {
      let req: Partial<TypedRequestQueryWithFilter<RegularFlightsParams>>;
      test('should call next with no arguments when params are ok', function () {
        req = {
          query: {
            origin: 'MAD',
            departureDate: '22/06/2022',
            returnDate: '29/06/2022',
          } as RegularFlightsParams,
        };

        validateRequestParamsOneOrigin(
          req as TypedRequestQueryWithFilter<RegularFlightsParams>,
          res as Response,
          next
        );
        expect(next).not.toHaveBeenCalledWith(expect.any(AppError));
      });
      test('should call next with an AppError when origin param is missing', function () {
        req = {
          query: {
            departureDate: '22/06/2022',
            returnDate: '29/06/2022',
          } as RegularFlightsParams,
        };

        validateRequestParamsOneOrigin(
          req as TypedRequestQueryWithFilter<RegularFlightsParams>,
          res as Response,
          next
        );
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
          } as RegularFlightsParams,
        };

        validateRequestParamsOneOrigin(
          req as TypedRequestQueryWithFilter<RegularFlightsParams>,
          res as Response,
          next
        );
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
          } as RegularFlightsParams,
        };

        validateRequestParamsOneOrigin(
          req as TypedRequestQueryWithFilter<RegularFlightsParams>,
          res as Response,
          next
        );
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

        validateRequestParamsOneOrigin(
          req as TypedRequestQueryWithFilter<RegularFlightsParams>,
          res as Response,
          next
        );
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/expected(.*)origin/),
          })
        );
      });
    });

    describe('validateRequestParamsManyOrigins', function () {
      let req: Partial<TypedRequestQueryWithFilter<RegularFlightsParams>>;
      test('should call next with no arguments when params are ok', function () {
        req = {
          query: {
            origin: 'MAD,BRU',
            departureDate: '22/06/2022',
            returnDate: '29/06/2022',
            adults: '2,2',
          },
        };

        validateRequestParamsManyOrigins(
          req as TypedRequestQueryWithFilter<RegularFlightsParams>,
          res as Response,
          next
        );
        expect(next).not.toHaveBeenCalledWith(expect.any(AppError));
      });
      test('should call next with an AppError when origin param is missing', function () {
        req = {
          query: {
            departureDate: '22/06/2022',
            returnDate: '29/06/2022',
          } as RegularFlightsParams,
        };

        validateRequestParamsManyOrigins(
          req as TypedRequestQueryWithFilter<RegularFlightsParams>,
          res as Response,
          next
        );
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
          } as RegularFlightsParams,
        };

        validateRequestParamsManyOrigins(
          req as TypedRequestQueryWithFilter<RegularFlightsParams>,
          res as Response,
          next
        );
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
          } as RegularFlightsParams,
        };

        validateRequestParamsManyOrigins(
          req as TypedRequestQueryWithFilter<RegularFlightsParams>,
          res as Response,
          next
        );
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

        validateRequestParamsManyOrigins(
          req as TypedRequestQueryWithFilter<RegularFlightsParams>,
          res as Response,
          next
        );
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

        validateRequestParamsManyOrigins(
          req as TypedRequestQueryWithFilter<RegularFlightsParams>,
          res as Response,
          next
        );
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

        validateRequestParamsManyOrigins(
          req as TypedRequestQueryWithFilter<RegularFlightsParams>,
          res as Response,
          next
        );
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

        validateRequestParamsManyOrigins(
          req as TypedRequestQueryWithFilter<RegularFlightsParams>,
          res as Response,
          next
        );
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expect.stringMatching(/same(.*)infants/),
          })
        );
      });
    });

    // FIXME: need for tests for checkMissingParams or checkWrongTypeParams, even if their functionality is covered by testing the different validate middlewares
    // indeed when we test the valdiate middlewares we test the error messages, mainly.
  });
});
