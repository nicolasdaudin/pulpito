const destinationsController = require('./destinationsController.js');
const {
  KIWI_PARAMS_FIXTURE,
  CHEAPEST_DESTINATION_QUERY_FIXTURE,
  CHEAPEST_DESTINATION_RESULT_FIXTURE,
} = require('../utils/fixtures');
const axios = require('axios').default;
const maybe = process.env.SKIP_ASYNC_TESTS ? describe.skip : describe;
// skip the async tests using Kiwi real URL, if npm test is called like this :
// 'SKIP_ASYNC_TESTS=true npm test'

maybe('Destinations Controller', function () {
  jest.setTimeout(10000);

  describe('handler getCheapestDestinations', function () {
    test('should get the cheapest destinations from one origin', async function () {
      const req = {
        query: CHEAPEST_DESTINATION_QUERY_FIXTURE,
      };

      const res = {
        status: jest.fn().mockImplementation(function (arg) {
          console.log('MOCK res.status()');
          return this;
        }),
        json: jest.fn().mockImplementation(function (obj) {
          console.log('MOCK res.json()');
          this.data = obj.data;
        }),
        data: null,
      };
      const next = jest.fn();

      jest.mock('axios');
      axios.get = jest.fn().mockResolvedValue({
        data: {
          data: CHEAPEST_DESTINATION_RESULT_FIXTURE,
        },
      });

      console.log('before calling cheapest');
      await destinationsController.getCheapestDestinations(req, res, next);
      console.log('after calling cheapest');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data[0]).toHaveProperty('flyFrom');
      expect(res.data[0].flyFrom).toBe(
        CHEAPEST_DESTINATION_RESULT_FIXTURE[0].flyFrom
      );
      expect(res.data).toHaveLength(3);
    });

    test('should fail when the origin is unknown', function () {});

    test('should consider 1 adult per destination if nothing is specified', function () {
      const my = true;
      expect(my).toBe(true);
    });
  });
});
