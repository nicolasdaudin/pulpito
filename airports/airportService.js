const fs = require('fs');
const utf8 = require('utf8');
const countries = require('./countryService');

const airports = JSON.parse(
  fs.readFileSync(`${__dirname}/../datasets/airport-codes.json`)
)
  .filter((airport) =>
    ['medium_airport', 'large_airport'].includes(airport.type)
  )
  .map((airport) => {
    return {
      ...airport,
      country: countries.get(airport.iso_country),
    };
  });

const decodeAirport = (airport) => {
  return {
    ...airport,
    municipality: airport.municipality
      ? utf8.decode(airport.municipality)
      : null,
  };
};

const largeAirports = airports
  .filter((airport) => airport.type === `large_airport`)
  .map(decodeAirport);

const mediumAirports = airports
  .filter((airport) => airport.type === `medium_airport`)
  .map(decodeAirport);

const airportContainsQuerySearch = (airport, str) => {
  const strToLowerCase = str.toLowerCase();
  return (
    (airport.municipality &&
      airport.municipality.toLowerCase().includes(strToLowerCase)) ||
    (airport.name && airport.name.toLowerCase().includes(strToLowerCase)) ||
    (airport.iata_code &&
      airport.iata_code.toLowerCase().includes(strToLowerCase)) ||
    (airport.country && airport.country.toLowerCase().includes(strToLowerCase))
  );
};

const airportStartsWithQuerySearch = (airport, str) => {
  const strToLowerCase = str.toLowerCase();
  return (
    (airport.municipality &&
      airport.municipality.toLowerCase().startsWith(strToLowerCase)) ||
    (airport.name && airport.name.toLowerCase().startsWith(strToLowerCase)) ||
    (airport.iata_code &&
      airport.iata_code.toLowerCase().startsWith(strToLowerCase)) ||
    (airport.country &&
      airport.country.toLowerCase().startsWith(strToLowerCase))
  );
};

const filterAirportFields = (airport) => {
  const {
    continent,
    coordinates,
    elevation_ft,
    gps_code,
    ident,
    iso_region,
    local_code,
    ...filteredFields
  } = airport;
  return { ...filteredFields };
};

/**
 * Returns the first 10 results
 * @param {*} str
 * @returns
 */
exports.searchByString = (str) => {
  // first check if 'str' is not empty or null
  if (!str) return [];

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

  // array of the corresponding airports
  const uniqueAirports = uniqueIataCodes.map((iata_code) =>
    airports.find((airport) => airport.iata_code === iata_code)
  );

  // finally filter out some unnecessary fields (like continent, ...)
  return uniqueAirports.slice(0, 10).map(filterAirportFields);
};

exports.findByIataCode = (iataCode) => {
  if (!iataCode) return null;

  return airports.find(
    (airport) =>
      airport.iata_code &&
      airport.iata_code.toLowerCase() === iataCode.toLowerCase()
  );
};
