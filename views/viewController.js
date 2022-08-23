const destinationsService = require('../destinations/destinationsService');

exports.getHome = (req, res) => {
  res.render('home');
};

exports.getCommon = async (req, res) => {
  res.render('common', {
    status: 'success',
    results: 0,
    data: [],
  });
};

exports.getFlights = async (req, res) => {
  console.log('req.body', req.body);

  let { departureDate, returnDate, origins } = req.body;

  let baseParams = {
    departureDate,
    returnDate,
  };

  // // static data to simulate PUG
  // baseParams = { departureDate: '09/12/2022', returnDate: '11/12/2022' };
  // origins = {
  //   flyFrom: ['MAD', 'AGP', 'BER', 'LON'],
  //   adults: [6, 1, 1, 1],
  //   children: [0, 0, 0, 0],
  //   infants: [0, 0, 0, 0],
  // };

  const allOriginParams = origins.flyFrom.map((_, i) => {
    return {
      ...baseParams,
      origin: origins.flyFrom[i],
      adults: origins.adults[i],
      children: origins.children[i],
      infants: origins.infants[i],
    };
  });
  const originCodes = origins.flyFrom;

  const commonItineraries = await destinationsService.buildCommonItineraries(
    allOriginParams,
    originCodes
  );

  // const commonItineraries = [];
  res.render('common', {
    status: 'success',
    results: commonItineraries.length,
    data: commonItineraries,
  });
};
