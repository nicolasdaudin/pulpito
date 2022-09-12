const { cleanItineraryData, extractConnections } = require('./apiHelper');
const apiOneWayAnswer = require('../datasets/fixtures/apiOneWayAnswer.json');
const apiReturnAnswer = require('../datasets/fixtures/apiReturnAnswer.json');

describe('API Helper', function () {
  describe('cleanItineraryData', function () {
    test('should remove data from one-way itinerary', function () {
      const itinerary = apiOneWayAnswer.data[0];
      const cleaned = cleanItineraryData(itinerary);
      expect(cleaned).not.toHaveProperty('countryFrom');
    });

    test('should remove data from return itinerary', function () {
      const itinerary = apiReturnAnswer.data[0];
      const cleaned = cleanItineraryData(itinerary);
      expect(cleaned).not.toHaveProperty('countryFrom');
    });

    test('should normalize data from one-way itinerary', function () {
      const itinerary = apiOneWayAnswer.data[0];
      const cleaned = cleanItineraryData(itinerary);
      expect(cleaned).toHaveProperty('route.oneway');
      expect(cleaned).not.toHaveProperty('route.return');
    });

    test('should normalize data from return itinerary', function () {
      const itinerary = apiReturnAnswer.data[0];
      const cleaned = cleanItineraryData(itinerary);
      expect(cleaned).toHaveProperty('route.oneway');
      expect(cleaned).toHaveProperty('route.return');
    });
  });

  describe('extractConnections', function () {
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
});
