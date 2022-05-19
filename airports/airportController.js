const airportService = require('./airportService');

exports.search = (req, res) => {
  const query = req.params.q;

  const airports = airportService.searchByString(query);
  // console.log(airports);

  res.status(200).json({
    status: 'success',
    results: airports.length,
    data: {
      airports,
    },
  });
};
