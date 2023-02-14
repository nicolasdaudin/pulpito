import {
  fillAirportDescriptions,
  findByIataCode,
  searchByString,
} from './airportService';

describe('AirportService', function () {
  describe('searchByString', function () {
    test('should be able to retrieve airports by any string', function () {
      const airports = searchByString('paris');
      expect(airports.length).toBeGreaterThan(0);
    });

    test('should work the same for lower and upper case strings', function () {
      const airportsLower = searchByString('paris');
      const airportsUpper = searchByString('PARIS');
      const airportsLowerAndUpper = searchByString('PaRiS');
      expect(airportsLower.length === airportsUpper.length).toBe(true);
      expect(airportsLower.length === airportsLowerAndUpper.length).toBe(true);
    });

    test('should retrieve an empty array for non existing strings', function () {
      const airports = searchByString('xxxxxxx');
      expect(airports).toHaveLength(0);
    });

    test('should retrieve an empty array for empty strings', function () {
      const airports = searchByString('');
      expect(airports).toHaveLength(0);
    });
  });

  describe('findByIataCode', function () {
    test('should be able to retrieve airports by any IATA code', function () {
      const airport = findByIataCode('CDG');
      expect(airport.iata_code).toBe('CDG');
    });

    test('should work the same for lower and upper IATA codes', function () {
      const airportLower = findByIataCode('CDG');
      const airportUpper = findByIataCode('cdg');
      const airportLowerAndUpper = findByIataCode('CdG');
      expect(airportLower.iata_code === airportUpper.iata_code).toBe(true);
      expect(airportLower.iata_code === airportLowerAndUpper.iata_code).toBe(
        true
      );
    });

    test('should return null for non existing IATA codes', function () {
      const airport = findByIataCode('XXX');
      expect(airport).toBeFalsy();
    });

    test('should return null for empty IATA codes', function () {
      const airport = findByIataCode('');
      expect(airport).toBeFalsy();
    });
  });

  describe('fillAirportDescriptions', () => {
    test('should return an array of descriptions for each airport', () => {
      const descriptions = fillAirportDescriptions(['MAD', 'CDG']);
      expect(descriptions[0]).toMatch(/Madrid.*Barajas.*MAD/);
      expect(descriptions[1]).toMatch(/Paris.*Gaulle.*CDG/);
    });
  });
});
