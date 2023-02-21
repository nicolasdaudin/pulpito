import utils from '../utils/utils';
import { Airport } from './airportModel';

export const airportContainsQuerySearch = (
  airport: Airport,
  str: string
): boolean => {
  return (
    (airport.municipality && includesString(airport.municipality, str)) ||
    (airport.name && includesString(airport.name, str)) ||
    (airport.iata_code && includesString(airport.iata_code, str))
    //   ||
    // (airport.country && airport.country.toLowerCase().includes(strToLowerCase))
  );
};

export const airportStartsWithQuerySearch = (
  airport: Airport,
  str: string
): boolean => {
  return (
    (airport.municipality && startsWith(airport.municipality, str)) ||
    (airport.name && startsWith(airport.name, str)) ||
    (airport.iata_code && startsWith(airport.iata_code, str))
    //   ||
    // (airport.country &&
    //   airport.country.toLowerCase().startsWith(strToLowerCase))
  );
};

export const reencodeAirport = (airport: Airport): Airport => {
  if (!airport) return null;
  return {
    ...airport,
    municipality: airport.municipality
      ? utils.reencodeString(airport.municipality)
      : null,
    name: airport.name ? utils.reencodeString(airport.name) : null,
  };
};

const includesString = (property: string, str: string): boolean => {
  const strToLowerCase = str.toLowerCase();
  return utils.normalizeString(property).toLowerCase().includes(strToLowerCase);
};

const startsWith = (property: string, str: string): boolean => {
  const strToLowerCase = str.toLowerCase();
  return utils
    .normalizeString(property)
    .toLowerCase()
    .startsWith(strToLowerCase);
};
