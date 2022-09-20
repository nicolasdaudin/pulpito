const { Settings, Duration, DateTime } = require('luxon');
Settings.defaultLocale = 'fr';

const filterDestinationCities = (destinations, origins) => {
  return Array.from(destinations.keys()).filter((key) =>
    isCommonDestination(destinations.get(key), origins)
  );
};

const isCommonDestination = (destination, origins) => {
  // for each origin ('every'), I want to find it at least once as an origin ('cityCodeFrom') in the list of flights corresponding to this destination ('destinations.get(key)')
  return origins.every(
    (origin) =>
      destination.findIndex((value) => value.cityCodeFrom === origin) > -1
  );
};

// Prepare an object with all the flights corresponding to that destination, and compute some values like total duration, total price...
const prepareItineraryData = (dest, itineraries) => {
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
  itinerary.totalPrice = itinerary.flights.reduce(
    (sum, flight) => sum + flight.price,
    0
  );

  // total distance
  itinerary.totalDistance = itinerary.flights.reduce(
    (sum, flight) => sum + flight.distance,
    0
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
 * Remove unnecessary info from API payload
 * @param {*} itinerary
 * @returns
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

const extractConnections = (flights) => {
  const connections = [];
  if (flights.length > 1) connections.push(flights[0].cityTo);
  if (flights.length > 2) connections.push(flights[1].cityTo);
  return connections;
};

const formatTime = (d) =>
  DateTime.fromISO(d).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY);

const prepareAxiosParams = (params) => {
  var urlSearchParams = new URLSearchParams();

  for (param in params) {
    // console.log('prepareAxiosParams', param, params[param]);
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

const prepareDefaultAPIParams = (params) => {
  return {
    ...params,
    adults: params.adults || 1,
    children: params.children || 0,
    infants: params.infants || 0,
  };
};

// TODO: (CLEAN CODE) check if this method return the same kind of objects than prepareDefaultParams above.
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
};
