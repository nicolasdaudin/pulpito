const airportService = require('./airportService');

exports.getAirports = (req, res) => {
  const queryString = req.query.q;

  const airports = airportService.searchByString(queryString);
  // console.log(airports);

  res.status(200).json({
    status: 'success',
    results: airports.length,
    data: {
      airports,
    },
  });
};
