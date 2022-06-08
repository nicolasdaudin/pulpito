const axios = require('axios').default;

const DEFAULT_KIWI_PARAMS = {
  max_stopovers: 2,
  partner_market: 'fr',
  lang: 'fr',
  limit: 1000,
  flight_type: 'round',
  ret_from_diff_airport: 0,
  ret_to_diff_airport: 0,
  one_for_city: 1,
  fly_to: 'anywhere',
};

// FIXME: better handle errors
const getFlights = async (params) => {
  try {
    const response = await axios.get(process.env.KIWI_URL, {
      headers: {
        apikey: process.env.KIWI_API_KEY,
      },
      params: {
        ...DEFAULT_KIWI_PARAMS,
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

    return response;
  } catch (err) {
    // console.error(err.message);
    // console.error(err.response.data.error);
    // console.error(err.response.request.path);

    throw err;
  }
};

const prepareDefaultParams = (params) => {
  return {
    ...params,
    adults: params.adults || 1,
    children: params.children || 0,
    infants: params.infants || 0,
  };
};

module.exports = { getFlights, prepareDefaultParams };
