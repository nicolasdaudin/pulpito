const destinationsService = require('../destinations/destinationsService');

exports.getHome = async (req, res) => {
  const baseParams = {
    departureDate: '09/12/2022',
    returnDate: '11/12/2022',
  };
  const allOriginParams = [
    { ...baseParams, origin: 'MAD', adults: 1, children: 0, infants: 0 },
    { ...baseParams, origin: 'BRU', adults: 7, children: 0, infants: 0 },
    { ...baseParams, origin: 'BOD', adults: 1, children: 0, infants: 0 },
  ];
  const origins = ['MAD', 'BOD', 'BRU'];

  const commonItineraries = await destinationsService.buildCommonItineraries(
    allOriginParams,
    origins
  );

  res.render('home', {
    status: 'success',
    results: commonItineraries.length,
    data: commonItineraries,
  });
};
