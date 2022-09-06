const fs = require('fs');
const utf8 = require('utf8');
const countries = require('./countryService');
const buffer = require('buffer');

const airports = JSON.parse(
  fs.readFileSync(`${__dirname}/../datasets/airport-codes.json`)
)
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

const reencodeString = (str) => {
  return utf8.decode(
    buffer.transcode(Buffer.from(str), 'utf8', 'latin1').toString('latin1')
  );
};

const normalizeString = (str) =>
  reencodeString(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const reencodeAirport = (airport) => {
  // if (airport.iata_code === 'AGP') {
  //   console.log(
  //     utf8.decode(
  //       buffer
  //         .transcode(Buffer.from(airport.municipality), 'utf8', 'latin1')
  //         .toString('latin1')
  //     )
  //   );
  // }
  return {
    ...airport,
    municipality: airport.municipality
      ? reencodeString(airport.municipality)
      : null,
    name: airport.name ? reencodeString(airport.name) : null,
  };
};

const airportContainsQuerySearch = (airport, str) => {
  const strToLowerCase = str.toLowerCase();
  return (
    (airport.municipality &&
      normalizeString(airport.municipality)
        .toLowerCase()
        .includes(strToLowerCase)) ||
    (airport.name &&
      normalizeString(airport.name).toLowerCase().includes(strToLowerCase)) ||
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
      normalizeString(airport.municipality)
        .toLowerCase()
        .startsWith(strToLowerCase)) ||
    (airport.name &&
      normalizeString(airport.name).toLowerCase().startsWith(strToLowerCase)) ||
    (airport.iata_code &&
      airport.iata_code.toLowerCase().startsWith(strToLowerCase))
    //   ||
    // (airport.country &&
    //   airport.country.toLowerCase().startsWith(strToLowerCase))
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
exports.searchByString = (searchStr) => {
  // first check if 'str' is not empty or null
  if (!searchStr) return [];

  const str = searchStr.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  console.log(searchStr, str);

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
  console.time(str);

  // for performance reasons, we convert to a Map to be able to map a iata_code to the corresponding airport. Which is much faster than doing a map and a find ...
  const airportsMap = new Map(
    airports.map((airport) => [airport.iata_code, airport])
  );

  const uniqueAirports = uniqueIataCodes.map((iata_code) =>
    airportsMap.get(iata_code)
  );

  console.timeEnd(str);

  // finally filter out some unnecessary fields (like continent, ...) and reencode special characters for display

  return uniqueAirports
    .slice(0, 10)
    .map(filterAirportFields)
    .map(reencodeAirport);
};

exports.findByIataCode = (iataCode) => {
  if (!iataCode) return null;

  return airports.find(
    (airport) =>
      airport.iata_code &&
      airport.iata_code.toLowerCase() === iataCode.toLowerCase()
  );
};
