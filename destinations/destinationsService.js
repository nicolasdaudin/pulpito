const flightService = require('../data/flightService');
const groupByToMap = require('core-js-pure/actual/array/group-by-to-map');
const helper = require('../utils/apiHelper');

const buildCommonItineraries = async (allOriginsParams, origins) => {
  // create one GET call for each origin
  const searchDestinations = allOriginsParams.map((params) =>
    flightService.getFlights(params)
  );
  const responses = await Promise.all(searchDestinations);

  // concat data coming from all the GET calls into one 'allResponses' variable
  // for eahc GET call, we concat the value from data.data (contain all he info for each itinerary)
  const itineraries = responses.reduce(
    (acc, curr) => acc.concat(curr.data.data),
    []
  );

  // group the array by field item.flyTo and extract all possible destinations
  // Array.groupByToMap is in stage 3 proposal
  // can be switched to lodash.groupBy (https://lodash.com/docs/4.17.15#groupBy)
  const destinations = groupByToMap(itineraries, (item) => {
    return item.cityTo;
  });

  // only the destinations that are common to all the origins in that request
  // i.e. if origins is ['JFK','LON', 'CDG'] and all origins have destination 'Dubai' but only 'JFK' and 'CDG' have destination 'Bangkok', only 'Dubai' will kept
  const filteredDestinationCities = helper.filterDestinationCities(
    destinations,
    origins
  );

  // build a map with the total number of passengers per origin
  const passengersPerOrigin = new Map(
    allOriginsParams.map((oneOriginParam) => [
      oneOriginParam.origin,
      oneOriginParam.adults + oneOriginParam.children + oneOriginParam.infants,
    ])
  );

  // only keep itineraries that have a destination in the list of common destinations
  // if an itinerary goes from Madrid to Dublin but doesn't go from Paris to Dublin, we will not keep Dublin
  const filteredItineraries = itineraries.filter((itinerary) =>
    filteredDestinationCities.includes(itinerary.cityTo)
  );

  // remove unnecessary fields
  // FIXME: this operation takes now 100-250ms to complete, depending on the number of itineraries to clean
  const cleanedItineraries = filteredItineraries.map(helper.cleanItineraryData);

  // For each destination, have an array with the flights, total price and total distance and total duration
  // (preparing for display)
  // and sort by price
  const commonItineraries = filteredDestinationCities.map((dest) =>
    helper.prepareItineraryData(dest, cleanedItineraries, passengersPerOrigin)
  );

  return commonItineraries;
};

module.exports = {
  buildCommonItineraries,
};
