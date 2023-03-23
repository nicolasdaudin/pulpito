/**
 * Itinerary represents a full travel, with :
 * - its outbound (oneway) and inbound (return) routes
 * - its connections
 */
export type Itinerary = {
  flyFrom: IataCode;
  flyTo: IataCode;
  cityFrom: string;
  cityCodeFrom: IataCode;
  cityTo: string;
  cityCodeTo: IataCode;
  countryTo: {
    code: string; // 'PT'
    name: string; // 'Portugal'
  };
  distance: number;
  duration: { departure: number; return: number; total: number };
  fare: { adults: number; children: number; infants: number };
  price: number;
  // route: Route[];
  onewayRoute: Route;
  returnRoute?: Route;
  // route uses, in common.pug
  // - [oneway|return].connections
  // - [oneway|return].local_departure
  // - [oneway|return].local_arrival
  // - [oneway|return].duration
  deep_link: URL;
  // local_arrival: ISODate;
  // utc_arrival: ISODate;
  // local_departure: ISODate;
  // utc_departure: ISODate;
};

/**
 * DestinationWithItineraries represents several full travel options (from several origins). For each given destination we have
 * - the city it goes to
 * - the total price
 * - the total distance
 * - its several itineraries (one for each origin)
 */
export type DestinationWithItineraries = {
  cityTo: string;
  itineraries: Itinerary[];
  countryTo: string;
  cityCodeTo: string;
  price: number;
  distance: number;
  // totalDurationDepartureInMinutes: number;
  // totalDurationReturnInMinutes: number;
};

/**
 * Route represents one or several flights from Point A to Point B
 */
export type Route = {
  connections: string[];
  local_arrival: ISODate;
  utc_arrival: ISODate;
  local_departure: ISODate;
  utc_departure: ISODate;
  duration: string; // hh'h'mm
};

export type KiwiRoute = {
  flyFrom: IataCode;
  flyTo: IataCode;
  cityFrom: string;
  cityCodeFrom: IataCode;
  cityTo: string;
  cityCodeTo: IataCode;
  return: number;
  local_arrival: ISODate;
  utc_arrival: ISODate;
  local_departure: ISODate;
  utc_departure: ISODate;
};

export type KiwiItinerary = {
  flyFrom: IataCode;
  flyTo: IataCode;
  cityFrom: string;
  cityCodeFrom: IataCode;
  cityTo: string;
  cityCodeTo: IataCode;
  countryTo: {
    code: string; // 'PT'
    name: string; // 'Portugal'
  };
  distance: number;
  duration: { departure: number; return: number; total: number };
  fare: { adults: number; children: number; infants: number };
  price: number;
  route: KiwiRoute[];
  deep_link: URL;
  // local_arrival: ISODate;
  // utc_arrival: ISODate;
  // local_departure: ISODate;
  // utc_departure: ISODate;
};

export type IataCode = string; // 3 letters
export type DateDDMMYYYY = string; // string date with format DD/MM/YYYY like "29/01/2023"
type ISODate = string; // string date with iso format like "2023-12-17T09:30:00.000Z"
type URL = string; // for urls

export enum WeekendLengthEnum {
  LONG = 'long',
  SHORT = 'short',
}

export type RegularFlightsParams = {
  origin: string;
  departureDate: string;
  returnDate: string;
  adults?: string;
  children?: string;
  infants?: string;
} & QueryParams;

export type WeekendFlightsParams = {
  origin: string;
  destination: string;
  departureDateFrom: string;
  departureDateTo: string;
  adults?: string;
  children?: string;
  infants?: string;
  weekendLength?: WeekendLengthEnum;
} & QueryParams;

export type QueryParams = {
  [key: string]: string; // necessary to dynamically check properties in validator.
  sort?: string;
  limit?: string;
  page?: string;
  maxConnections?: string;
  priceFrom?: string;
  priceTo?: string;
};

export type FilterParams = {
  sort: string;
  limit: number;
  page: number;
  maxConnections?: number;
  priceFrom?: number;
  priceTo?: number;
};

export type APISuccessAnswer = {
  status: 'success';
  totalResults: number;
  shownResults: number;
  data: object[];
};

export type BaseParamModel = {
  required: boolean;
  typeCheck: (str: string) => boolean;
  errorMsg: string;
};
export type ParamModel = BaseParamModel & { name: string };

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export type KiwiBaseAPIParams = {
  fly_from: IataCode;
  dateFrom: DateDDMMYYYY;
  dateTo: DateDDMMYYYY;
  adults: number;
  children: number;
  infants: number;
  max_stopovers?: number;
  partner_market?: string;
  lang?: string;
  limit?: number;
  flight_type?: 'round' | 'oneway';
};

export type KiwiAPIWeekendParams = {
  fly_to: IataCode;

  fly_days?: DayOfWeek[];
  ret_fly_days?: DayOfWeek[];
  nights_in_dst_from?: number;
  nights_in_dst_to?: number;
} & KiwiBaseAPIParams;

export type KiwiAPIAllDaysParams = {
  fly_to: 'anywhere';
  returnFrom?: DateDDMMYYYY;
  returnTo?: DateDDMMYYYY;
  ret_from_diff_airport?: number;
  ret_to_diff_airport?: number;
  one_for_city?: number;
} & KiwiBaseAPIParams;
