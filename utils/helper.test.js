const { cleanItineraryData, extractConnections } = require('./helper');
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

  test('should extract 1 connection', () => {
    const flights = [
      { cityFrom: 'CDG', cityTo: 'MAD' },
      { cityFrom: 'MAD', cityTo: 'UIO' },
    ];
    const connections = extractConnections(flights);
    expect(connections[0]).toBe('MAD');
  });

  test('should extract 2 connections', () => {
    const flights = [
      { cityFrom: 'CDG', cityTo: 'MAD' },
      { cityFrom: 'MAD', cityTo: 'UIO' },
      { cityFrom: 'UIO', cityTo: 'GPS' },
    ];
    const connections = extractConnections(flights);
    expect(connections[0]).toBe('MAD');
    expect(connections[1]).toBe('UIO');
  });
});
