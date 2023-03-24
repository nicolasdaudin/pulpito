import validator from '../../utils/validator';
import validatorJs from 'validator';
import AppError from '../../utils/appError';
import { NextFunction, Response } from 'express';
import { TypedRequestQueryWithFilter } from '../../common/interfaces';
import {
  BaseParamModel,
  FilterParams,
  ParamModel,
  QueryParams,
  RegularFlightsParams,
  WeekendFlightsParams,
} from '../../common/types';
import { getFilterParamsFromQueryParams } from './validatorHelper';

const ONE_CITYCODE_PARAM_MODEL: BaseParamModel = {
  required: true,
  typeCheck: validatorJs.isAlpha,
  errorMsg: 'only airport or airport area codes, for example LON or JFK', // see https://wikitravel.org/en/Metropolitan_Area_Airport_Codes
};
const SEVERAL_CITYCODES_PARAM_MODEL = {
  required: true,
  typeCheck: validator.isCommaSeparatedAlpha,
  errorMsg: `a comma-separated list of IATA airport or airport area codes, for example 'JFK,BRU' (but not 'JFK,BRU,')`,
};
const DATE_PARAM_MODEL = {
  required: true,
  typeCheck: (str: string) => validatorJs.isDate(str, { format: 'DD/MM/YYYY' }),
  errorMsg: `a date of format DD/MM/YYYY, for example 22/06/2022`,
};
const ONE_PASSENGER_PARAM_MODEL = {
  required: false,
  typeCheck: validatorJs.isNumeric,
  errorMsg: 'a number, for example 2',
};
const SEVERAL_PASSENGERS_PARAM_MODEL = {
  required: false,
  typeCheck: validator.isCommaSeparatedNumeric,
  errorMsg: `a comma-separated list of numbers, for example '2,1' (but not '2,1,')`,
};

