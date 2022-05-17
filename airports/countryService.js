const fs = require('fs');
const utf8 = require('utf8');

const countriesJSON = JSON.parse(
  fs.readFileSync(`${__dirname}/../datasets/countries.json`)
);

console.log(`Found ${countriesJSON.length} countries`);

const countries = new Map();
countriesJSON.forEach((country) => {
  console.log(country);
  countries.set(country.Code, country.Name);
});
console.log(countries);
module.exports = countries;

// exports.getByCode = (code) => { return countries});
