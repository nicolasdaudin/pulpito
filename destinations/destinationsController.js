const { cleanItineraryData } = require('../utils/helper');
const axios = require('axios').default;
const groupByToMap = require('core-js-pure/actual/array/group-by-to-map');
const AppError = require('../utils/appError');

/**
 * Find cheapest destinations to this origin.
 * By default, if nothing is specified for adults, we search for 1 adult per destination.
 *
 * @param {*} req
 * @param {*} res
 */
exports.getCheapestDestinations = async (req, res, next) => {
  try {
    // perform KIWI API call (TODO: to refactor in a different function to be able to be API-agnostic)
    const instance = axios.create({
      baseURL: 'https://tequila-api.kiwi.com/v2/search',
      headers: {
        apikey: 'ul0LzzIMoMoVSSHoI1KyQshH2shl4Eup',
      },
      params: {
        max_stopovers: 2,
        partner_market: 'fr',
        lang: 'fr',
        limit: 1000,
        flight_type: 'round',
        ret_from_diff_airport: 0,
        ret_to_diff_airport: 0,
        one_for_city: 1,
        fly_to: 'anywhere',
      },
    });
    const response = await instance.get('', {
      params: {
        fly_from: req.query.origin,
        dateFrom: req.query.departureDate,
        dateTo: req.query.departureDate,
        returnFrom: req.query.returnDate,
        returnTo: req.query.returnDate,
        adults: req.query.adults || 1,
        children: req.query.children || 0,
        infants: req.query.infants || 0,
      },
    });

    const flights = response.data.data.map(cleanItineraryData);

    res.status(200).json({
      status: 'success',
      results: flights.length, //response.data.data.length,
      data: flights, //flights,
    });
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx

      console.log(
        'Error while processing the request to KIWI : ',
        error.response.data
      );
      return next(
        new AppError(
          `Error in 3rd party API : ${error.response.data.error}`,
          error.response.status
        )
      );
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error);
    }
  }
};

/**
 * Find common destinations to several origins.
 * By default, if nothing is specified for adults, we search for 1 adult per destination.
 *
 * @param {*} req
 * @param {*} res
 */
exports.getCommonDestinations = async (req, res) => {
  try {
    // const { origin, departureDate } = req.params;
    console.log(req.query);

    // const params = new URLSearchParams(req.params);

    const instance = axios.create({
      baseURL: 'https://tequila-api.kiwi.com/v2/search',
      headers: {
        apikey: 'ul0LzzIMoMoVSSHoI1KyQshH2shl4Eup',
      },
      params: {
        max_stopovers: 4,
        partner_market: 'fr',
        lang: 'fr',
        limit: 1000,
        flight_type: 'round',
        ret_from_diff_airport: 0,
        ret_to_diff_airport: 0,
        one_for_city: 1,
        fly_to: 'anywhere',
      },
    });

    const origins = req.query.origin.split(',');
    const adults = req.query.adults
      ? req.query.adults.split(',')
      : new Array(origins.length).fill(1);
    const children = req.query.children
      ? req.query.children.split(',')
      : new Array(origins.length).fill(0);
    const infants = req.query.infants
      ? req.query.infants.split(',')
      : new Array(origins.length).fill(0);

    const searchDestinations = origins.map((origin, i) =>
      instance.get('', {
        params: {
          fly_from: origin,
          dateFrom: req.query.departureDate,
          dateTo: req.query.departureDate,
          returnFrom: req.query.returnDate,
          returnTo: req.query.returnDate,
          adults: adults[i],
          children: children[i],
          infants: infants[i],
        },
      })
    );

    console.time('searchDestinations');

    const responses = await Promise.all(searchDestinations);
    // const response = await instance.get('', {
    //   params: {
    //     fly_from: req.query.origin,
    //     dateFrom: req.query.departureDate,
    //     dateTo: req.query.departureDate,
    //     returnFrom: req.query.returnDate,
    //     returnTo: req.query.returnDate,
    //   },
    // });
    console.timeEnd('searchDestinations');
    console.time('findCommonDestinations');
    console.log(responses.length);

    const allResponses = responses.reduce(
      (acc, curr) => acc.concat(curr.data.data),
      []
    );
    console.log(allResponses.length);

    const itineraries = allResponses.map(cleanItineraryData);

    // group the array by field item.flyTo
    // Array.groupByToMap is in stage 3 proposal
    // can be switched to lodash.groupBy (https://lodash.com/docs/4.17.15#groupBy)
    const destinations = groupByToMap(itineraries, (item) => {
      return item.cityTo;
    });

    console.log('destinations before common', destinations.keys());

    // const wantedOrigins = ['MAD', 'BRU', 'BOD'];

    const filteredDestinationCities = Array.from(destinations.keys()).filter(
      (key) => {
        // for each origin ('every'), I want to find it at least once as an origin ('flyFrom') in the list of flights corresponding to this destination ('destinations.keys()')
        return origins.every(
          (origin) =>
            destinations
              .get(key)
              .findIndex((value) => value.cityCodeFrom === origin) > -1
        );
      }
    );

    // console.log(filteredDestinationCities);
    console.log(
      `${filteredDestinationCities.length} common destinations found: ${filteredDestinationCities}`
    );

    console.timeEnd('findCommonDestinations');

    // For each destination, have an array with the flights, total price and total distance and total duration
    const commonItineraries = filteredDestinationCities.map((dest) => {
      const itinerary = { cityTo: dest };

      // look for flights
      itinerary.flights = itineraries.filter(
        (itinerary) => itinerary.cityTo === dest
      );
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
    });

    // console.log(commonItineraries[0]);
    // console.log(commonItineraries[43]);

    res.status(200).json({
      status: 'success',
      results: commonItineraries.length,
      data: commonItineraries,
    });
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error);
    }
  }
};
