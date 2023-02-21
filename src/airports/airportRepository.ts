import { Airport, airports } from './airportModel';
import { countries } from '../countries/countryService';

export class AirportRepository {
  static all = (): Airport[] => {
    return (
      airports
        .filter((airport) =>
          ['medium_airport', 'large_airport'].includes(airport.type)
        )
        .filter((airport) => airport.iata_code)
        //.map(decodeAirport)
        .map((airport) => {
          return {
            ...airport,
            country: countries.get(airport.iso_country),
          };
        })
    );
  };

  static allLarge = (): Airport[] => {
    return AirportRepository.all().filter(
      (airport) => airport.type === `large_airport`
    );
  };

  static allMedium = (): Airport[] => {
    return AirportRepository.all().filter(
      (airport) => airport.type === `medium_airport`
    );
  };
}
