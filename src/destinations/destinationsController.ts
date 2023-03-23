import helper from '../utils/apiHelper';
import { catchAsyncKiwi } from '../utils/catchAsync';
import flightService from '../data/flightService';
import destinationsService from './destinationsService';
import resultsHelper from '../utils/resultsHelper';
import {
  FilterParams,
  RegularFlightsParams,
  WeekendFlightsParams,
} from '../common/types';
import { TypedRequestQueryWithFilter } from '../common/interfaces';
import { APISuccessResponse } from '../common/interfaces';

/**
 * Find cheapest destinations from this origin.
 * By default, if nothing is specified for adults, we search for 1 adult per destination.
 *
 * FIXME: improve error handling, check if some parameters do not exist ...
 *
 * @param {*} req
 * @param {*} res
 */
const getCheapestDestinations = catchAsyncKiwi(
  async (
    req: TypedRequestQueryWithFilter<RegularFlightsParams>,
    res: APISuccessResponse
  ): Promise<void> => {
    const params = helper.prepareDefaultAPIParams(
      req.query
    ) as RegularFlightsParams;

    let itineraries = await flightService.getFlights(params);

    const totalResults = itineraries.length;
    itineraries = resultsHelper.applyFilters(itineraries, req.filter);

    res.status(200).json({
      status: 'success',
      totalResults,
      shownResults: itineraries.length,
      data: itineraries, //itineraries,
    });
  }
);

/**
 * Find common destinations to several origins.
 * By default, if nothing is specified for adults, we search for 1 adult per destination.
 *
 * FIXME: improve error handling, check if some parameters do not exist ...
 * @param {*} req
 * @param {*} res
 */
const getCommonDestinations = catchAsyncKiwi(
  async (
    req: TypedRequestQueryWithFilter<RegularFlightsParams>,
    res: APISuccessResponse
  ): Promise<void> => {
    console.info(
      'API - Getting common destinations with these params',
      req.query
    );
    const allOriginsParams = helper.prepareSeveralOriginAPIParams(req.query);

    // const instance = prepareAxiosRequest();

    const origins = req.query.origin.split(',');

    let destinations = await destinationsService.buildCommonItineraries(
      allOriginsParams,
      origins
    );
    const totalResults = destinations.length;
    destinations = resultsHelper.applyFilters(destinations, req.filter);
    res.status(200).json({
      status: 'success',
      totalResults,
      shownResults: destinations.length,
      data: destinations,
    });
  }
);

const getCheapestWeekend = catchAsyncKiwi(
  async (
    req: TypedRequestQueryWithFilter<WeekendFlightsParams, FilterParams>,
    res: APISuccessResponse
  ): Promise<void> => {
    const params = helper.prepareDefaultAPIParams(
      req.query
    ) as WeekendFlightsParams;

    let itineraries = await flightService.getWeekendFlights(params);

    const totalResults = itineraries.length;

    itineraries = resultsHelper.applyFilters(itineraries, req.filter);

    res.status(200).json({
      status: 'success',
      totalResults,
      shownResults: itineraries.length,
      data: itineraries, //flights,
    });
  }
);

export = {
  getCheapestDestinations,
  getCommonDestinations,
  getCheapestWeekend,
};
