const helper = require('./apiHelper');
const apiOneWayAnswer = require('../datasets/fixtures/apiOneWayAnswer.json');
const apiReturnAnswer = require('../datasets/fixtures/apiReturnAnswer.json');

describe('API Helper', function () {
  describe('cleanItineraryData', function () {
    test('should remove data from one-way itinerary', function () {
      const itinerary = apiOneWayAnswer.data[0];
      const cleaned = helper.cleanItineraryData(itinerary);
      expect(cleaned).not.toHaveProperty('countryFrom');
    });

    test('should remove data from return itinerary', function () {
      const itinerary = apiReturnAnswer.data[0];
      const cleaned = helper.cleanItineraryData(itinerary);
      expect(cleaned).not.toHaveProperty('countryFrom');
    });

    test('should normalize data from one-way itinerary', function () {
      const itinerary = apiOneWayAnswer.data[0];
      const cleaned = helper.cleanItineraryData(itinerary);
      expect(cleaned).toHaveProperty('route.oneway');
      expect(cleaned).not.toHaveProperty('route.return');
    });

    test('should normalize data from return itinerary', function () {
      const itinerary = apiReturnAnswer.data[0];
      const cleaned = helper.cleanItineraryData(itinerary);
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
      const connections = helper.extractConnections(flights);
      expect(connections[0]).toBe('MAD');
    });

    test('should extract 2 connections', () => {
      const flights = [
        { cityFrom: 'CDG', cityTo: 'MAD' },
        { cityFrom: 'MAD', cityTo: 'UIO' },
        { cityFrom: 'UIO', cityTo: 'GPS' },
      ];
      const connections = helper.extractConnections(flights);
      expect(connections[0]).toBe('MAD');
      expect(connections[1]).toBe('UIO');
    });
  });

  describe('prepareItineraryData', function () {
    const itineraries = [
      {
        cityFrom: 'Madrid',
        countryTo: { name: 'Spain' },
        cityCodeTo: 'IBZ',
        cityTo: 'Ibiza',
        price: 78,
        distance: 600,
        duration: { departure: 85, return: 85 },
      },
      {
        cityFrom: 'Bordeaux',
        countryTo: { name: 'Spain' },
        cityCodeTo: 'IBZ',
        cityTo: 'Ibiza',
        price: 65,
        distance: 800,
        duration: { departure: 105, return: 105 },
      },
      {
        cityFrom: 'Brussels',
        countryTo: { name: 'Spain' },
        cityCodeTo: 'IBZ',
        cityTo: 'Ibiza',
        price: 130,
        distance: 1500,
        duration: { departure: 135, return: 135 },
      },
      {
        cityFrom: 'Brussels',
        countryTo: { name: 'Spain' },
        cityCodeTo: 'OPO',
        cityTo: 'Oporto',
        price: 130,
        distance: 1500,
        duration: { departure: 135, return: 135 },
      },
    ];
    test('should exclude a flight that does not go to that destination', () => {
      const itinerary = helper.prepareItineraryData('Ibiza', itineraries);

      expect(itinerary.countryTo).toBe('Spain');
      expect(itinerary.cityCodeTo).toBe('IBZ');
      expect(itinerary.flights).toHaveLength(3);
    });
    test('should compute all info about a set of flights', () => {
      const itinerary = helper.prepareItineraryData('Ibiza', itineraries);

      expect(itinerary.totalPrice).toBe(78 + 65 + 130);
    });
  });

  describe('filterDestinationCities', function () {
    const destinations = new Map();
    destinations.set('Ibiza', [
      { cityCodeFrom: 'MAD' },
      { cityCodeFrom: 'BOD' },
      { cityCodeFrom: 'DUB' },
      { cityCodeFrom: 'OPO' },
    ]);
    destinations.set('Milan', [
      { cityCodeFrom: 'MAD' },
      { cityCodeFrom: 'BOD' },
      { cityCodeFrom: 'BRU' },
      { cityCodeFrom: 'OPO' },
    ]);
    destinations.set('Dublin', [
      { cityCodeFrom: 'MAD' },
      { cityCodeFrom: 'BOD' },
    ]);

    test('only keeps destinations that have at least one flights from each of the corresponding origins', () => {
      const origins = ['MAD', 'BOD', 'BRU'];
      const result = helper.filterDestinationCities(destinations, origins);
      expect(result).toContain('Milan');
      expect(result).not.toContain('Dublin');
      expect(result).not.toContain('Ibiza');
    });

    test('returns empty array if no destinations with at least one flights from each of the corresponding origins', () => {
      const origins = ['JFK', 'STN', 'BKK'];
      expect(
        helper.filterDestinationCities(destinations, origins)
      ).toHaveLength(0);
    });
  });

  describe('isCommonDestination', function () {
    const destination = [
      { cityCodeFrom: 'MAD' },
      { cityCodeFrom: 'BOD' },
      { cityCodeFrom: 'BRU' },
      { cityCodeFrom: 'OPO' },
    ];

    test('returns true if all the origins are present as origins from the destination flights', () => {
      const origins = ['MAD', 'BOD', 'BRU'];
      expect(helper.isCommonDestination(destination, origins)).toBe(true);
    });
    test('returns false if at least one origin is not present as origins from the destination flights', () => {
      const origins = ['MAD', 'BOD', 'DUB']; // DUB is not present in that case
      expect(helper.isCommonDestination(destination, origins)).toBe(false);
    });
  });
});
