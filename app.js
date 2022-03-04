const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const app = express();
const axios = require('axios').default;
const groupBy = require('core-js/actual/array/group-by');
const groupByToMap = require('core-js-pure/actual/array/group-by-to-map');
const { cleanItineraryData } = require('./helper');

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// body parser, reading data from body into req.body
// and limiting body size
app.use(express.json({ limit: '10kb' })); // middleware to add body in the request data

// serving static files
app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  console.log('connected');
  res.status(200).json({
    status: 'success',
    message: 'connected',
  });
});

const User = mongoose.model('User', {
  name: String,
  role: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
});

app.get('/users/', async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

app.get('/test/', async (req, res) => {
  try {
    const response = await axios.get(
      'https://jsonplaceholder.typicode.com/users'
    );
    console.log(response.data);
    res.status(200).json({
      status: 'success',
      data: response.data,
    });
  } catch (err) {
    console.error(err);
  }
});

app.get('/test-kiwi/return/', async (req, res) => {
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
        max_stopovers: 1,
        partner_market: 'fr',
        lang: 'fr',
        limit: 1000,
        flight_type: 'round',
        ret_from_diff_airport: 0,
        ret_to_diff_airport: 0,
      },
    });
    const response = await instance.get('', {
      params: {
        fly_from: req.query.origin,
        dateFrom: req.query.departureDate,
        fly_to: 'anywhere',
        dateTo: req.query.departureDate,
        returnFrom: req.query.returnDate,
        returnTo: req.query.returnDate,
      },
    });
    // const response = await axios.get('https://tequila-api.kiwi.com/v2/search', {
    //   headers: {
    //     apikey: 'ul0LzzIMoMoVSSHoI1KyQshH2shl4Eup',
    //   },
    //   params: {
    //     fly_from: req.query.origin,
    //     dateFrom: req.query.departureDate,
    //     fly_to: 'anywhere',
    //     dateTo: req.query.departureDate,
    //     max_stopovers: 0,
    //     partner_market: 'fr',
    //     lang: 'fr',
    //   },
    // });
    // console.log(response.data);
    // console.log(instance.defaults.params);
    console.log(response.request.path);
    // console.log(response.request.url);
    // console.log(response.request.search);
    // console.log(response.request);

    const flights = response.data.data.map((flight) => {
      delete flight.type_flights;
      delete flight.nightsInDest;
      delete flight.quality;
      delete flight.conversion;
      delete flight.fare;
      delete flight.bags_price;
      delete flight.baglimit;
      delete flight.availability;
      delete flight.countryFrom;
      delete flight.countryTo;
      delete flight.routes;

      const route = flight.route.map((r) => {
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
      flight.route = route;

      delete flight.tracking_pixel;
      delete flight.facilitated_booking_available;
      delete flight.pnr_count;
      delete flight.has_airport_change;
      delete flight.technical_stops;
      delete flight.throw_away_ticketing;
      delete flight.hidden_city_ticketing;
      delete flight.virtual_interlining;
      delete flight.transfers;
      delete flight.booking_token;
      delete flight.deep_link;
      delete flight.local_arrival;
      delete flight.local_departure;
      delete flight.utc_arrival;
      delete flight.utc_departure;

      return flight;
    });

    // const test = [
    //   {
    //     id: '049800ed4add0000d9372a69_0|00ed04984ae00000e28c871e_0',
    //     flyFrom: 'BOD',
    //     flyTo: 'MRS',
    //     cityFrom: 'Bordeaux',
    //     cityCodeFrom: 'BOD',
    //     cityTo: 'Marseille',
    //     cityCodeTo: 'MRS',
    //   },
    //   {
    //     id: '0a2200ed4add000089585f90_0|00ed0a224ae00000864daae5_0',
    //     flyFrom: 'MAD',
    //     flyTo: 'MRS',
    //     cityFrom: 'Madrid',
    //     cityCodeFrom: 'MAD',
    //     cityTo: 'Marseille',
    //     cityCodeTo: 'MRS',
    //   },
    //   {
    //     id: '0a2200ed4add000089585f90_0|00ed0a224ae00000864daae5_0',
    //     flyFrom: 'MAD',
    //     flyTo: 'BLQ',
    //     cityFrom: 'Madrid',
    //     cityCodeFrom: 'MAD',
    //     cityTo: 'Bologne',
    //     cityCodeTo: 'BLQ',
    //   },
    // ];
    // group the array by field item.flyTo
    // Array.groupByToMap is in stage 3 proposal
    // can be switched to lodash.groupBy (https://lodash.com/docs/4.17.15#groupBy)
    const destinations = groupByToMap(flights, (item) => {
      return item.cityTo;
    });

    const wantedOrigins = ['MAD', 'BRU', 'BOD'];

    // const destinations = flights.groupByToMap(({ flyTo }) => flyTo);
    console.log(destinations.size);
    const filteredDestinationCities = Array.from(destinations.keys()).filter(
      (key) => {
        // for each origin ('every'), I want to find it at least once as an origin ('flyFrom') in the list of flights corresponding to this destination ('destinations.keys()')
        return wantedOrigins.every(
          (dest) =>
            destinations.get(key).findIndex((value) => value.flyFrom === dest) >
            -1
        );
      }
    );

    console.log(filteredDestinationCities);

    res.status(200).json({
      status: 'success',
      results: flights.length, //response.data.data.length,
      data: flights, //flights,
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
});

app.get('/kiwi/return/', async (req, res) => {
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
    const searchDestinations = origins.map((origin) =>
      instance.get('', {
        params: {
          fly_from: origin,
          dateFrom: req.query.departureDate,
          dateTo: req.query.departureDate,
          returnFrom: req.query.returnDate,
          returnTo: req.query.returnDate,
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

    const response = responses[0];

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
        if (key === 'Lisbonne') {
          console.log('Lisbonne');
        }
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
});

app.get('/test-kiwi/one-way/', async (req, res) => {
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
        max_stopovers: 1,
        partner_market: 'fr',
        lang: 'fr',
      },
    });
    const response = await instance.get('', {
      params: {
        fly_from: req.query.origin,
        dateFrom: req.query.departureDate,
        fly_to: 'anywhere',
        dateTo: req.query.departureDate,
      },
    });
    // const response = await axios.get('https://tequila-api.kiwi.com/v2/search', {
    //   headers: {
    //     apikey: 'ul0LzzIMoMoVSSHoI1KyQshH2shl4Eup',
    //   },
    //   params: {
    //     fly_from: req.query.origin,
    //     dateFrom: req.query.departureDate,
    //     fly_to: 'anywhere',
    //     dateTo: req.query.departureDate,
    //     max_stopovers: 0,
    //     partner_market: 'fr',
    //     lang: 'fr',
    //   },
    // });
    // console.log(response.data);
    // console.log(instance.defaults.params);
    console.log(response.request.path);
    // console.log(response.request.url);
    // console.log(response.request.search);
    // console.log(response.request);
    res.status(200).json({
      status: 'success',
      results: response.data.data.length,
      data: response.data,
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
      console.log('Error', error.message);
    }
  }
});

app.post('/users/', async (req, res) => {
  const { name, email, role } = req.body;

  const user = new User({ name, role, email });

  const newUser = await user.save();
  console.log(newUser);

  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

module.exports = app;
