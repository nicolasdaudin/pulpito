import {
  airportContainsQuerySearch,
  airportStartsWithQuerySearch,
} from './airportHelper';
import { Airport } from './airportModel';

describe('AirportHelper', () => {
  describe('airportContainsQuerySearch', () => {
    test('should return true if any of airport municipality, name or iata_code contains query search', () => {
      const airport: Airport = {
        iata_code: 'CDG',
        iso_country: 'FR',
        municipality: 'Paris',
        name: 'Charles de Gaulle International Airport',
        type: 'large_airport',
      };

      const querySearch = 'PAR';
      expect(airportContainsQuerySearch(airport, querySearch)).toBe(true);
    });

    test('should return false if none of airport municipality, name or iata_code does contains query search', () => {
      const airport: Airport = {
        iata_code: 'CDG',
        iso_country: 'FR',
        municipality: 'Roissy en Brie',
        name: 'Charles de Gaulle International Airport',
        type: 'large_airport',
      };

      const querySearch = 'PAR';
      expect(airportContainsQuerySearch(airport, querySearch)).toBe(false);
    });
  });

  describe('airportStartsWithQuerySearch', () => {
    test('should return true if any of airport municipality, name or iata_code starts with query search', () => {
      const airport: Airport = {
        iata_code: 'CDG',
        iso_country: 'FR',
        municipality: 'Paris',
        name: 'Charles de Gaulle International Airport',
        type: 'large_airport',
      };

      const querySearch = 'PAR';
      expect(airportStartsWithQuerySearch(airport, querySearch)).toBe(true);
    });

    test('should return false if none of airport municipality, name or iata_code starts with query search', () => {
      const airport: Airport = {
        iata_code: 'CDG',
        iso_country: 'FR',
        municipality: 'Roissy sur Paris',
        name: 'Charles de Gaulle Paris International Airport',
        type: 'large_airport',
      };

      const querySearch = 'PAR';
      expect(airportStartsWithQuerySearch(airport, querySearch)).toBe(false);
    });
  });
});
