import fs from 'fs';
import path from 'path';

export type Airport = {
  country?: string;
  iata_code: string;
  iso_country: string;
  municipality: string;
  name: string;
  type: string;
};

const parsedAirports = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../datasets/airport-codes.json'),
    'utf-8'
  )
);

const filterAirportFields = (airport: Partial<Airport>) => {
  const { iata_code, iso_country, municipality, name, type } = airport;
  return { iata_code, iso_country, municipality, name, type };
};

export const airports: Airport[] = parsedAirports.map(
  filterAirportFields
) as Airport[];
