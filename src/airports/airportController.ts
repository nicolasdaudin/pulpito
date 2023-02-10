import { searchByString } from './airportService';

export const getAirports = (req, res) => {
  const queryString = req.query.q;

  const airports = searchByString(queryString);

  res.status(200).json({
    status: 'success',
    results: airports.length,
    data: {
      airports,
    },
  });
};
