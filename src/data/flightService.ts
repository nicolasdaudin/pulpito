const axios = require('axios').default;
import helper = require('../utils/apiHelper');
const { setupCache } = require('axios-cache-interceptor');

setupCache(axios, { ttl: 1000 * 60 * 15 }); //15 minutes

// FIXME: added 'any' to allow compiler
const getWeekendFlights = async (params) => {
  // var flyingDaysParams = new URLSearchParams();
  // flyingDaysParams.append('fly_days', 4);
  // flyingDaysParams.append('fly_days', 5);
  // flyingDaysParams.append('fly_days', 6);

  // FIXME: added 'any' to allow compiler, otherwise it fails. Please create a type or interface.
  let axiosParams: any = {
    max_stopovers: 2,
    partner_market: 'fr',
    lang: 'fr',
    limit: 1000,
    flight_type: 'round',

    // atime_from: '10:00',
    // atime_to: '22:00',
    // ret_dtime_from: '15:00',
    // ret_dtime_to: '21:00',
    fly_from: params.origin,
    fly_to: params.destination,
    dateFrom: params.departureDateFrom,
    dateTo: params.departureDateTo,
    adults: params.adults,
    children: params.children,
    infants: params.infants,
  };

  if (params.weekendLength === 'long') {
    axiosParams = {
      ...axiosParams,
      fly_days: [4, 5, 6],
      ret_fly_days: [0, 1, 2],
      nights_in_dst_from: 3,
      nights_in_dst_to: 4,
    };
  }
  if (!params.weekendLength || params.weekendLength === 'short') {
    axiosParams = {
      ...axiosParams,
      fly_days: [5, 6],
      ret_fly_days: [0, 1],
      nights_in_dst_from: 1,
      nights_in_dst_to: 2,
    };
  }

  try {
    const preparedAxiosParams = helper.prepareAxiosParams(axiosParams);
    const response = await axios.get(
      `${process.env.KIWI_URL}?${preparedAxiosParams.toString()}`,
      {
        headers: {
          apikey: process.env.KIWI_API_KEY,
        },
      }
    );
    if (response && response.data) {
      return response.data.data;
    } else {
      return [];
    }
  } catch (err) {
    console.error(err.message);
    // console.error(err.response.data.error);
    // console.error(err.response.request.path);

    throw err;
  }
};

// FIXME: better handle errors
const getFlights = async (params) => {
  try {
    const response = await axios.get(process.env.KIWI_URL, {
      headers: {
        apikey: process.env.KIWI_API_KEY,
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
        // atime_from: '10:00',
        // atime_to: '22:00',
        // ret_dtime_from: '15:00',
        // ret_dtime_to: '21:00',
        fly_from: params.origin,
        dateFrom: params.departureDate,
        dateTo: params.departureDate,
        returnFrom: params.returnDate,
        returnTo: params.returnDate,
        adults: params.adults,
        children: params.children,
        infants: params.infants,
      },
    });

    if (response && response.data) {
      return response.data.data;
    } else {
      return [];
    }
  } catch (err) {
    console.error(err.message);
    // console.error(err.response.data.error);
    // console.error(err.response.request.path);

    throw err;
  }
};

module.exports = {
  getWeekendFlights,
  getFlights,
};
