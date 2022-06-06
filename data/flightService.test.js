const flightService = require('./flightService');
const axios = require('axios').default;
const {
  FLIGHT_API_PARAMS_FIXTURE,
  FLIGHT_API_PARAMS_FIXTURE_NON_EXISTING_ORIGIN,
} = require('../utils/fixtures');

describe('flightService - getFlights', function () {
  test('should receive a correct answer for a basic search query to KIWI service', async function () {
    const response = await flightService.getFlights(FLIGHT_API_PARAMS_FIXTURE);

    expect(response.data).toHaveProperty('data');
    expect(Array.isArray(response.data.data)).toBe(true);
    expect(response.data.data[0]).toHaveProperty('flyFrom');
    expect(response.data.data[0].flyFrom).toBe(
      FLIGHT_API_PARAMS_FIXTURE.origin
    );
  });

  test('should call axios.get to get the flights', async () => {
    const spy = jest.spyOn(axios, 'get').mockImplementation(jest.fn());

    const params = {
      origin: '',
      departureDate: '',
      returnDate: '',
      adults: 1,
      children: 0,
      infants: 0,
    };

    await flightService.getFlights(params);

    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  test('should receive a 400 error when empty params for KIWI service', async function () {
    expect(async () => {
      await flightService.getFlights({});
    }).rejects.toThrow(/400/);
  });

  test('should receive a 400 error when missing params for KIWI service', async function () {
    const { fly_from, ...others } = FLIGHT_API_PARAMS_FIXTURE;

    expect(async () => {
      await flightService.getFlights({ fly_from });
    }).rejects.toThrow(/400/);
  });

  test('should receive a 422 error when non-existing origin for KIWI service', async function () {
    expect(async () => {
      await flightService.getFlights(
        FLIGHT_API_PARAMS_FIXTURE_NON_EXISTING_ORIGIN
      );
    }).rejects.toThrow(/422/);
  });
});

describe('flightService - prepareDefaultParams', function () {
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
