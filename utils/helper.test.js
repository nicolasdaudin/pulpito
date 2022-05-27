const { cleanItineraryData } = require('./helper');
const {
  ONE_WAY_KIWI_ITINERARY_FIXTURE,
  RETURN_KIWI_ITINERARY_FIXTURE,
} = require('./fixtures');
describe('Helper', function () {
  test('should clean data from one-way itinerary', function () {
    const cleaned = cleanItineraryData(ONE_WAY_KIWI_ITINERARY_FIXTURE);
    expect(cleaned).not.toHaveProperty('countryFrom');
  });

  test('should clean data from return itinerary', function () {
    const cleaned = cleanItineraryData(RETURN_KIWI_ITINERARY_FIXTURE);
    expect(cleaned).not.toHaveProperty('countryFrom');
  });
});