/**
 * Express Middleware to add a filter object to req object, if any filters present in the query params
 * Filters are specified in PARAMS_TO_FILTER
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const filterParams = (
  req: TypedRequestQueryWithFilter<QueryParams, FilterParams>,
  res: Response,
  next: NextFunction
) => {
  if (req.query) {
    req.filter = getFilterParamsFromQueryParams(req.query);
  }
  next();
};

/**
 * Express middleware to validate request parameters for weekend-type routes, with an open range of dates (origin and  destination are both a 3-letters city code, and are required, and dates are specified with parameters departureDateFrom and departureDateTo, which specify a date to begin to start searching, and a date to end the search, but it's not return dates)
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const validateRequestParamsWeekend = (
  req: TypedRequestQueryWithFilter<WeekendFlightsParams>,
  res: Response,
  next: NextFunction
) => {
  const requestModelParams: ParamModel[] = [
    { name: 'origin', ...ONE_CITYCODE_PARAM_MODEL },
    {
      name: 'destination',
      ...ONE_CITYCODE_PARAM_MODEL,
    },
    {
      name: 'departureDateFrom',
      ...DATE_PARAM_MODEL,
    },
    {
      name: 'departureDateTo',
      ...DATE_PARAM_MODEL,
    },
    {
      name: 'adults',
      ...ONE_PASSENGER_PARAM_MODEL,
    },
    {
      name: 'children',
      ...ONE_PASSENGER_PARAM_MODEL,
    },
    {
      name: 'infants',
      ...ONE_PASSENGER_PARAM_MODEL,
    },
  ];

  checkMissingParams(requestModelParams, req.query, next);
  checkWrongTypeParams(requestModelParams, req.query, next);

  next();
};

/**
 * Express middleware to validate request parameters for many-origins routes with a specified range of dates (origin param is a comma-separated list of 3-letters city codes and dates are specified with parameters departureDate and returnDate)
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const validateRequestParamsManyOrigins = (
  req: TypedRequestQueryWithFilter<RegularFlightsParams>,
  res: Response,
  next: NextFunction
) => {
  // FIXME: is this really necessary to be so specific about parameter types? isn't it better to have a good documentation and only send an error msg like "Parameters have wrong type"
  const requestModelParams: ParamModel[] = [
    { name: 'origin', ...SEVERAL_CITYCODES_PARAM_MODEL },
    {
      name: 'departureDate',
      ...DATE_PARAM_MODEL,
    },
    {
      name: 'returnDate',
      ...DATE_PARAM_MODEL,
    },
    {
      name: 'adults',
      ...SEVERAL_PASSENGERS_PARAM_MODEL,
    },
    {
      name: 'children',
      ...SEVERAL_PASSENGERS_PARAM_MODEL,
    },
    {
      name: 'infants',
      ...SEVERAL_PASSENGERS_PARAM_MODEL,
    },
  ];

  checkMissingParams(requestModelParams, req.query, next);
  checkWrongTypeParams(requestModelParams, req.query, next);

  const origins = req.query.origin?.split(',') || [];

  const adults = req.query.adults
    ? req.query.adults.split(',')
    : new Array(origins.length).fill(1);
  if (origins.length !== adults.length)
    return next(
      new AppError(
        `Not the same number of origins and adults specified, was expecting either ${origins.length} adults or ${adults.length} origins`,
        400
      )
    );

  const children = req.query.children
    ? req.query.children.split(',')
    : new Array(origins.length).fill(0);
  if (origins.length !== children.length)
    return next(
      new AppError(
        `Not the same number of origins and children specified, was expecting either ${origins.length} children or ${children.length} origins`,
        400
      )
    );

  const infants = req.query.infants
    ? req.query.infants.split(',')
    : new Array(origins.length).fill(0);
  if (origins.length !== infants.length)
    return next(
      new AppError(
        `Not the same number of origins and infants specified, was expecting either ${origins.length} infants or ${infants.length} origins`,
        400
      )
    );
  next();
};

/**
 * Express middleware to validate request parameters for one-origin routes  with a specified range of dates (origin is just a 3-letters city code and dates are specified with departureDate and returnDate)
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const validateRequestParamsOneOrigin = (
  req: TypedRequestQueryWithFilter<RegularFlightsParams>,
  res: Response,
  next: NextFunction
) => {
  // FIXME: is this really necessary to be so specific about parameter types? isn't it better to have a good documentation and only send an error msg like "Parameters have wrong type"
  const requestModelParams: ParamModel[] = [
    {
      name: 'origin',
      ...ONE_CITYCODE_PARAM_MODEL,
    },
    {
      name: 'departureDate',
      ...DATE_PARAM_MODEL,
    },
    {
      name: 'returnDate',
      ...DATE_PARAM_MODEL,
    },
    {
      name: 'adults',
      ...SEVERAL_PASSENGERS_PARAM_MODEL,
    },
    {
      name: 'children',
      ...SEVERAL_PASSENGERS_PARAM_MODEL,
    },
    {
      name: 'infants',
      ...SEVERAL_PASSENGERS_PARAM_MODEL,
    },
  ];

  checkMissingParams(requestModelParams, req.query, next);
  checkWrongTypeParams(requestModelParams, req.query, next);

  next();
};

/**
 * Check if there any params with a wrong type
 * Calls next() if any error
 * @param {*} modelParams the model
 * @param {*} query the query parameters
 * @param {*} next the next call if there is an error
 * @returns if no wrong type params
 */
const checkWrongTypeParams = (
  modelParams: ParamModel[],
  query: QueryParams,
  next: NextFunction
) => {
  const wrongTypeParams = validator.findWrongTypeParams(modelParams, query);
  if (wrongTypeParams.length > 0) {
    const errorMsg = modelParams
      .filter((param) => wrongTypeParams.includes(param.name))
      .map((param) => `'${param.name}' should be ${param.errorMsg}`)
      .join(', ');
    return next(
      new AppError(
        `Following parameters do not have the expected type: ${errorMsg}`,
        400
      )
    );
  }
};

/**
 * Check if there any missing params
 * Calls next() if any error
 * @param {*} modelParams the model
 * @param {*} query the query parameters
 * @param {*} next the next call if there is an error
 * @returns if no missing  params
 */
const checkMissingParams = (
  modelParams: ParamModel[],
  query: QueryParams,
  next: NextFunction
) => {
  const missingParams = validator.findMissingParams(modelParams, query);
  if (missingParams.length > 0)
    return next(
      new AppError(
        `Please provide missing parameter(s) to process this request: ${missingParams.join(
          ','
        )}`,
        400
      )
    );
};
