const request = require('supertest');
const app = require('../app');
const { faker } = require('@faker-js/faker');
const User = require('../user/userModel');
const mongoose = require('mongoose');
const { extractConnections } = require('../utils/apiHelper');
const { DateTime } = require('luxon');
const KIWI_DATE_FORMAT = `dd'/'LL'/'yyyy`;

describe('End to end tests', () => {
  jest.setTimeout(10000);

  beforeAll(async () => {
    const DB = process.env.DATABASE.replace(
      '<PASSWORD>',
      process.env.DATABASE_PASSWORD
    );

    await mongoose.connect(DB);
    console.log(`DB running at ${DB} ... ✅`);
  });
  afterAll(() => {
    mongoose.disconnect();
  });

  describe('Basic Access', () => {
    test('Home page should be accessible', async () => {
      const response = await request(app).get('/');
      expect(response.statusCode).toBe(200);
      expect(response.text).toMatch('Pulpito');
    });
    test('Should fail if the page does not exist', async () => {
      const response = await request(app).get('/fakepage');
      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe('fail');
    });

    test('API should be accessible', async () => {
      const response = await request(app).get('/api/v1/airports/?q=CDG');
      expect(response.statusCode).toBe(200);
      expect(response.body.data.airports[0].iata_code).toEqual('CDG');
    });
    test('API should fail if the route does not exist', async () => {
      const response = await request(app).get('/api/v1/airrts/?q=CDG');
      expect(response.statusCode).toBe(404);
      expect(response.body.status).toBe('fail');
    });
  });

  describe('Interface Complete E2E', () => {
    test.todo(
      'should signup a new user, login, ask for a new password, go to user page, ...'
    );
  });

  describe('API Routes', () => {
    describe('Basic API Signup Route', () => {
      test('Should sign up a new user', async () => {
        const fakePassword = faker.internet.password();
        const fakeUser = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: fakePassword,
          passwordConfirm: fakePassword,
        };

        const response = await request(app)
          .post('/api/v1/users/signup')
          .send(fakeUser);

        expect(response.statusCode).toBe(201);
        expect(response.body.data.user.name).toEqual(fakeUser.name);
        expect(response.headers['set-cookie'][0]).toMatch('jwt=');

        await User.deleteOne({ id: response.body.data.user._id });
      });
    });

    describe('API Signup and Auth Route', () => {
      let newUser, fakeUser;
      beforeEach(async () => {
        // creating a fake user in DB

        // TODO: we should mock create and findOne inside forgotPassword since it's not acceptable to actually create users in a DB .... or we should have a mock DB ...
        const fakePassword = faker.internet.password();
        fakeUser = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: fakePassword,
          passwordConfirm: fakePassword,
        };
        //console.log(fakeUser);
        newUser = await User.create(fakeUser);
      });
      afterEach(async () => {
        await User.deleteOne({ id: newUser.id });
      });

      // FIXME: in case of error, /signup should answer a more meaningful error
      test('Should not sign up a user that is already signed up', async () => {
        const response = await request(app)
          .post('/api/v1/users/signup')
          .send(fakeUser);

        expect(response.statusCode).toBe(500);
        expect(response.body.message).toMatch('duplicate');
      });

      test.todo('Should not sign up an existing user with a wrong token');
      test.todo('Should not sign up an existing user with a wrong password');
      test.todo('Should not sign up an existing user with an expired token');
      test.todo('Should send remind password email when applicable');
      test.todo('Should allow to reset password');
    });

    describe('API Airport route', () => {
      test('should return at least one result for an existing airport code', async () => {
        const response = await request(app).get('/api/v1/airports/?q=JFK');
        expect(response.statusCode).toBe(200);
        expect(response.body.data.airports.length).toBeGreaterThanOrEqual(1);
      });

      test('should return at least one result for an existing city', async () => {
        const response = await request(app).get('/api/v1/airports/?q=London');
        expect(response.statusCode).toBe(200);
        expect(response.body.data.airports.length).toBeGreaterThanOrEqual(1);
      });

      test('should return an empty array when the city or airport code do not exist', async () => {
        const response = await request(app).get('/api/v1/airports/?q=xxxx');
        expect(response.statusCode).toBe(200);
        expect(response.body.data.airports).toHaveLength(0);
      });
    });

    describe('API Cheapest destination route', () => {
      const routePath = '/api/v1/destinations/cheapest';
      const dates = {
        departureDate: DateTime.now()
          .plus({ weeks: 1 })
          .toFormat(KIWI_DATE_FORMAT),
        returnDate: DateTime.now()
          .plus({ weeks: 1 })
          .toFormat(KIWI_DATE_FORMAT),
      };

      test('should return a list of cheapest destinations', async () => {
        const params = {
          ...dates,
          origin: 'MAD',
        };
        const response = await request(app).get(routePath).query(params);
        expect(response.statusCode).toBe(200);
        expect(response.body.results).toBeGreaterThan(0);
        expect(response.body.data[0].flyFrom).toBe('MAD');
      });

      test('should return a 400 error and a fail status for a non existing origin', async () => {
        const params = {
          ...dates,
          origin: 'PXR',
        };
        const response = await request(app).get(routePath).query(params);
        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toMatch('no locations to fly from');
      });

      test('should return a 400 error and a fail status if some parameters are missing', async () => {
        const params = {
          ...dates,
        };
        const response = await request(app).get(routePath).query(params);
        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toMatch('Please provide missing');
      });
    });

    describe('API Common destinations route', () => {
      const routePath = '/api/v1/destinations/common';
      const dates = {
        departureDate: DateTime.now()
          .plus({ weeks: 1 })
          .toFormat(KIWI_DATE_FORMAT),
        returnDate: DateTime.now()
          .plus({ weeks: 1 })
          .toFormat(KIWI_DATE_FORMAT),
      };

      test('should return a list of common destinations', async () => {
        const origins = ['MAD', 'BOD', 'BRU'];
        const params = {
          ...dates,
          origin: origins.join(','), //'MAD,BOD,BRU'
        };
        const response = await request(app).get(routePath).query(params);
        expect(response.statusCode).toBe(200);
        expect(response.body.results).toBeGreaterThan(0);
        expect(
          response.body.data[0].flights.every((flight) =>
            origins.includes(flight.cityCodeFrom)
          )
        ).toBe(true);
      });

      test('should return a 400 error and a fail status for a non existing origin', async () => {
        const origins = ['MAD', 'BOD', 'PXR'];
        const params = {
          ...dates,
          origin: origins.join(','), //'MAD,BOD,PXR'
        };
        const response = await request(app).get(routePath).query(params);
        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toMatch('no locations to fly from');
      });

      test('should return a 400 error and a fail status if some parameters are missing', async () => {
        const params = {
          ...dates,
        };
        const response = await request(app).get(routePath).query(params);
        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toMatch('Please provide missing');
      });

      test('should return a 400 error and a fail status if origin is not in the format MAD,BRU,BOD ', async () => {
        const params = {
          ...dates,
          origin: 'MAD-BOD-BRU',
        };
        const response = await request(app).get(routePath).query(params);
        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toMatch('expected type');
      });

      test('should return a 400 error and a fail status if dates are not in the correct format ', async () => {
        const dates = {
          departureDate: DateTime.now()
            .plus({ weeks: 1 })
            .toFormat(`LL'/'dd'/'yyyy`), // month/day/year format
          returnDate: DateTime.now()
            .plus({ weeks: 1 })
            .toFormat(`LL'/'dd'/'yyyy`),
        };
        const origins = ['MAD', 'BOD', 'BRU'];
        const params = {
          ...dates,
          origin: origins.join(','), //'MAD,BOD,BRU'
        };
        const response = await request(app).get(routePath).query(params);
        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toMatch('expected type');
      });

      test('should return a 200 ok with empty results if there are no common destinations', async () => {
        const origins = ['SLM', 'PQC']; // Salamanca in Spain and Phu Quoc in Vietnam
        const params = {
          ...dates,
          origin: origins.join(','), //'MAD,BOD,BRU'
        };
        const response = await request(app).get(routePath).query(params);
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.results).toEqual(0);
      });
    });

    describe('API Cheapest Weekend route', () => {
      const routePath = '/api/v1/destinations/cheapestWeekend';
      const params = {
        departureDateFrom: DateTime.now()
          .plus({ months: 1 })
          .toFormat(KIWI_DATE_FORMAT),
        departureDateTo: DateTime.now()
          .plus({ months: 4 })
          .toFormat(KIWI_DATE_FORMAT),
        origin: 'MAD',
        destination: 'PAR',
      };

      test.todo('should only return short weekends');
      test.todo('should only return long weekends');

      test('should return a list of destinations', async () => {
        const response = await request(app).get(routePath).query(params);
        expect(response.statusCode).toBe(200);
        expect(response.body.results).toBeGreaterThan(0);
        expect(response.body.data[0].flyFrom).toBe('MAD');
      });

      test('should return a list of destinations even when only the origin is specified', async () => {
        const response = await request(app)
          .get(routePath)
          .query({ origin: 'MAD' });
        expect(response.statusCode).toBe(200);
        expect(response.body.results).toBeGreaterThan(0);
        expect(response.body.data[0].flyFrom).toBe('MAD');
      });

      xtest('should return a 400 error and a fail status for a non existing origin', async () => {
        const response = await request(app)
          .get(routePath)
          .query({
            ...params,
            origin: 'PXR',
          });
        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toMatch('no locations to fly from');
      });
      xtest('should return a 400 error and a fail status if some parameters are missing', async () => {
        const { departureDateFrom, departureDateTo, ...others } = params;

        const response = await request(app)
          .get(routePath)
          .query({ departureDateFrom, departureDateTo });
        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toMatch('must be specified');
      });

      xtest('should return a 400 error and a fail status if dates are not in the correct format ', async () => {
        const dates = {
          departureDateFrom: DateTime.now()
            .plus({ months: 1 })
            .toFormat(`LL'/'dd'/'yyyy`), // month/day/year format
          departureDateTo: DateTime.now()
            .plus({ months: 4 })
            .toFormat(`LL'/'dd'/'yyyy`),
        };

        const response = await request(app)
          .get(routePath)
          .query({ ...params, ...dates });
        expect(response.statusCode).toBe(400);
        expect(response.body.status).toBe('fail');
        expect(response.body.message).toMatch('invalid date');
      });
    });
  });
});
