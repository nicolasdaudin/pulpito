const { Settings, Duration, DateTime } = require('luxon');
Settings.defaultLocale = 'fr';

/**
 * Filters destinations according to if they can be reached from all the origins.
 * Filters destinations that can not be reached from each origin.
 * Typically, we will have a lot of destinations corresponding to at least one each origin, but not to all of them
 * This is because for each origin we perform an API call and retrieve many destinations, but we want to keep only the destinations common to all the origins
 * @param {*} destinations a map of destinations, key is city name (i.e. 'Las Palmas de Gran Caria') and value is an array of the different flights corresponding to that destination.
 * @param {*} origins an array of the origins from which we are departing (as iata code, i.e. [ 'MAD', 'CDG', 'BRU' ])
 * @returns an array of destination cities
 */
const filterDestinationCities = (destinations, origins) => {
  return Array.from(destinations.keys()).filter((key) =>
    isCommonDestination(destinations.get(key), origins)
  );
};

/**
 * Checks if all the origins can be reached from that destination
 * @param {*} destination the destination
 * @param {*} origins array of origins (as iata code, i.e. [ 'MAD', 'CDG', 'BRU' ])
 * @returns true if all the origins can be reached from that destination, false otherwise
 */
const isCommonDestination = (destination, origins) => {
  // for each origin ('every'), I want to find it at least once as an origin ('cityCodeFrom' or 'flyFrom') in the list of flights corresponding to this destination ('destinations.get(key)')
  // be careful with cityCodeFrom and flyFrom : for metropolitan areas like London NewYork Paris and others, cityCodeFrom is the iata code of the metropolitan area, and flyFrom the actual airport
  // for example flyFrom=ORY and cityCodeFrom=PAR

  return origins.every(
    (origin) =>
      destination.findIndex(
        (value) => value.cityCodeFrom === origin || value.flyFrom === origin
      ) > -1
  );
};

/**
 * Prepare an object with all the flights corresponding to that destination, and compute some extra values like total duration, total price...
 * @param {*} dest the city name of the destination where we are going, i.e. 'Budapest'
 * @param {*} itineraries the list of all possible itineraries, that we are going to filter for that particular destination
 * @param {*} passengersPerOrigin a map representing the number of passengers per origin (as iata code), like {"MAD" => 1, "BOD" => 2}
 * @returns an object for that destination, with aggregated info
 */
const prepareItineraryData = (dest, itineraries, passengersPerOrigin) => {
  const itinerary = { cityTo: dest };

  // corresponding origins to that particular destination, we remove flights that do not go to that destination
  // itinerary.flights will have one item per origin
  itinerary.flights = itineraries.filter(
    (itinerary) => itinerary.cityTo === dest
  );

  // common to all origins, for that particular destination
  itinerary.countryTo = itinerary.flights[0].countryTo.name;
  itinerary.cityCodeTo = itinerary.flights[0].cityCodeTo;

  // compute total price
  itinerary.price = itinerary.flights.reduce(
    (sum, flight) => sum + flight.price,
    0
  );

  // total distance = the sum of the distance for each destination multiplied by the nb of passengers for that destination. It's not the same to fly 10 persons from Madrid to London and 1 from Madrid to Bangkok, than 1 from Madrid to London and 10 from Madrid to BKK.

  itinerary.distance = Math.trunc(
    itinerary.flights.reduce(
      (sum, flight) =>
        sum +
        (passengersPerOrigin.get(flight.flyFrom) ??
          passengersPerOrigin.get(flight.cityCodeFrom)) *
          flight.distance,
      0
    )
  );

  // total duration departure
  itinerary.totalDurationDepartureInMinutes = itinerary.flights.reduce(
    (sum, flight) => sum + flight.duration.departure / 60,
    0
  );

  // total duration return
  itinerary.totalDurationReturnInMinutes = itinerary.flights.reduce(
    (sum, flight) => sum + flight.duration['return'] / 60,
    0
  );

  return itinerary;
};

/**
 * TODO: merge with prepareItineraryData
 * Remove unnecessary data from API payload and regroup some other data by oneway and return flights
 * @param {*} input itinerary to be cleaned. Won't be mutated.
 * @returns a copy of the itinerary, but cleaned.
 */
