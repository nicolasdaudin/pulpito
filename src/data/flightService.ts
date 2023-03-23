import axios from 'axios';
import helper from '../utils/apiHelper';
import { setupCache } from 'axios-cache-interceptor';
import {
  DayOfWeek,
  Itinerary,
  KiwiAPIAllDaysParams,
  KiwiAPIWeekendParams,
  KiwiBaseAPIParams,
  KiwiItinerary,
  RegularFlightsParams,
  WeekendFlightsParams,
  WeekendLengthEnum,
} from '../common/types';

// type DefaultKiwiAPIParams = {
//   max_stopovers: 2;
//   partner_market: 'fr';
//   lang: 'fr';
//   limit: 1000;
//   flight_type: 'round' | 'oneway';
//   ret_from_diff_airport?: 0 | 1;
//   ret_to_diff_airport?: 0 | 1;
//   one_for_city: 1;
//   atime_from?: string;
//   atime_to?: string;
//   ret_dtime_from?: string;
//   ret_dtime_to?: string;
// }

const DEFAULT_KIWI_API_PARAMS: Partial<KiwiBaseAPIParams> = {
  max_stopovers: 2,
  partner_market: 'fr',
  lang: 'fr',
  limit: 1000,
  flight_type: 'round',
};
const DEFAULT_ADULTS_PARAM = 1;
const DEFAULT_CHILDREN_PARAM = 0;
const DEFAULT_INFANTS_PARAM = 0;

setupCache(axios, { ttl: 1000 * 60 * 15 }); //15 minutes

// FIXME: better handle errors
const getFlights = async (
  params: RegularFlightsParams
): Promise<Itinerary[]> => {
  try {
    const axiosParams: KiwiAPIAllDaysParams = {
      ...DEFAULT_KIWI_API_PARAMS,
      fly_to: 'anywhere',
      fly_from: params.origin,
      dateFrom: params.departureDate,
      dateTo: params.departureDate,
      returnFrom: params.returnDate,
      returnTo: params.returnDate,
      adults: +(params.adults ?? DEFAULT_ADULTS_PARAM),
      children: +(params.children ?? DEFAULT_CHILDREN_PARAM),
      infants: +(params.infants ?? DEFAULT_INFANTS_PARAM),
      ret_from_diff_airport: 0,
      ret_to_diff_airport: 0,
      one_for_city: 1,
    };
    // atime_from: '10:00',
    // atime_to: '22:00',
    // ret_dtime_from: '15:00',
    // ret_dtime_to: '21:00',
    if (!process.env.KIWI_URL || !process.env.KIWI_API_KEY)
      throw new Error('Missing KIWI_URL or KIWI_API_KEY environment variables');
    const response = await axios.get(process.env.KIWI_URL, {
      headers: {
        apikey: process.env.KIWI_API_KEY,
      },
      params: axiosParams,
    });

    if (response && response.data) {
      const kiwiItineraries: KiwiItinerary[] = response.data.data;
      return kiwiItineraries.map(helper.convertKiwiItineraryToItinerary);
    } else {
      return [];
    }
  } catch (err) {
    console.error(err.message);
    // console.error(err.response.data.error);
    // console.error(err.response.request.path);

    throw err;
  }
};

// FIXME: added 'any' to allow compiler
const getWeekendFlights = async (
  params: WeekendFlightsParams
): Promise<Itinerary[]> => {
  // var flyingDaysParams = new URLSearchParams();
  // flyingDaysParams.append('fly_days', 4);
  // flyingDaysParams.append('fly_days', 5);
  // flyingDaysParams.append('fly_days', 6);

  // FIXME: added 'any' to allow compiler, otherwise it fails. Please create a type or interface.
  let axiosParams: KiwiAPIWeekendParams = {
    ...DEFAULT_KIWI_API_PARAMS,
    fly_from: params.origin,
    fly_to: params.destination,
    dateFrom: params.departureDateFrom,
    dateTo: params.departureDateTo,
    adults: +(params.adults ?? DEFAULT_ADULTS_PARAM),
    children: +(params.children ?? DEFAULT_CHILDREN_PARAM),
    infants: +(params.infants ?? DEFAULT_INFANTS_PARAM),
  };

  if (params.weekendLength === WeekendLengthEnum.LONG) {
    axiosParams = {
      ...axiosParams,

      fly_days: [DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY],
      ret_fly_days: [DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY],
      nights_in_dst_from: 3,
      nights_in_dst_to: 4,
    };
  }
  if (
    !params.weekendLength ||
    params.weekendLength === WeekendLengthEnum.SHORT
  ) {
    axiosParams = {
      ...axiosParams,
      fly_days: [DayOfWeek.FRIDAY, DayOfWeek.SATURDAY],
      ret_fly_days: [DayOfWeek.SUNDAY, DayOfWeek.MONDAY],
      nights_in_dst_from: 1,
      nights_in_dst_to: 2,
    };
  }

  try {
    if (!process.env.KIWI_URL || !process.env.KIWI_API_KEY)
      throw new Error('Missing KIWI_URL or KIWI_API_KEY environment variables');

    const preparedAxiosParams =
      helper.prepareWeekendParamsForAxios(axiosParams);
    const response = await axios.get(
      `${process.env.KIWI_URL}?${preparedAxiosParams.toString()}`,
      {
        headers: {
          apikey: process.env.KIWI_API_KEY,
        },
      }
    );

    if (response && response.data) {
      const kiwiItineraries: KiwiItinerary[] = response.data.data;
      return kiwiItineraries.map(helper.convertKiwiItineraryToItinerary);
    } else {
      return [];
    }
  } catch (err) {
    console.error(err.message);
    // console.error(err.response.data.error);
    // console.error(err.response.request.path);

    throw err;
  }
};

export = { getFlights, getWeekendFlights };
