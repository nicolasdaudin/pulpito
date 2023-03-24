/* eslint-disable @typescript-eslint/no-explicit-any */
import { Query, Send, Response, Request } from 'express-serve-static-core';
import { APISuccessAnswer, FilterParams } from './types';

export interface TypedRequestQueryWithFilter<T extends Query, K = FilterParams>
  extends Request {
  filter?: K;
  query: T;
}

export interface APISuccessResponse<T = APISuccessAnswer, U = any>
  extends Response<T, U, 200> {
  json: Send<T, this>;
}
