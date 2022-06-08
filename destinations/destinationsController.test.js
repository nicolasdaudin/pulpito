const destinationsController = require('./destinationsController.js');
const {
  CHEAPEST_DESTINATION_QUERY_FIXTURE,
  CHEAPEST_DESTINATION_RESULT_FIXTURE,
  CHEAPEST_DESTINATION_QUERY_FIXTURE_NON_EXISTING_ORIGIN,
} = require('../utils/fixtures');
const flightService = require('../data/flightService');
const AppError = require('../utils/appError.js');

describe('Destinations Controller', function () {
  xdescribe('getCheapestDestinations - success cases', function () {
    let req, res, next;
    beforeEach(() => {
      // jest.resetAllMocks();
      console.log('before each');
      flightService.getFlights = jest.fn().mockResolvedValue({
        data: {
          data: CHEAPEST_DESTINATION_RESULT_FIXTURE,
        },
      });

      req = {
        query: CHEAPEST_DESTINATION_QUERY_FIXTURE,
      };

      res = {
        status: jest.fn().mockImplementation(function (arg) {
          return this;
        }),
        json: jest.fn().mockImplementation(function (obj) {
          this.data = obj.data;
        }),
        data: null,
      };
      next = jest.fn();
    });

    test('should use flightService', async function () {
      await destinationsController.getCheapestDestinations(req, res, next);

      // check that getFlights has been called, with params adults
      expect(flightService.getFlights).toHaveBeenCalled();
    });

    test('should search for one adult if nothing specified', async function () {
      await destinationsController.getCheapestDestinations(req, res, next);

      expect(flightService.getFlights).toHaveBeenCalledWith(
        expect.objectContaining({
          adults: 1,
          children: 0,
          infants: 0,
        })
      );
    });

    test('should return success if all good', async function () {
      await destinationsController.getCheapestDestinations(req, res, next);

      // check that the answer is correct
      expect(res.status).toHaveBeenCalledWith(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data[0]).toHaveProperty('flyFrom');
      expect(res.data[0].flyFrom).toBe(
        CHEAPEST_DESTINATION_RESULT_FIXTURE[0].flyFrom
      );
      expect(res.data).toHaveLength(3);
    });
  });
  describe('getCheapestDestinations - error cases', function () {
    let res, next;
    beforeEach(() => {
      res = {
        status: jest.fn().mockImplementation(function (arg) {
          return this;
        }),
        json: jest.fn().mockImplementation(function (obj) {
          this.data = obj.data;
        }),
        data: null,
      };
      next = jest.fn();
    });

    // TODO: is it necessary? before getCheapestDestination, we have a middleware checking for input params
    test('should return error 400 when no input parameters ', async function () {
      const req = { query: {} };

      await destinationsController.getCheapestDestinations(req, res, next);

      // check that response is an error code
      expect(next).toHaveBeenCalledWith(expect.any(AppError));

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('departure location'),
        })
      );
    });

    test('should return error 400 when missing input parameters ', async function () {
      const req = { query: { origin: 'CDG' } };

      await destinationsController.getCheapestDestinations(req, res, next);

      // check that response is an error code
      expect(next).toHaveBeenCalledWith(expect.any(AppError));

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('when roundtrip requested'),
        })
      );
    });

    test('should return error 400 when unknown origin like PXR ', async function () {
      const req = {
        query: CHEAPEST_DESTINATION_QUERY_FIXTURE_NON_EXISTING_ORIGIN,
      };

      await destinationsController.getCheapestDestinations(req, res, next);

      // check that response is an error code
      expect(next).toHaveBeenCalledWith(expect.any(AppError));

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('no locations'),
        })
      );
    });
  });
});
