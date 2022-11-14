const { promisify } = require('util');
const authController = require('./authController');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const User = require('../user/userModel');
const email = require('../utils/email');
const jwt = require('jsonwebtoken');

describe('AuthController', () => {
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
      cookie: jest.fn().mockImplementation(function () {
        // console.log('calling res.status');
        return this;
      }),
    };

    next = jest.fn().mockImplementation(function (err) {
      console.error(err);
    });
  });

  describe('signToken', function () {
    test('should sign a token', async () => {
      const signSpy = jest.spyOn(jwt, 'sign');
      const fakeId = faker.database.mongodbObjectId();

      const token = authController.signToken(fakeId);

      expect(signSpy).toHaveBeenCalled();
      expect(signSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: fakeId }),
        expect.anything(),
        expect.anything()
      );

      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET
      );
      expect(decoded.id).toBe(fakeId);
    });
  });

  describe('createSendToken', function () {
    describe('success case', () => {
      test('should sign a token, add it to the cookies and prepare the answer', () => {
        const signSpy = jest.spyOn(jwt, 'sign');

        const fakeUser = {
          _id: faker.database.mongodbObjectId(),
          password: faker.internet.password(),
        };
        const fakeStatusCode = faker.internet.httpStatusCode();

        authController.createSendToken(fakeUser, fakeStatusCode, res);

        expect(signSpy).toHaveBeenCalled();
        expect(res.cookie).toHaveBeenCalled();
        expect(fakeUser.password).toBeUndefined();
        expect(res.status).toHaveBeenCalledWith(fakeStatusCode);
        expect(res.data.user._id).toBe(fakeUser._id);
      });
    });
  });

  describe('signup', () => {
    describe('success case', () => {
      test('should create a user when given correct info', async () => {
        // checking numbers of users in DB
        const usersLengthBeforeCreate = (await User.find()).length;

        // creating a fake user in DB

        // TODO: we should mock create and findOne inside forgotPassword since it's not acceptable to actually create users in a DB .... or we should have a mock DB ...
        const fakePassword = faker.internet.password();
        const fakeUser = {
          name: faker.name.findName(),
          email: faker.internet.email(),
          password: fakePassword,
          passwordConfirm: fakePassword,
        };
        console.log(fakeUser);
        req = { body: fakeUser };

        await authController.signup(req, res, next);

        const usersLengthAfterCreate = (await User.find()).length;

        expect(usersLengthAfterCreate).toBe(usersLengthBeforeCreate + 1);

        const createdUser = await User.findOne({ email: fakeUser.email });

        await User.deleteOne({ email: createdUser.email });
      });
    });

    describe('error cases', () => {
      test.todo('should return error if user already exists');
      test.todo('should return errror if password is not correctly confirmed');
      test.todo('should return error if user information is empty');
    });
  });

  describe('login', () => {
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

    describe('success case', () => {
      test('should login the user when given correct login credentials', async function () {
        req = {
          body: { email: fakeUser.email, password: fakeUser.password },
        };

        await authController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.data.user._id).toEqual(newUser._id);
      });
    });
    describe('error cases', () => {
      test.todo('should return error if login credentials are missing');
      test.todo('should return error if login credentials are wrong');
      test('should return error if user is inactive', async () => {
        // force the user to inactive
        await User.findByIdAndUpdate(newUser.id, { $set: { active: false } });

        req = {
          body: { email: fakeUser.email, password: fakeUser.password },
        };

        await authController.login(req, res, next);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 401,
            message: expect.stringContaining('no longer active'),
          })
        );
      });
    });
  });

  describe('protect', () => {
    let token, newUser, fakeUser;
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

      token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      req.headers = {
        authorization: 'Bearer ' + token,
      };
    });
    afterEach(async () => {
      await User.deleteOne({ id: newUser.id });
    });
    describe('success case', () => {
      test('should grant access to protected route', async function () {
        await authController.protect(req, res, next);

        expect(req.user.id).toEqual(newUser.id);
      });
    });
    describe('error cases', () => {
      test.todo('should return error 401 if there was no token');
      test.todo('should return error if token has expired');
      test.todo('should return error 401 if user does no longer exist');
      test.todo(
        'should return error 401 if user recently changed his password'
      );
    });
  });

  describe('forgotPassword', function () {
    describe('success cases', () => {
      let newUser;
      beforeEach(async () => {
        // creating a fake user in DB

        // TODO: we should mock create and findOne inside forgotPassword since it's not acceptable to actually create users in a DB .... or we should have a mock DB ...
        const fakePassword = faker.internet.password();
        const fakeUser = {
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

      test('should return OK when the user email has been found and the token can be sent', async function () {
        req = { body: { email: newUser.email } };

        // MOCKING the send email part
        // TODO: mocking the nodemailer.createTransport and connecting to mailtrap.io. Right now it's connected to mailtrap.ip because we are in dev, but once in production we will need to connect to a particular mail transport sandbox and not send real email
        const sendPasswordResetTokenEmailSpy = jest
          .spyOn(email, 'sendPasswordResetTokenEmail')
          .mockImplementation(() => {
            //console.log('not sending an actual email');
          });

        await authController.forgotPassword(req, res, next);

        expect(sendPasswordResetTokenEmailSpy).toHaveBeenCalled();

        // retrieve the new user from DB
        const updatedUser = await User.findById(newUser.id);
        //console.log('newUser', newUser);
        //console.log('updatedUser', updatedUser);
        expect(updatedUser.passwordResetToken).not.toBeUndefined();

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.message).toMatch(/Token/);
      });

      test('should return an error when the user email has been found but the token can not be sent by email for some reason', async function () {
        req = { body: { email: newUser.email } };

        // MOCKING the send email part
        // TODO: mocking the nodemailer.createTransport and connecting to mailtrap.io. Right now it's connected to mailtrap.ip because we are in dev, but once in production we will need to connect to a particular mail transport sandbox and not send real email
        const sendPasswordResetTokenEmailSpy = jest
          .spyOn(email, 'sendPasswordResetTokenEmail')
          .mockRejectedValue('Mocking Error');

        await authController.forgotPassword(req, res, next);

        expect(sendPasswordResetTokenEmailSpy).toHaveBeenCalled();
        expect(newUser.passwordResetToken).toBeUndefined();

        // check that response is an error
        expect(next).toHaveBeenCalledWith(expect.any(AppError));

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 500,
            message: expect.stringContaining('error sending the email'),
          })
        );
      });
    });

    describe('error cases', () => {
      test('should return error 404 when the email is empty in the body', async function () {
        req = { body: { email: '' } };

        await authController.forgotPassword(req, res, next);

        // expect(true).toBe(true);
        // expect(res.status).toHaveBeenCalledWith(404);
        expect(next).toHaveBeenCalledWith(expect.any(AppError));

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 404,
            message: expect.stringContaining('no active user'),
          })
        );
      });

      test('should return error 404 when the email can not be found', async function () {
        req = { body: { email: 'milady@castle.com' } };

        await authController.forgotPassword(req, res, next);

        // expect(true).toBe(true);
        // expect(res.status).toHaveBeenCalledWith(404);
        expect(next).toHaveBeenCalledWith(expect.any(AppError));

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            statusCode: 404,
            message: expect.stringContaining('no active user'),
          })
        );
      });
    });
  });

  describe('resetPassword', () => {
    describe('success case', () => {
      test.todo('should reset password');
    });
    describe('error cases', () => {
      test.todo('should return error 400 if reset token is missing');
      test.todo('should return error 400 if password is missing');
      test.todo(
        'should return error 400 if the reset token is invalid or expired'
      );
    });
  });

  describe('updateMyPassword', () => {
    describe('success case', () => {
      test.todo('should update password');
    });
    describe('error cases', () => {
      test.todo(
        'should return error 400 if current password, new password or password confirmation are missing'
      );
      test.todo('should return error 401 if current password is wrong');
    });
  });
});
