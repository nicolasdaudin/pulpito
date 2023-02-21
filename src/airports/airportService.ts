/* eslint-disable no-unused-vars */
import { countries } from '../countries/countryService';
import fs from 'fs';
import path from 'path';

import utils from '../utils/utils';

const airportCodes = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../datasets/airport-codes.json'),
    'utf-8'
  )
);

const airports = airportCodes
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
  });

const largeAirports = airports.filter(
  (airport) => airport.type === `large_airport`
);

const mediumAirports = airports.filter(
  (airport) => airport.type === `medium_airport`
);

const reencodeAirport = (airport) => {
  if (!airport) return null;
  return {
    ...airport,
    municipality: airport.municipality
      ? utils.reencodeString(airport.municipality)
      : null,
    name: airport.name ? utils.reencodeString(airport.name) : null,
  };
};

const airportContainsQuerySearch = (airport, str) => {
  const strToLowerCase = str.toLowerCase();
  return (
    (airport.municipality &&
      utils
        .normalizeString(airport.municipality)
        .toLowerCase()
        .includes(strToLowerCase)) ||
    (airport.name &&
      utils
        .normalizeString(airport.name)
        .toLowerCase()
        .includes(strToLowerCase)) ||
    (airport.iata_code &&
      airport.iata_code.toLowerCase().includes(strToLowerCase))
    //   ||
    // (airport.country && airport.country.toLowerCase().includes(strToLowerCase))
  );
};

const airportStartsWithQuerySearch = (airport, str) => {
  const strToLowerCase = str.toLowerCase();
  return (
    (airport.municipality &&
      utils
        .normalizeString(airport.municipality)
        .toLowerCase()
        .startsWith(strToLowerCase)) ||
    (airport.name &&
      utils
        .normalizeString(airport.name)
        .toLowerCase()
        .startsWith(strToLowerCase)) ||
    (airport.iata_code &&
      airport.iata_code.toLowerCase().startsWith(strToLowerCase))
    //   ||
    // (airport.country &&
    //   airport.country.toLowerCase().startsWith(strToLowerCase))
  );
};

const filterAirportFields = (airport) => {
  const { iata_code, iso_country, municipality, name, type } = airport;
  return { iata_code, iso_country, municipality, name, type };
};

/**
 * Returns the first 10 results
 * @param {*} str
 * @returns
 */
export const searchByString = (searchStr: string) => {
  // first check if 'str' is not empty or null
  if (!searchStr) return [];

  const str = searchStr.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // then get the BIG airports starting with the query string
  const largeStartsWith = largeAirports.filter((airport) =>
    airportStartsWithQuerySearch(airport, str)
  );
  // then get the MEDIUM airports starting with the query string
  const mediumStartsWith = mediumAirports.filter((airport) =>
    airportStartsWithQuerySearch(airport, str)
  );
  // then get the BIG airports that have the query string in their info
  const largeContains = largeAirports.filter((airport) =>
    airportContainsQuerySearch(airport, str)
  );
  // and finally the MEDIUM airports that have the query string in their info
  const mediumContains = mediumAirports.filter((airport) =>
    airportContainsQuerySearch(airport, str)
  );

  // the filters above will return some results more than once
  // let's make a Set of unique IATA_CODES
  const uniqueIataCodes = Array.from(
    new Set(
      largeStartsWith
        .concat(mediumStartsWith)
        .concat(largeContains)
        .concat(mediumContains)
        .map((airport) => airport.iata_code)
    )
  );

  // for performance reasons, we convert to a Map to be able to map a iata_code to the corresponding airport. Which is much faster than doing a map and a find ...
  const airportsMap = new Map(
    airports.map((airport) => [airport.iata_code, airport])
  );

  const uniqueAirports = uniqueIataCodes.map((iata_code) =>
    airportsMap.get(iata_code)
  );

  // finally filter out some unnecessary fields (like continent, ...) and reencode special characters for display

  return uniqueAirports
    .slice(0, 10)
    .map(filterAirportFields)
    .map(reencodeAirport);
};

export const findByIataCode = (iataCode: string) => {
  if (!iataCode) return null;

  const airport = airports.find(
    (airport) =>
      airport.iata_code &&
      airport.iata_code.toLowerCase() === iataCode.toLowerCase()
  );
  return reencodeAirport(airport);
};

/**
 * When a user searches for the first time, airport info are retrieved from frontend thanks to a call to /api/vX/airports/?q= ....airportTo avoid calling
 * When the search is answered, the front is rerendered. Part of it is the search form, that we refill with the data used by the user.
 * To avoid to make a new call to /api airports, we just prefill the airport descriptions for the airports chosen by the user.
 * @param {*} iataCodes city iata codes chosen by the user
 * @returns array with the airport descrptions for each iata code
 */
export const fillAirportDescriptions = (iataCodes) => {
  return iataCodes.map((iataCode) => {
    const airportInfo = findByIataCode(iataCode);
    return `${airportInfo.municipality} - ${airportInfo.name} (${airportInfo.iata_code}) - ${airportInfo.country}`;
  });
};
