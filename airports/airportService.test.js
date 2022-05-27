const airportService = require('./airportService');
const assert = require('assert').strict;

describe('AirportService', function () {
  describe('searchByString', function () {
    test('should be able to retrieve airports by any string', function () {
      const airports = airportService.searchByString('paris');
      expect(airports.length).toBeGreaterThan(0);
    });

    test('should work the same for lower and upper case strings', function () {
      const airportsLower = airportService.searchByString('paris');
      const airportsUpper = airportService.searchByString('PARIS');
      assert.strictEqual(airportsLower.length, airportsUpper.length);
    });

    test('should retrieve an empty array for non existing strings', function () {
      const airports = airportService.searchByString('xxxxxxx');
      assert.strictEqual(airports.length, 0);
    });

    test('should retrieve an empty array for empty strings', function () {
      const airports = airportService.searchByString('');
      assert.strictEqual(airports.length, 0);
    });

    test('should retrieve an empty array for null strings', function () {
      const airports = airportService.searchByString();
      assert.strictEqual(airports.length, 0);
    });
  });

  describe('findByIataCode', function () {
    test('should be able to retrieve airports by any IATA code', function () {
      const airport = airportService.findByIataCode('CDG');
      assert.strictEqual(airport.iata_code, 'CDG');
    });

    test('should work the same for lower and upper IATA codes', function () {
      const airportLower = airportService.findByIataCode('CDG');
      const airportUpper = airportService.findByIataCode('cdg');
      assert.strictEqual(airportLower.iata_code, airportUpper.iata_code);
    });

    test('should return null for non existing IATA codes', function () {
      const airport = airportService.findByIataCode('XXX');
      assert.ifError(airport);
    });

    test('should return null for empty IATA codes', function () {
      const airport = airportService.findByIataCode('');
      assert.ifError(airport);
    });

    test('should return null for null IATA code', function () {
      const airport = airportService.findByIataCode();
      assert.ifError(airport);
    });
  });
});
