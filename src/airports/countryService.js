const fs = require('fs');
const countriesJSON = require('../datasets/countries.json');

const countries = new Map();
countriesJSON.forEach((country) => {
  countries.set(country.Code, country.Name);
});
module.exports = countries;

// exports.getByCode = (code) => { return countries});
