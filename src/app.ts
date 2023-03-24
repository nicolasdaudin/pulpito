import express from 'express';
import path from 'path';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from './utils/xss';
import hpp from 'hpp';

import AppError from './utils/appError';

import { router as destinationsRouter } from './destinations/destinationsRoutes';
import { router as userRouter } from './user/userRoutes';
import { router as airportRouter } from './airports/airportRoutes';
import { router as viewRouter } from './views/viewRoutes';
import { NextFunction, Request, Response } from 'express-serve-static-core';

const app = express();
// better to use early in the middleware.
// set http security headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  // adding 'GET' log messages
  app.use(
    morgan('dev', {
      skip: (req) => req.originalUrl.includes('/assets/'),
    })
  );
}

// body parser, reading data from body into req.body
// and limiting body size

// 100 requests per jour per IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json({ limit: '10kb' })); // middleware to add body in the request data
app.use(express.urlencoded({ extended: true, limit: '10kb' })); // parse data from forms, extended is for more complicated data

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

// data snaitization against XSS
app.use(xss());

// prevent parameter pollution
app.use(
  hpp({
    whitelist: [],
  })
);
// whitelist is an array of parameter names to allow several occurrences of that field in the query parameters.

// serving static files
app.use(express.static(`${__dirname}/../public`));

app.use('/', viewRouter);
app.use('/api/v1/destinations', destinationsRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/airports', airportRouter);

// for routes not handled
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// global error handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (!(err instanceof AppError)) {
    err.statusCode = 500;
    err.status = 'error';
  }
  if (err.name === 'JsonWebTokenError') err = handleJWTError();
  if (err.name === 'TokenExpiredError') err = handleTokenExpiredError();

  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  });

  // TODO: separate error handling in DEV and PROD (in PROD, no need for logs or stack trace, no need to give such detailed info to API Client... see NATOURS)
});

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleTokenExpiredError = () =>
  new AppError('Token expired. Please log in again!', 401);

export default app;
