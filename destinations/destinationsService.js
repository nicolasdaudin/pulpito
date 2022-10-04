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
  const allResponses = responses.reduce(
    (acc, curr) => acc.concat(curr.data.data),
    []
  );

  // remove unnecessary fields
  // FIXME: this operation takes 500-700 ms to complete, check inside cleanItineraryData

  // console.log(`${allResponses.length} itineraries need to be cleaned`);
  const itineraries = allResponses.map(helper.cleanItineraryData);
  // console.log('itineraries[0]', itineraries[0]);
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

  // console.log(
  //   `${filteredDestinationCities.length} common destinations found: ${filteredDestinationCities}`
  // );

  // For each destination, have an array with the flights, total price and total distance and total duration
  // (preparing for display)
  // and sort by price
  const commonItineraries = filteredDestinationCities.map((dest) =>
    helper.prepareItineraryData(dest, itineraries)
  );

  return commonItineraries;
};

module.exports = {
  buildCommonItineraries,
};
