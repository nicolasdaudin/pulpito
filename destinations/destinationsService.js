const flightService = require('../data/flightService');
const { cleanItineraryData } = require('../utils/apiHelper');
const groupByToMap = require('core-js-pure/actual/array/group-by-to-map');

exports.buildCommonItineraries = async (allOriginsParams, origins) => {
  // create one GET call for each origin
  const searchDestinations = allOriginsParams.map((params) =>
    flightService.getFlights(params)
  );

  const responses = await Promise.all(searchDestinations);

  // concat data coming from all the GET calls into one 'allResponses' variable
  // for eahc GET call, we concat the value from data.data (contain all he info for each itinerary)
  const allResponses = responses.reduce(
    (acc, curr) => acc.concat(curr.data.data),
    []
  );

  // remove unnecessary fields
  // FIXME: this operation takes 500-700 ms to complete, check inside cleanItineraryData

  // console.log(`${allResponses.length} itineraries need to be cleaned`);
  const itineraries = allResponses.map(cleanItineraryData);
  // console.log('itineraries[0]', itineraries[0]);
  // group the array by field item.flyTo and extract all possible destinations
  // Array.groupByToMap is in stage 3 proposal
  // can be switched to lodash.groupBy (https://lodash.com/docs/4.17.15#groupBy)
  const destinations = groupByToMap(itineraries, (item) => {
    return item.cityTo;
  });

  // only the destinations that are common to all the origins in that request
  // i.e. if origins is ['JFK','LON', 'CDG'] and all origins have destination 'Dubai' but only 'JFK' and 'CDG' have destination 'Bangkok', only 'Dubai' will kept
  const filteredDestinationCities = filterDestinationCities(
    destinations,
    origins
  );

  console.log(
    `${filteredDestinationCities.length} common destinations found: ${filteredDestinationCities}`
  );

  // For each destination, have an array with the flights, total price and total distance and total duration
  // (preparing for display)
  // and sort by price
  const commonItineraries = filteredDestinationCities
    .map((dest) => prepareItineraryData(dest, itineraries))
    .sort((a, b) => a.totalPrice - b.totalPrice);

  return commonItineraries;
};

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

const prepareItineraryData = (dest, itineraries) => {
  const itinerary = { cityTo: dest };

  // corresponding origins to that particular destination
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
