import { Request } from 'express';
import { Query } from 'express-serve-static-core';

export interface TypedRequestQueryWithFilter<T extends Query, K>
  extends Request {
  filter?: K;
  query: T;
}
