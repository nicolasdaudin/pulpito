const axios = require('axios').default;

describe('Integration Tests', () => {
  jest.setTimeout(15000);

  describe('KIWI Api', () => {
    // this test helps to check if the remote API has changed
    // and is also sort of a documentation of KIWI API, and what is expected from it
    // we only check for most relevant properties in the KIWI answer (the one we actually yse in Pulpito)
    // KIWI API doc available at https://tequila.kiwi.com/docs/tequila_api/search_api
    test('should return a data object with the correct properties, from KIWI API', async () => {
      try {
        const response = await axios.get(process.env.KIWI_URL, {
          headers: {
            apikey: process.env.KIWI_API_KEY,
          },
          params: {
            fly_from: 'MAD',
            fly_to: 'MRS',
            dateFrom: '17/06/2023',
            dateTo: '17/06/2023',
            // rest of parameters are optional
            returnFrom: '17/06/2023',
            returnTo: '17/06/2023',
            adults: 1,
            max_stopovers: 2,
            partner_market: 'fr',
            lang: 'fr',
            limit: 1000,
            flight_type: 'round',
            ret_from_diff_airport: 0,
            ret_to_diff_airport: 0,
            one_for_city: 1,
          },
        });

        expect(response.data).toHaveProperty('search_id');
        expect(response.data).toHaveProperty('data');
        expect(response.data).toHaveProperty('_results');

        const data = response.data.data;
        expect(Array.isArray(data)).toBe(true);

        const itinerary = data[0];
        expect(itinerary).toHaveProperty('flyFrom');
        expect(itinerary.flyFrom).toBe('MAD');

        expect(itinerary).toHaveProperty('id');
        expect(itinerary).toHaveProperty('flyTo');
        expect(itinerary).toHaveProperty('cityFrom');
        expect(itinerary).toHaveProperty('cityCodeFrom');
        expect(itinerary).toHaveProperty('cityTo');
        expect(itinerary).toHaveProperty('cityCodeTo');
        expect(itinerary).toHaveProperty('countryFrom');
        expect(itinerary).toHaveProperty('countryTo');
        expect(itinerary).toHaveProperty('distance');
        expect(itinerary).toHaveProperty('duration');
        expect(itinerary).toHaveProperty('price');
        expect(itinerary).toHaveProperty('fare');
        expect(itinerary).toHaveProperty('airlines');

        expect(itinerary).toHaveProperty('route');

        const route = itinerary.route;
        expect(Array.isArray(route)).toBe(true);
        expect(route.length).toBeGreaterThanOrEqual(2);
        expect(route.length).toBeLessThanOrEqual(4);

        const oneway = route[0];
        expect(oneway).toHaveProperty('id');
        expect(oneway).toHaveProperty('flyFrom');
        expect(oneway).toHaveProperty('flyTo');
        expect(oneway).toHaveProperty('cityFrom');
        expect(oneway).toHaveProperty('cityCodeFrom');
        expect(oneway).toHaveProperty('cityTo');
        expect(oneway).toHaveProperty('cityCodeTo');
        expect(oneway).toHaveProperty('airline');
        expect(oneway).toHaveProperty('return');
        expect(oneway).toHaveProperty('local_arrival');
        expect(oneway).toHaveProperty('utc_arrival');
        expect(oneway).toHaveProperty('local_departure');
        expect(oneway).toHaveProperty('utc_departure');

        expect(itinerary).toHaveProperty('booking_token');
        expect(itinerary).toHaveProperty('deep_link');
        expect(itinerary).toHaveProperty('local_arrival');
        expect(itinerary).toHaveProperty('utc_arrival');
        expect(itinerary).toHaveProperty('local_departure');
        expect(itinerary).toHaveProperty('utc_departure');
      } catch (err) {
        console.error(err.message);
        throw err;
      }
    });
  });
});
