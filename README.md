# Pulpito

An API to help you decide your next surprise destination

## WHY?

Pulpito is a side project that helped learned the basics of Node.JS, Mongoose, REST APIs, TDD, ...

It's an ongoing project.

At the moment it only has an API but the idea is to also have a webapp.

## Tests

I tried to write a lot of tests, but did it after discovering about TDD so most of my code was written before adding the tests.

Since my goal is to learn many things with this project (and not only TDD), I decided to stop at some point in writing the tests, and rather focus on the actual features and code.

You can test the code like this :

```
npm test
```

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
