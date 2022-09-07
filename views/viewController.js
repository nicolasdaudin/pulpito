const destinationsService = require('../destinations/destinationsService');
const { catchAsync, catchAsyncKiwi } = require('../utils/catchAsync');
const DateTime = require('luxon').DateTime;

exports.getHome = (req, res) => {
  res.render('home');
};

exports.getCommon = catchAsync(async (req, res, next) => {
  res.render('common', {
    status: 'success',
    results: 0,
    data: [],
  });
});

exports.getFlights = catchAsync(async (req, res, next) => {
  console.log('req.body', req.body);

  let { departureDate, returnDate, origins } = req.body;

  let baseParams = {
    departureDate: DateTime.fromISO(departureDate).toFormat(`dd'/'LL'/'yyyy`),
    returnDate: DateTime.fromISO(returnDate).toFormat(`dd'/'LL'/'yyyy`),
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
});
