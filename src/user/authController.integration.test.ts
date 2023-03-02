import authController from './authController';
// import AppError from '../utils/appError';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { faker } from '@faker-js/faker';
import User, { IUser } from './userModel';
import email from '../utils/email';
import jwt from 'jsonwebtoken';
import AppError from '../utils/appError';
import { NextFunction, Request, Response } from 'express-serve-static-core';

describe('AuthController', () => {
  jest.setTimeout(15000);

  beforeAll(async () => {
    if (!process.env.DATABASE || !process.env.DATABASE_PASSWORD)
      throw new Error('missing env variables');
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

  // TODO: dependency to Mongoose but we are just testing integration, this should be abstracted, right?
  // TODO: improve typing of req and have something like TypedRequestQueryWithFilter
  let req: Partial<Request>,
    res: Partial<Response> & {
      data?: { user: HydratedDocument<IUser> };
      message?: string;
    },
    next: NextFunction;
  beforeEach(() => {
    res = {
      status: jest.fn().mockImplementation(function () {
        // console.log('calling res.status');
        return this;
      }),
      // FIXME: any added to have TS compile here while migrating from JS to TS
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      json: jest.fn().mockImplementation(function (obj: any) {
        // console.log('calling res.json');
        this.data = obj.data;
        this.message = obj.message;
      }),
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
      const fakeId =
        faker.database.mongodbObjectId() as unknown as Types.ObjectId;

      const token = authController.signToken(fakeId);

      expect(signSpy).toHaveBeenCalled();
      expect(signSpy).toHaveBeenCalledWith(
        expect.objectContaining({ id: fakeId }),
        expect.anything(),
        expect.anything()
      );

      if (!process.env.JWT_SECRET) throw Error('missing env variables');

      const decoded = (await jwt.verify(
        token,
        process.env.JWT_SECRET
      )) as jwt.JwtPayload;
      expect(decoded.id).toBe(fakeId);
    });
  });

  describe('createSendToken', function () {
    describe('success case', () => {
      test('should sign a token, add it to the cookies and prepare the answer', () => {
        const signSpy = jest.spyOn(jwt, 'sign');

        const fakeUserFromDb: Partial<HydratedDocument<IUser>> = {
          _id: faker.database.mongodbObjectId() as unknown as Types.ObjectId,
          password: faker.internet.password(),
        };
        const fakeStatusCode = faker.internet.httpStatusCode();

        authController.createSendToken(
          fakeUserFromDb as HydratedDocument<IUser>,
          fakeStatusCode,
          res as Response
        );

        expect(signSpy).toHaveBeenCalled();
        expect(res.cookie).toHaveBeenCalled();
        expect(fakeUserFromDb.password).toBeUndefined();
        expect(res.status).toHaveBeenCalledWith(fakeStatusCode);
        expect(res.data?.user._id).toBe(fakeUserFromDb._id);
      });
    });
  });

  describe('signup', () => {
    describe('success case', () => {
      test('should create a user when given correct info', async () => {
        // checking numbers of users in DB
        // const usersLengthBeforeCreate = (await User.find()).length;

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

        // const usersLengthAfterCreate = (await User.find()).length;

        // expect(usersLengthAfterCreate).toBe(usersLengthBeforeCreate + 1);

        const createdUser = (await User.findOne({
          email: fakeUser.email,
        })) as IUser;
        expect(createdUser.email.toLowerCase()).toEqual(
          fakeUser.email.toLowerCase()
        );

        const result = await User.deleteOne({ email: createdUser?.email });
        console.log(
          `User with email ${fakeUser.email} correctly deleted after test? ${
            result.deletedCount > 0
          }`
        );
      });
    });

    describe('error cases', () => {
      test.todo('should return error if user already exists');
      test.todo('should return errror if password is not correctly confirmed');
      test.todo('should return error if user information is empty');
    });
  });

  describe('login', () => {
    let newUser: HydratedDocument<IUser>;
    let fakeUser: Partial<IUser>;
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
      const result = await User.deleteOne({ id: newUser.id });
      console.log(
        `User with email ${fakeUser.email} correctly deleted after test? ${
          result.deletedCount > 0
        }`
      );
    });

    describe('success case', () => {
      test('should login the user when given correct login credentials', async function () {
        req = {
          body: { email: fakeUser.email, password: fakeUser.password },
        };

        await authController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.data?.user._id).toEqual(newUser._id);
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

        // expect(next).toHaveBeenCalledWith(expect.any(typeof AppError));
        // expect(next).toHaveBeenCalledWith(
        //   expect.any(typeof AppError.prototype)
        // );
        // expect(next).toHaveBeenCalledWith(expect.any(AppError.prototype));
        // const arg = next.mock.calls[0][0];
        // expect(arg).toBeInstanceOf(AppError);
        // expect(arg).toMatchObject(AppError);

        expect(next).toHaveBeenCalledWith(expect.any(AppError));
        // This above now fails after migration to TypeScript it fails like this:
        // AuthController > login > error cases > should return error if user is inactive
        // -----
        // Error: expect(jest.fn()).toHaveBeenCalledWith(...expected)

        // Expected: Any<AppError>
        // Received: [Error: Incorrect email or password, or user no longer active]

        // Number of calls: 1

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
    let token;
    let newUser: HydratedDocument<IUser>;
    let fakeUser: Partial<IUser>;

    // here we need to redefine req to allow TS compilation
    // otherwise it errors on req.user.id saying property user does not exist on Request
    let req: Partial<Request> & { user?: HydratedDocument<IUser> };

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

      if (!process.env.JWT_SECRET) throw Error('missing env variables');

      token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      // here we need to redefine req to allow TS compilation
      // otherwise it errors on req.user.id saying property user does not exist on Request
      req = {
        headers: { authorization: 'Bearer ' + token },
      };
    });
    afterEach(async () => {
      await User.deleteOne({ id: newUser.id });
    });
    describe('success case', () => {
      test('should grant access to protected route', async function () {
        await authController.protect(req, res, next);

        expect(req.user?.id).toEqual(newUser.id);
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
      let newUser: HydratedDocument<IUser>;

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
          .mockImplementation(async () => {
            //console.log('not sending an actual email');
          });

        await authController.forgotPassword(req, res, next);

        expect(sendPasswordResetTokenEmailSpy).toHaveBeenCalled();

        // retrieve the new user from DB
        const updatedUser = (await User.findById(newUser.id)) as IUser;
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
