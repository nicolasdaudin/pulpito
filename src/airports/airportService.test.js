const airportService = require('./airportService');

describe('AirportService', function () {
  describe('searchByString', function () {
    test('should be able to retrieve airports by any string', function () {
      const airports = airportService.searchByString('paris');
      expect(airports.length).toBeGreaterThan(0);
    });

    test('should work the same for lower and upper case strings', function () {
      const airportsLower = airportService.searchByString('paris');
      const airportsUpper = airportService.searchByString('PARIS');
      const airportsLowerAndUpper = airportService.searchByString('PaRiS');
      expect(airportsLower.length === airportsUpper.length).toBe(true);
      expect(airportsLower.length === airportsLowerAndUpper.length).toBe(true);
    });

    test('should retrieve an empty array for non existing strings', function () {
      const airports = airportService.searchByString('xxxxxxx');
      expect(airports).toHaveLength(0);
    });

    test('should retrieve an empty array for empty strings', function () {
      const airports = airportService.searchByString('');
      expect(airports).toHaveLength(0);
    });

    test('should retrieve an empty array for null strings', function () {
      const airports = airportService.searchByString();
      expect(airports).toHaveLength(0);
    });
  });

  describe('findByIataCode', function () {
    test('should be able to retrieve airports by any IATA code', function () {
      const airport = airportService.findByIataCode('CDG');
      expect(airport.iata_code).toBe('CDG');
    });

    test('should work the same for lower and upper IATA codes', function () {
      const airportLower = airportService.findByIataCode('CDG');
      const airportUpper = airportService.findByIataCode('cdg');
      const airportLowerAndUpper = airportService.findByIataCode('CdG');
      expect(airportLower.iata_code === airportUpper.iata_code).toBe(true);
      expect(airportLower.iata_code === airportLowerAndUpper.iata_code).toBe(
        true
      );
    });

    test('should return null for non existing IATA codes', function () {
      const airport = airportService.findByIataCode('XXX');
      expect(airport).toBeFalsy();
    });

    test('should return null for empty IATA codes', function () {
      const airport = airportService.findByIataCode('');
      expect(airport).toBeFalsy();
    });

    test('should return null for null IATA code', function () {
      const airport = airportService.findByIataCode();
      expect(airport).toBeFalsy();
    });
  });

  describe('fillAirportDescriptions', () => {
    test('should return an array of descriptions for each airport', () => {
      const descriptions = airportService.fillAirportDescriptions([
        'MAD',
        'CDG',
      ]);
      expect(descriptions[0]).toMatch(/Madrid.*Barajas.*MAD/);
      expect(descriptions[1]).toMatch(/Paris.*Gaulle.*CDG/);
    });
  });
});