const cleanItineraryData = (input) => {
  const itinerary = Object.assign({}, input);

  delete itinerary.type_flights;
  delete itinerary.nightsInDest;
  delete itinerary.quality;
  delete itinerary.conversion;
  // delete itinerary.fare;
  delete itinerary.bags_price;
  delete itinerary.baglimit;
  delete itinerary.availability;
  delete itinerary.countryFrom;
  // delete itinerary.countryTo;
  delete itinerary.routes;

  const filteredRoute = itinerary.route.map((r) => {
    delete r.fare_basis;
    delete r.fare_category;
    delete r.fare_classes;
    delete r.fare_family;
    delete r.bags_recheck_required;
    delete r.vi_connection;
    delete r.guarantee;
    delete r.equipment;
    delete r.vehicle_type;
    return r;
  });

  const onewayFlights = filteredRoute.filter((r) => r.return === 0);
  const returnFlights = filteredRoute.filter((r) => r.return === 1);

  // refactor info about each set of flights
  // FIXME: improve performance, this usually takes 0.6 or 0.8ms to complete (and we need to repeat that operation 600-700 times since there are 600-700 itineraries to be cleaned). Maybe an option is to completely remove that part and not clean-refactor data?
  // If we remove that part, indeed cleanItineraryData is only 3 to 5 ms instead of 250-300 ms
  const route = {
    oneway: {
      flights: onewayFlights,
      local_departure: formatTime(onewayFlights[0].local_departure),
      local_arrival: formatTime(
        onewayFlights[onewayFlights.length - 1].local_arrival
      ),
      utc_departure: formatTime(onewayFlights[0].utc_departure),
      utc_arrival: formatTime(
        onewayFlights[onewayFlights.length - 1].utc_arrival
      ),
      connections: extractConnections(onewayFlights),
      flyFrom: onewayFlights[0].flyFrom,
      flyTo: onewayFlights[onewayFlights.length - 1].flyTo,
      duration: Duration.fromMillis(
        itinerary.duration.departure * 1000
      ).toFormat("hh'h'mm"),
    },
  };

  // if there are return flights
  if (returnFlights && returnFlights.length > 0) {
    route.return = {
      flights: returnFlights,
      local_departure: formatTime(returnFlights[0].local_departure),
      local_arrival: formatTime(
        returnFlights[returnFlights.length - 1].local_arrival
      ),
      utc_departure: formatTime(returnFlights[0].utc_departure),
      utc_arrival: formatTime(
        returnFlights[returnFlights.length - 1].utc_arrival
      ),
      connections: extractConnections(returnFlights),
      flyFrom: returnFlights[0].flyFrom,
      flyTo: returnFlights[returnFlights.length - 1].flyTo,
      duration: Duration.fromMillis(itinerary.duration.return * 1000).toFormat(
        "hh'h'mm"
      ),
    };
  }

  itinerary.route = route;

  delete itinerary.tracking_pixel;
  delete itinerary.facilitated_booking_available;
  delete itinerary.pnr_count;
  delete itinerary.has_airport_change;
  delete itinerary.technical_stops;
  delete itinerary.throw_away_ticketing;
  delete itinerary.hidden_city_ticketing;
  delete itinerary.virtual_interlining;
  delete itinerary.transfers;
  delete itinerary.booking_token;
  // delete itinerary.deep_link;
  delete itinerary.local_arrival;
  delete itinerary.local_departure;
  delete itinerary.utc_arrival;
  delete itinerary.utc_departure;

  return itinerary;
};

/**
 * Extract connection data for this array of flights if any connection
 * @param {*} flights array of flights
 * @returns an array of flight connections
 */
const extractConnections = (flights) => {
  const connections = [];
  if (flights.length > 1) connections.push(flights[0].cityTo);
  if (flights.length > 2) connections.push(flights[1].cityTo);
  return connections;
};

/**
 * Format time received in API to a correct local time
 * @param {*} d time received from Kiwi API
 * @returns correct local time
 */
