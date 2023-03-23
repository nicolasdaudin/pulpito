import flightService from '../data/flightService';
import helper from '../utils/apiHelper';
import { RegularFlightsParams } from '../common/types';

const buildCommonItineraries = async (
  allOriginsParams: RegularFlightsParams[],
  origins: string[]
) => {
  // create one GET call for each origin
  const searchDestinations = allOriginsParams.map((params) =>
    flightService.getFlights(params)
  );
  const allFlights = await Promise.all(searchDestinations);

  // concat data coming from all the GET calls into one 'allResponses' variable
  // for eahc GET call, we concat the value from data.data (contain all he info for each itinerary)
  const itineraries = allFlights.reduce(
    (acc, flights) => acc.concat(flights),
    []
  );

  // group the array by field item.flyTo and extract all possible destinations
  // Array.groupByToMap is in stage 3 proposal
  // can be switched to lodash.groupBy (https://lodash.com/docs/4.17.15#groupBy)
  // const destinations = groupByToMap(itineraries, (item) => {
  //   return item.cityTo;
  // });
  const destinations = helper.groupByDestination(itineraries);

  // only the destinations that are common to all the origins in that request
  // i.e. if origins is ['JFK','LON', 'CDG'] and all origins have destination 'Dubai' but only 'JFK' and 'CDG' have destination 'Bangkok', only 'Dubai' will kept
  const filteredDestinationCities = helper.filterDestinationCities(
    destinations,
    origins
  );

  // build a map with the total number of passengers per origin
  const passengersPerOrigin =
    helper.getMapPassengersPerOrigin(allOriginsParams);

  // only keep itineraries that have a destination in the list of common destinations
  // if an itinerary goes from Madrid to Dublin but doesn't go from Paris to Dublin, we will not keep Dublin
  const filteredItineraries = itineraries.filter((itinerary) =>
    filteredDestinationCities.includes(itinerary.cityTo)
  );

  // For each destination, have an array with the flights, total price and total distance and total duration
  // (preparing for display)
  // and sort by price
  const commonItineraries = filteredDestinationCities.map((dest) =>
    helper.prepareDestinationData(
      dest,
      filteredItineraries,
      passengersPerOrigin
    )
  );
  return commonItineraries;
};

export = {
  buildCommonItineraries,
};
