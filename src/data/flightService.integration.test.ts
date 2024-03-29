import flightService from './flightService';
import axios from 'axios';
import helper from '../utils/apiHelper';
import {
  FLIGHT_API_PARAMS_FIXTURE,
  FLIGHT_API_PARAMS_FIXTURE_NON_EXISTING_ORIGIN,
  FLIGHT_API_PARAMS_FIXTURE_WEEKEND_NON_EXISTING_ORIGIN,
  FLIGHT_API_PARAMS_FIXTURE_WEEKEND,
} from '../utils/fixtures';
import { WeekendLengthEnum } from '../common/types';

const maybe = process.env.SKIP_ASYNC_TESTS ? describe.skip : describe;
// skip the async tests using Kiwi real URL, if npm test is called like this :
// 'SKIP_ASYNC_TESTS=true npm test'

maybe('Flight Service - Integration with KIWI API', function () {
  jest.setTimeout(15000);

  describe('getFlights', function () {
    test('should receive a correct answer for a basic search query to KIWI service', async function () {
      const flights = await flightService.getFlights(FLIGHT_API_PARAMS_FIXTURE);

      expect(Array.isArray(flights)).toBe(true);
      expect(flights[0]).toHaveProperty('flyFrom');
      expect(flights[0].flyFrom).toBe(FLIGHT_API_PARAMS_FIXTURE.origin);
    });

    test('should throw a 422 error when non-existing origin for KIWI service', async function () {
      // try {
      //   await flightService.getFlights(
      //     FLIGHT_API_PARAMS_FIXTURE_NON_EXISTING_ORIGIN
      //   );
      // } catch (e) {
      //   expect(e.message).toMatch(/422/);
      // }
      expect.assertions(1);
      await expect(
        flightService.getFlights(FLIGHT_API_PARAMS_FIXTURE_NON_EXISTING_ORIGIN)
      ).rejects.toMatchObject({
        message: expect.stringMatching(/422/),
      });
    });
  });

  describe('getWeekendFlights', function () {
    test('should receive a correct answer for a basic search query to KIWI service', async function () {
      const flights = await flightService.getWeekendFlights(
        FLIGHT_API_PARAMS_FIXTURE_WEEKEND
      );

      expect(Array.isArray(flights)).toBe(true);
      expect(flights[0]).toHaveProperty('flyFrom');
      expect(flights[0].flyFrom).toBe(FLIGHT_API_PARAMS_FIXTURE_WEEKEND.origin);
    });

    test('should use particular parameters if weekend length is long', async () => {
      const spy = jest.spyOn(axios, 'get').mockImplementation(jest.fn());
      const prepareSpy = jest.spyOn(helper, 'prepareWeekendParamsForAxios');
      await flightService.getWeekendFlights({
        ...FLIGHT_API_PARAMS_FIXTURE_WEEKEND,
        weekendLength: WeekendLengthEnum.LONG,
      });

      expect(prepareSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          fly_days: [4, 5, 6],
          ret_fly_days: [0, 1, 2],
          nights_in_dst_from: 3,
          nights_in_dst_to: 4,
        })
      );

      prepareSpy.mockRestore();
      spy.mockRestore();
    });

    test('should use particular parameters if weekend length is short', async () => {
      const spy = jest.spyOn(axios, 'get').mockImplementation(jest.fn());
      const prepareSpy = jest.spyOn(helper, 'prepareWeekendParamsForAxios');
      await flightService.getWeekendFlights({
        ...FLIGHT_API_PARAMS_FIXTURE_WEEKEND,
        weekendLength: WeekendLengthEnum.SHORT,
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

    test('should throw a 422 error when non-existing origin for KIWI service', async function () {
      // try {
      //   await flightService.getWeekendFlights(
      //     FLIGHT_API_PARAMS_FIXTURE_WEEKEND_NON_EXISTING_ORIGIN
      //   );
      // } catch (e) {
      //   expect(e.message).toMatch(/422/);
      // }
      await expect(
        flightService.getWeekendFlights(
          FLIGHT_API_PARAMS_FIXTURE_WEEKEND_NON_EXISTING_ORIGIN
        )
      ).rejects.toMatchObject({
        message: expect.stringMatching(/422/),
      });
    });
  });
});
