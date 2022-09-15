const flightService = require('./flightService');
const axios = require('axios').default;
const helper = require('../utils/apiHelper');
const {
  FLIGHT_API_PARAMS_FIXTURE,
  FLIGHT_API_PARAMS_FIXTURE_NON_EXISTING_ORIGIN,
  FLIGHT_API_PARAMS_FIXTURE_WEEKEND_NON_EXISTING_ORIGIN,
  FLIGHT_API_PARAMS_FIXTURE_WEEKEND,
} = require('../utils/fixtures');
const maybe = process.env.SKIP_ASYNC_TESTS ? describe.skip : describe;
// skip the async tests using Kiwi real URL, if npm test is called like this :
// 'SKIP_ASYNC_TESTS=true npm test'

maybe('Flight Service - Integration with KIWI API', function () {
  jest.setTimeout(10000);

  describe('getFlights', function () {
    test('should receive a correct answer for a basic search query to KIWI service', async function () {
      const response = await flightService.getFlights(
        FLIGHT_API_PARAMS_FIXTURE
      );

      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data[0]).toHaveProperty('flyFrom');
      expect(response.data.data[0].flyFrom).toBe(
        FLIGHT_API_PARAMS_FIXTURE.origin
      );
    });

    test('should throw a 400 error when empty params for KIWI service', async function () {
      try {
        await flightService.getFlights({});
      } catch (e) {
        expect(e.message).toMatch(/400/);
      }
    });

    test('should throw a 400 error when missing params for KIWI service', async function () {
      const { fly_from } = FLIGHT_API_PARAMS_FIXTURE;

      try {
        await flightService.getFlights({ fly_from });
      } catch (e) {
        expect(e.message).toMatch(/400/);
      }
    });

    test('should throw a 422 error when non-existing origin for KIWI service', async function () {
      try {
        await flightService.getFlights(
          FLIGHT_API_PARAMS_FIXTURE_NON_EXISTING_ORIGIN
        );
      } catch (e) {
        expect(e.message).toMatch(/422/);
      }
    });
  });

  describe('getWeekendFlights', function () {
    test('should receive a correct answer for a basic search query to KIWI service', async function () {
      const response = await flightService.getWeekendFlights(
        FLIGHT_API_PARAMS_FIXTURE_WEEKEND
      );

      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data[0]).toHaveProperty('flyFrom');
      expect(response.data.data[0].flyFrom).toBe(
        FLIGHT_API_PARAMS_FIXTURE_WEEKEND.origin
      );
    });

    test('should use particular parameters if weekend length is long', async () => {
      const spy = jest.spyOn(axios, 'get').mockImplementation(jest.fn());
      const prepareSpy = jest.spyOn(helper, 'prepareAxiosParams');
      await flightService.getWeekendFlights({
        ...FLIGHT_API_PARAMS_FIXTURE_WEEKEND,
        weekendLength: 'long',
      });

      expect(prepareSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          fly_days: [4, 5, 6],
          ret_fly_days: [0, 1],
          nights_in_dst_from: 2,
          nights_in_dst_to: 3,
        })
      );

      prepareSpy.mockRestore();
      spy.mockRestore();
    });

    test('should use particular parameters if weekend length is short', async () => {
      const spy = jest.spyOn(axios, 'get').mockImplementation(jest.fn());
      const prepareSpy = jest.spyOn(helper, 'prepareAxiosParams');
      await flightService.getWeekendFlights({
        ...FLIGHT_API_PARAMS_FIXTURE_WEEKEND,
        weekendLength: 'short',
      });

      expect(prepareSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          fly_days: [5, 6],
          ret_fly_days: [0, 1],
          nights_in_dst_from: 1,
          nights_in_dst_to: 2,
        })
      );

      prepareSpy.mockRestore();
      spy.mockRestore();
    });

    test('should throw a 400 error when empty params for KIWI service', async function () {
      try {
        await flightService.getWeekendFlights({});
      } catch (e) {
        expect(e.message).toMatch(/400/);
      }
    });

    test('should throw a 400 error when missing params for KIWI service', async function () {
      const { fly_from } = FLIGHT_API_PARAMS_FIXTURE_WEEKEND;

      try {
        await flightService.getWeekendFlights({ fly_from });
      } catch (e) {
        expect(e.message).toMatch(/400/);
      }
    });

    test('should throw a 422 error when non-existing origin for KIWI service', async function () {
      try {
        await flightService.getWeekendFlights(
          FLIGHT_API_PARAMS_FIXTURE_WEEKEND_NON_EXISTING_ORIGIN
        );
      } catch (e) {
        expect(e.message).toMatch(/422/);
      }
    });
  });

  describe('prepareDefaultParams', function () {
    test('should used user params when present', () => {
      const params = {
        adults: 3,
        children: 2,
        infants: 3,
      };

      const preparedParams = flightService.prepareDefaultParams(params);

      expect(preparedParams.adults).toBe(params.adults);
      expect(preparedParams.children).toBe(params.children);
      expect(preparedParams.infants).toBe(params.infants);
    });

    test('should include default params when missing', () => {
      const params = {};

      const preparedParams = flightService.prepareDefaultParams(params);

      expect(preparedParams.adults).toBe(1);
      expect(preparedParams.children).toBe(0);
      expect(preparedParams.infants).toBe(0);
    });
  });

  describe('prepareSeveralOriginParams', function () {
    test('should return an array of same lengh than the number of origins', () => {
      const params = {
        origin: 'MAD,CRL,BRU,SXF,JFK',
      };

      const preparedParams = flightService.prepareSeveralOriginParams(params);

      expect(preparedParams.length).toBe(params.origin.split(',').length);
    });

    test('should return 1 adult, 0 children, 0 infant for each origin if nothing specified', () => {
      const params = {
        origin: 'MAD,CRL,BRU,SXF,JFK',
      };

      const preparedParams = flightService.prepareSeveralOriginParams(params);

      expect(preparedParams[0].adults).toBe(1);
      expect(preparedParams[0].children).toBe(0);
      expect(preparedParams[0].infants).toBe(0);
    });

    test('should return the correct number of adults, children and infants for each origin when specified', () => {
      const params = {
        origin: 'MAD,CRL,BRU,SXF,JFK',
        adults: '1,2,1,3,1',
        children: '0,0,3,1,1',
      };

      const preparedParams = flightService.prepareSeveralOriginParams(params);

      expect(preparedParams[1].adults).toBe(2);
      expect(preparedParams[2].children).toBe(3);
      expect(preparedParams[0].infants).toBe(0);
    });
  });
});
