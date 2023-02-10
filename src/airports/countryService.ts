import countriesJSON from '../datasets/countries.json';

export const countries = new Map();
countriesJSON.forEach((country) => {
  countries.set(country.Code, country.Name);
});
