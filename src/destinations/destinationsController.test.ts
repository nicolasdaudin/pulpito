import destinationsController from './destinationsController.js';
import {
  CHEAPEST_DESTINATION_QUERY_FIXTURE,
  CHEAPEST_WEEKEND_QUERY_FIXTURE,
  CHEAPEST_DESTINATION_KIWI_RESULT_FIXTURE,
  CHEAPEST_DESTINATION_QUERY_FIXTURE_NON_EXISTING_ORIGIN,
  COMMON_DESTINATION_QUERY_FIXTURE_NON_EXISTING_ORIGIN,
  COMMON_DESTINATION_QUERY_FIXTURE_INCORRECT_ORIGIN_FORMAT,
  COMMON_DESTINATION_QUERY_FIXTURE,
  COMMON_DESTINATION_KIWI_RESULT_FIXTURE_BOD,
  COMMON_DESTINATION_KIWI_RESULT_FIXTURE_BRU,
  COMMON_DESTINATION_KIWI_RESULT_FIXTURE_MAD,
  COMMON_DESTINATION_KIWI_RESULT_FIXTURE_MRS,
} from '../utils/fixtures';
import flightService from '../data/flightService';
import AppError from '../utils/appError.js';

// FIXME: should be improved or at least checked. Maybe need to refactor, add or remove some tests. I want to move forward and add some e2e tests so I won't spend time on this at the moment, but I could do it later.
describe('Destinations Controller', function () {
  describe('getCheapestDestinations', function () {
    describe('success cases', function () {
      let req, res, next;
      let getFlightsSpy;
      beforeEach(() => {
        getFlightsSpy = jest
          .spyOn(flightService, 'getFlights')
          .mockResolvedValue(CHEAPEST_DESTINATION_KIWI_RESULT_FIXTURE);

        req = {
          query: CHEAPEST_DESTINATION_QUERY_FIXTURE,
        };

        res = {
          status: jest.fn().mockImplementation(function () {
            return this;
          }),
          json: jest.fn().mockImplementation(function (obj) {
            this.data = obj.data;
          }),
          data: null,
        };
        next = jest.fn();
      });
      afterAll(() => {
        getFlightsSpy.mockRestore();
      });

      test('should use flightService', async function () {
        await destinationsController.getCheapestDestinations(req, res, next);

        // check that getFlights has been called
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

        expect(res.status).toHaveBeenCalledWith(200);
        expect(Array.isArray(res.data)).toBe(true);
        expect(res.data[0]).toHaveProperty('flyFrom');

        expect(res.data[0].flyFrom).toBe(
          CHEAPEST_DESTINATION_KIWI_RESULT_FIXTURE[0].flyFrom
        );
        expect(res.data).toHaveLength(
          CHEAPEST_DESTINATION_KIWI_RESULT_FIXTURE.length
        );
        // checking that it has been cleaned
        expect(res.data[0]).not.toHaveProperty('countryFrom');
      });
    });
    describe('error cases', function () {
      let res, next;
      beforeEach(() => {
        res = {
          status: jest.fn().mockImplementation(function () {
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
      test('should return error 400 when no input parameters', async function () {
        const req = { query: {} };

        await destinationsController.getCheapestDestinations(req, res, next);

        // check that response is an error
        expect(next).toHaveBeenCalledWith(expect.any(AppError));

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 400,
            message: expect.stringContaining('departure location'),
          })
        );
      });

      test('should return error 400 when missing input parameters', async function () {
        const req = { query: { origin: 'CDG' } };

        await destinationsController.getCheapestDestinations(req, res, next);

        // check that response is an error
        expect(next).toHaveBeenCalledWith(expect.any(AppError));

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 400,
            message: expect.stringContaining('when roundtrip requested'),
          })
        );
      });

      test('should return error 400 when unknown origin like PXR', async function () {
        const req = {
          query: CHEAPEST_DESTINATION_QUERY_FIXTURE_NON_EXISTING_ORIGIN,
        };

        await destinationsController.getCheapestDestinations(req, res, next);

        // check that response is an error
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

  describe('getCommonDestinations', function () {
    describe('success cases', function () {
      let req, res, next;

      let getFlightsSpy;
      beforeEach(() => {
        getFlightsSpy = jest
          .spyOn(flightService, 'getFlights')
          .mockResolvedValue(COMMON_DESTINATION_KIWI_RESULT_FIXTURE_MAD)
          .mockResolvedValueOnce(COMMON_DESTINATION_KIWI_RESULT_FIXTURE_MAD)
          .mockResolvedValueOnce(COMMON_DESTINATION_KIWI_RESULT_FIXTURE_BOD)
          .mockResolvedValueOnce(COMMON_DESTINATION_KIWI_RESULT_FIXTURE_BRU);

        req = {
          query: COMMON_DESTINATION_QUERY_FIXTURE,
        };

        res = {
          status: jest.fn().mockImplementation(function () {
            return this;
          }),
          json: jest.fn().mockImplementation(function (obj) {
            this.data = obj.data;
          }),
          data: null,
        };
        next = jest.fn();
      });
      afterAll(() => {
        getFlightsSpy.mockRestore();
      });

      test('should call flightService the correct number of times', async function () {
        await destinationsController.getCommonDestinations(req, res, next);

        expect(flightService.getFlights).toHaveBeenCalledTimes(
          COMMON_DESTINATION_QUERY_FIXTURE.origin.split(',').length
        );
      });

      test('should search for one adult for each origin if nothing specified', async function () {
        await destinationsController.getCommonDestinations(req, res, next);
        expect(flightService.getFlights).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            adults: 1,
            children: 0,
            infants: 0,
          })
        );
        expect(flightService.getFlights).toHaveBeenNthCalledWith(
          COMMON_DESTINATION_QUERY_FIXTURE.origin.split(',').length - 1,
          expect.objectContaining({
            adults: 1,
            children: 0,
            infants: 0,
          })
        );
      });

      test('should return the correct common destinations', async function () {
        await destinationsController.getCommonDestinations(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(Array.isArray(res.data)).toBe(true);
        expect(res.data[0]).toHaveProperty('cityTo');
        expect(res.data[0].cityTo).toBe('Ibiza');
        expect(res.data).toHaveLength(1);
      });
    });
    describe('error cases', function () {
      let res, next;
      beforeEach(() => {
        res = {
          status: jest.fn().mockImplementation(function () {
            return this;
          }),
          json: jest.fn().mockImplementation(function (obj) {
            this.data = obj.data;
          }),
          data: null,
        };
        next = jest.fn();
      });

      test('should return error 500 when no input parameters', async function () {
        const req = { query: {} };
        await destinationsController.getCommonDestinations(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 500,
          })
        );
      });

      test('should return error 400 when parameters are not comma-separated', async function () {
        const req = {
          query: COMMON_DESTINATION_QUERY_FIXTURE_INCORRECT_ORIGIN_FORMAT,
        };
        await destinationsController.getCommonDestinations(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 400,
            message: expect.stringContaining('no locations'),
          })
        );
      });

      test('should return error 400 when unknown origin like PXR', async function () {
        const req = {
          query: COMMON_DESTINATION_QUERY_FIXTURE_NON_EXISTING_ORIGIN,
        };
        await destinationsController.getCommonDestinations(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 400,
            message: expect.stringContaining('no locations'),
          })
        );
      });

      test('should return error 400 when missing input parameters', async function () {
        const req = { query: { origin: 'MAD,BKK,CDG' } };
        await destinationsController.getCommonDestinations(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 400,
            message: expect.stringContaining('when roundtrip requested'),
          })
        );
      });

      test('should return empty data when there are no common destinations', async function () {
        const req = { query: { origin: 'MAD,MRS' } };

        flightService.getFlights = jest
          .fn()
          .mockResolvedValueOnce(COMMON_DESTINATION_KIWI_RESULT_FIXTURE_MAD)
          .mockResolvedValueOnce(COMMON_DESTINATION_KIWI_RESULT_FIXTURE_MRS);
        await destinationsController.getCommonDestinations(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(Array.isArray(res.data)).toBe(true);
        expect(res.data).toHaveLength(0);
      });
    });
  });

  describe('getCheapestWeekend', function () {
    describe('success cases', function () {
      let req, res, next;
      let getFlightsSpy;
      beforeEach(() => {
        getFlightsSpy = jest
          .spyOn(flightService, 'getWeekendFlights')
          .mockResolvedValue(CHEAPEST_DESTINATION_KIWI_RESULT_FIXTURE);

        req = {
          query: CHEAPEST_WEEKEND_QUERY_FIXTURE,
        };

        res = {
          status: jest.fn().mockImplementation(function () {
            return this;
          }),
          json: jest.fn().mockImplementation(function (obj) {
            this.data = obj.data;
          }),
          data: null,
        };
        next = jest.fn();
      });
      afterAll(() => {
        getFlightsSpy.mockRestore();
      });

      test('should use flightService', async function () {
        await destinationsController.getCheapestWeekend(req, res, next);

        // check that getWeekendFlights has been called
        expect(flightService.getWeekendFlights).toHaveBeenCalled();
      });

      test('should search for one adult if nothing specified', async function () {
        await destinationsController.getCheapestWeekend(req, res, next);

        expect(flightService.getWeekendFlights).toHaveBeenCalledWith(
          expect.objectContaining({
            adults: 1,
            children: 0,
            infants: 0,
          })
        );
      });

      test('should return success if all good', async function () {
        await destinationsController.getCheapestWeekend(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(Array.isArray(res.data)).toBe(true);
        expect(res.data[0]).toHaveProperty('flyFrom');

        expect(res.data[0].flyFrom).toBe(
          CHEAPEST_DESTINATION_KIWI_RESULT_FIXTURE[0].flyFrom
        );
        expect(res.data).toHaveLength(
          CHEAPEST_DESTINATION_KIWI_RESULT_FIXTURE.length
        );
        // checking that it has been cleaned
        expect(res.data[0]).not.toHaveProperty('countryFrom');
      });

      // this is an error case for getFlights, but for getFlightsWeekend we add params nights_in_dst_from and nights_in_dest_to which are enough for Kiwi to perform a search, even though there are no departure dates interval (from->to) and destination.
      test('should return success when only origin is specified, and no possible departure dates and no destination', async function () {
        const req = { query: { origin: 'CDG' } };

        await destinationsController.getCheapestWeekend(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(Array.isArray(res.data)).toBe(true);
        expect(res.data[0]).toHaveProperty('flyFrom');

        expect(res.data[0].flyFrom).toBe(
          CHEAPEST_DESTINATION_KIWI_RESULT_FIXTURE[0].flyFrom
        );
        expect(res.data).toHaveLength(
          CHEAPEST_DESTINATION_KIWI_RESULT_FIXTURE.length
        );
        // checking that it has been cleaned
        expect(res.data[0]).not.toHaveProperty('countryFrom');
      });
    });
    describe('error cases', function () {
      let res, next;
      beforeEach(() => {
        res = {
          status: jest.fn().mockImplementation(function () {
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
      test('should return error 400 when no input parameters', async function () {
        const req = { query: {} };

        await destinationsController.getCheapestWeekend(req, res, next);

        // check that response is an error
        expect(next).toHaveBeenCalledWith(expect.any(AppError));

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 400,
            message: expect.stringContaining('departure location'),
          })
        );
      });

      test('should return error 400 when unknown origin like PXR', async function () {
        const req = {
          query: CHEAPEST_DESTINATION_QUERY_FIXTURE_NON_EXISTING_ORIGIN,
        };

        await destinationsController.getCheapestWeekend(req, res, next);

        // check that response is an error
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
});
