const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const app = express();
const axios = require('axios').default;
const groupBy = require('core-js/actual/array/group-by');
const AppError = require('./utils/appError');

const destinationsRouter = require('./destinations/destinationsRoutes');
const userRouter = require('./user/userRoutes');

// better to use early in the middleware.
// set http security headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  // adding 'GET' log messages
  app.use(morgan('dev'));
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

app.use(express.json({ limit: '10kb' })); // middleware to add body in the request data

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

// app.use((req, res, next) => {
//   console.log(req.headers);
//   next();
// });

// serving static files
app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  console.log('connected');
  res.status(200).json({
    status: 'success',
    message: 'connected',
  });
});

app.get('/test/', async (req, res) => {
  try {
    const response = await axios.get(
      'https://jsonplaceholder.typicode.com/users'
    );
    console.log(response.data);
    res.status(200).json({
      status: 'success',
      data: response.data,
    });
  } catch (err) {
    console.error(err);
  }
});

// just one result per city, to get more available cities
app.use('/api/v1/destinations', destinationsRouter);
app.use('/api/v1/users', userRouter);

// for routes not handled
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// global error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.name === 'JsonWebTokenError') err = handleJWTError();
  if (err.name === 'TokenExpiredError') err = handleTokenExpiredError();

  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  });

  // TODO: separate error handling in DEV and PROD (in PROD, no need for logs or stack trace, no need to give such detailed info to API Client... see NATOURS)
  // console.log(err);
});

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleTokenExpiredError = () =>
  new AppError('Token expired. Please log in again!', 401);

module.exports = app;
