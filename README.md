# Pulpito

An API and a server-side rendered webapp to help you decide where to meet with your friends.

## WHY ?

Pulpito is a side project that helped me learn the basics of Node.JS, Express, PUG, Mongoose, Cache, REST APIs, TDD, Postman, MongoDB, GIT, Heroku,

## Deploy

Pulpito API is available at https://pulpito-app.herokuapp.com/api/v1/

Pulpito webapp is currently deployed on Heroku at https://pulpito-app.herokuapp.com/

## Tests

I tried to write a lot of tests, but did it after discovering about TDD so most of my code was written before adding the tests.

Since my goal is to learn many things with this project (and not only TDD), I decided to stop at some point in writing the tests, and rather focus on the actual features and code.

You can test the code like this :

```
npm test
```

## Under the hood

Under the hood, Pulpito uses Tequila API by Kiwi and caches the requests made to Kiwi (for subsequent filters or requests).

## Storage / Cache

Pulpito only caches HTTP requests made to Tequila API via a middleware.
Nothing is stored or cached between server restarts.

## Next steps ... maybe

Pulpito is just a side-project and I'm not planning to release it comercially or improve it any time soon.

But some nice technical improvements would be:

- client-side rendering
- improved backend/database caching (to recover between server deploys)
- improved end-to-end testing

Also, for the web users, we should let them:

- find the cheapest destination from a given origin and at a given date (only available via the API at the moment)
- find the cheapest weekend for a given destination (only availavle via the API at the moment)
- use metropolitan area codes as origins : be able to use "LON" from the autocomplete airport code field to consider all London airports (at the moment only available using the API).
- access, add, remove and use their favorite origins : favorite origins are available and updatable via the API, but not via the webapp. And are not used neither in the API or the webapp when performing a destination search.

And definitely, the following user features would be a blast (both in the API and the app):

- compare train routes (at the moment, Pulpito only compares planes)

## Airports List

All airports are in English, taken from the dataset available at /datasets/airport-codes, which is a download of https://datahub.io/core/airport-codes made on 17th of May 2022.

Here is an extract of the JSON we use:

```
...
{
  "continent": "EU",
  "coordinates": "-2.849720001220703, 53.33359909057617",
  "elevation_ft": "80",
  "gps_code": "EGGP",
  "iata_code": "LPL",
  "ident": "EGGP",
  "iso_country": "GB",
  "iso_region": "GB-ENG",
  "local_code": null,
  "municipality": "Liverpool",
  "name": "Liverpool John Lennon Airport",
  "type": "large_airport"
},
{
  "continent": "EU",
  "coordinates": "-0.36833301186561584, 51.874698638916016",
  "elevation_ft": "526",
  "gps_code": "EGGW",
  "iata_code": "LTN",
  "ident": "EGGW",
  "iso_country": "GB",
  "iso_region": "GB-ENG",
  "local_code": null,
  "municipality": "London",
  "name": "London Luton Airport",
  "type": "large_airport"
},
...
```

## Countries List

All countries are in English, taken from the dataset available at /datasets/countries, which is a download of https://datahub.io/core/country-list#readme made on 17th of May 2022.

Here is an extract of the JSON we use:

```
...
{ "Code": "BA", "Name": "Bosnia and Herzegovina" },
{ "Code": "BW", "Name": "Botswana" },
...
```
