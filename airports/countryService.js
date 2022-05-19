const fs = require('fs');

const countriesJSON = JSON.parse(
  fs.readFileSync(`${__dirname}/../datasets/countries.json`)
);

const countries = new Map();
countriesJSON.forEach((country) => {
  countries.set(country.Code, country.Name);
});
module.exports = countries;

// exports.getByCode = (code) => { return countries});
