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
  route: Route[];
  deep_link: URL;
  local_arrival: ISODate;
  utc_arrival: ISODate;
  local_departure: ISODate;
  utc_departure: ISODate;
};

export type DestinationWithItineraries = {
  cityTo: string;
  flights: Itinerary[];
  countryTo: string;
  cityCodeTo: string;
  price: number;
  distance: number;
  totalDurationDepartureInMinutes: number;
  totalDurationReturnInMinutes: number;
};

export type Route = {
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

// FIXME: KiwiRoute should be used in Kiwi Itinerary ...
export type KiwiRoute = Route;
export type KiwiItinerary = Itinerary & { route: KiwiRoute[] };

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
