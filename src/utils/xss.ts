import { inHTMLData } from 'xss-filters';
import { RequestHandler, Request } from 'express';

const clean = (req: Request): Request => {
  if (req.body)
    req.body = JSON.parse(inHTMLData(JSON.stringify(req.body)).trim());
  if (req.query)
    req.query = JSON.parse(inHTMLData(JSON.stringify(req.query)).trim());
  if (req.params)
    req.params = JSON.parse(inHTMLData(JSON.stringify(req.params)).trim());

  return req;
};

const xss = (): RequestHandler => {
  return (req, _res, next) => {
    req = clean(req);
    next();
  };
};

export default xss;
