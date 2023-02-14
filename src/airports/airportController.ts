import { Request, Response } from 'express';
import { searchByString } from './airportService';
import { Query } from 'express-serve-static-core';
interface TypedRequestQuery<T extends Query> extends Request {
  query: T;
}
export const getAirports = (
  req: TypedRequestQuery<{ q: string }>,
  res: Response
) => {
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