const formatTime = (d) => {
  // time received from Kiwi are supposed to ISO format local or ISO format UTC but they all end up 'Z' - 2022-10-24T21:10:00.000Z - like if it was London time, but it's not. To display a local time (which is what we want), we need to remove the Z part.
  const dWithoutZ = d.split('Z')[0];
  const result = DateTime.fromISO(dWithoutZ).toLocaleString(
    DateTime.DATETIME_MED_WITH_WEEKDAY
  );
  return result;
};

/**
 * Prepare params for Axios. Axios has to receive repeated parameters a particular way, otherwise only the first occurrence is taken into account
 * For example if we want params like fly_days=1&fly_days=2= ... (which is accepted by Kiwi)
 * @param {*} params the params to prepare for Axios
 * @returns a URLSearchParams object representing all the params necesarry for Axios call.
 */
const prepareAxiosParams = (params) => {
  var urlSearchParams = new URLSearchParams();

  for (param in params) {
    if (Array.isArray(params[param])) {
      for (key in params[param]) {
        urlSearchParams.append(param, params[param][key]);
      }
    } else {
      if (params[param]) urlSearchParams.append(param, params[param]);
    }
  }
  return urlSearchParams;
};

/**
 * Add Default params if not present
 * @param {*} params input params
 * @returns
 */
const prepareDefaultAPIParams = (params) => {
  return {
    ...params,
    adults: params.adults || 1,
    children: params.children || 0,
    infants: params.infants || 0,
  };
};

/**
 * Prepares params to use with KIWI api. Params come from View controllers
 *
 * TODO: unify API params and View Controllers params. Maybe think about adding this as middleware
 *
 * @param {*} params object with origins being an object with all the info for each origin
 *  {
      departureDate: '2022-09-30',
      returnDate: '2022-10-05',
      origins: {
        flyFrom: [ 'AGP', 'SEZ', 'OPO' ],
        adults: [ '1', '1', '1' ],
        children: [ '0', '0', '0' ],
        infants: [ '0', '0', '0' ]
      }
    }
 * @returns params preapred for Axios
 */
const prepareSeveralOriginAPIParamsFromView = (params) => {
  let { departureDate, returnDate, origins } = params;

  let baseParams = {
    departureDate: DateTime.fromISO(departureDate).toFormat(`dd'/'LL'/'yyyy`),
    returnDate: DateTime.fromISO(returnDate).toFormat(`dd'/'LL'/'yyyy`),
  };

  const allOriginParams = origins.flyFrom.map((_, i) => {
    return {
      ...baseParams,
      origin: origins.flyFrom[i],
      adults: origins.adults ? +origins.adults[i] : 1,
      children: origins.children ? +origins.children[i] : 0,
      infants: origins.infants ? +origins.infants[i] : 0,
    };
  });

  return allOriginParams;
};

/**
 * Prepares params to use with KIWI api. Params come from API calls.
 * 
 * TODO: unify API params and View Controllers params. Maybe think about adding this as middleware
 * 
 * @param {*} params object with origin being a string of comma-separated iata codes., and adults a string of comma separated number of adults  i.e.
 *  {
      departureDate: '09/12/2022',
      returnDate: '11/12/2022',
      adults: '1,1,7',
      children: '1,1,2',
      origin: 'MAD,OPO,LIS'
    }
 * @returns
 */
const prepareSeveralOriginAPIParams = (params) => {
  const origins = params.origin.split(',');
  const adults = params.adults
    ? params.adults.split(',')
    : new Array(origins.length).fill(1);
  const children = params.children
    ? params.children.split(',')
    : new Array(origins.length).fill(0);
  const infants = params.infants
    ? params.infants.split(',')
    : new Array(origins.length).fill(0);

  return origins.map((origin, i) => {
    return {
      ...params,
      origin,
      adults: +adults[i],
      children: +children[i],
      infants: +infants[i],
    };
  });
};

module.exports = {
  cleanItineraryData,
  extractConnections,
  filterDestinationCities,
  isCommonDestination,
  prepareItineraryData,
  prepareAxiosParams,
  prepareDefaultAPIParams,
  prepareSeveralOriginAPIParams,
  prepareSeveralOriginAPIParamsFromView,
};
