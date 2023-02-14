import userController from './userController';
import User from './userModel';
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';

describe('UserController', () => {
  jest.setTimeout(15000);

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

  let req, res, next;
  beforeEach(() => {
    res = {
      status: jest.fn().mockImplementation(function () {
        // console.log('calling res.status');
        return this;
      }),
      json: jest.fn().mockImplementation(function (obj) {
        // console.log('calling res.json');
        this.data = obj.data;
        this.message = obj.message;
      }),
      data: null,
      message: null,
    };

    next = jest.fn().mockImplementation(function (err) {
      console.error(err);
    });
  });

  describe('getAllUsers', () => {
    describe('success cases', () => {
      test('should get all users', async () => {
        // console.log(allUsers);

        await userController.getAllUsers(req, res);

        console.log(res.data.users);
        expect(res.status).toHaveBeenCalledWith(200);

        const allUsers = await User.find();
        expect(res.data.users.length).toBe(allUsers.length);
      });
    });
  });

  describe('updateMe', () => {
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
      newUser = await User.create(fakeUser);
    });
    afterEach(async () => {
      await User.deleteOne({ id: newUser.id });
    });

    describe('success cases', () => {
      test('should update the users properties', async () => {
        const UPDATED_PROPERTIES = {
          name: faker.name.findName(),
          email: faker.internet.email(),
        };
        req = {
          body: UPDATED_PROPERTIES,
          user: { id: newUser.id },
        };

        await userController.updateMe(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.data.user.id).toEqual(newUser.id);
        expect(res.data.user.name).toEqual(UPDATED_PROPERTIES.name);
        expect(res.data.user.email.toLowerCase()).toEqual(
          UPDATED_PROPERTIES.email.toLowerCase()
        );
      });
      test.todo('should update only name and email properties');
    });
    describe('error cases', () => {
      test.todo('should fail when trying to update passwords');
    });
  });

  describe('airports', () => {
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
      newUser = await User.create(fakeUser);
    });
    afterEach(async () => {
      await User.deleteOne({ id: newUser.id });
    });
    describe('getFavAirports', () => {
      describe('success cases', () => {
        test('should return an object with the favorite airports for that user', async () => {
          req = {
            user: {
              id: newUser.id,
            },
          };

          await userController.getFavAirports(req, res, next);

          expect(res.status).toHaveBeenCalledWith(200);
          expect(Array.isArray(res.data.favAirports)).toBe(true);
          expect(res.data.favAirports).toHaveLength(0);
        });
      });
    });

    describe('addFavAirport', () => {
      describe('success cases', () => {
        test('should add a favorite airport to the list of favorite airports for that user', async () => {
          req = {
            user: {
              id: newUser.id,
            },
            body: { airport: 'JFK' },
          };

          await userController.addFavAirport(req, res, next);

          expect(res.status).toHaveBeenCalledWith(200);
          expect(Array.isArray(res.data.favAirports)).toBe(true);
          expect(res.data.favAirports).toHaveLength(1);
          expect(res.data.favAirports[0]).toBe('JFK');
        });
        test.todo(
          'should not modify the array of favorite airports if the airport is already a favorite for that user'
        );
      });

      describe('error cases', () => {
        test.todo('should fail when no airport has been specified');
        test.todo(
          'should fail if no airport with this IATA code could be found'
        );
      });
    });

    describe('removeFavAirport', () => {
      describe('success cases', () => {
        test('should remove a favorite airport from the list of favorite airports for that user', async () => {
          req = {
            user: {
              id: newUser.id,
            },
            body: { airport: 'JFK' },
          };

          // add an airport to that fake user
          await User.findByIdAndUpdate(newUser.id, {
            $set: { favAirports: ['JFK', 'MAD'] },
          });

          // and then remove it ...
          await userController.removeFavAirport(req, res, next);

          expect(res.status).toHaveBeenCalledWith(200);
          expect(Array.isArray(res.data.favAirports)).toBe(true);
          expect(res.data.favAirports).toHaveLength(1);
          expect(res.data.favAirports[0]).toBe('MAD');
        });
        test.todo(
          'should not modify the array of favorite airports if the airport is not a favorite for that user'
        );
      });

      describe('error cases', () => {
        test.todo('should fail when no airport has been specified');
        test.todo(
          'should fail if no airport with this IATA code could be found'
        );
      });
    });
  });

  describe('deleteMe', () => {
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
      newUser = await User.create(fakeUser);
    });
    afterEach(async () => {
      await User.deleteOne({ id: newUser.id });
    });

    describe('success cases', () => {
      test('should leave the user as inactive', async () => {
        req = {
          user: {
            id: newUser.id,
          },
        };

        const user = await User.findById(newUser.id);
        expect(user).not.toBeUndefined();

        await userController.deleteMe(req, res, next);

        const updatedUser = await User.findById(newUser.id);
        expect(res.status).toHaveBeenCalledWith(204);
        expect(updatedUser).toBeNull();
      });
    });
  });
});
