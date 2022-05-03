const { Settings, Duration, DateTime } = require('luxon');
Settings.defaultLocale = 'fr';

exports.cleanItineraryData = (itinerary) => {
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

  // add easy to mainpulate info about each set of flights
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
      duration: Duration.fromMillis(
        itinerary.duration.departure * 1000
      ).toFormat("hh'h'mm"),
    },
    return: {
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
      duration: Duration.fromMillis(itinerary.duration.return * 1000).toFormat(
        "hh'h'mm"
      ),
    },
  };
  itinerary.route = route;

  //

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
  delete itinerary.deep_link;
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
  DateTime.fromISO(d).toLocaleString(DateTime.DATETIME_SHORT);
