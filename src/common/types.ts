export enum WeekendLengthEnum {
  LONG = 'long',
  SHORT = 'short',
}

export type RegularFlightsParams = {
  origin: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
};

export type WeekendFlightsParams = {
  origin: string;
  destination: string;
  departureDateFrom: string;
  departureDateTo: string;
  adults: number;
  children: number;
  infants: number;
  weekendLength?: WeekendLengthEnum;
};

export type QueryParams = {
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
