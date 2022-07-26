const destinationsService = require('../destinations/destinationsService');

exports.getHome = (req, res) => {
  res.render('home');
};

exports.getCommon = async (req, res) => {
  console.log('req.body');
  console.log(req.body);
  const { departureDate, returnDate, origins } = req.body;

  const baseParams = {
    departureDate,
    returnDate,
  };

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

  res.render('search', {
    status: 'success',
    results: commonItineraries.length,
    data: commonItineraries,
  });
};
