const express = require('express');
const morgan = require('morgan');
const app = express();
const axios = require('axios').default;
const groupBy = require('core-js/actual/array/group-by');
const AppError = require('./utils/appError');

const destinationsRouter = require('./destinations/destinationsRoutes');
const usersRouter = require('./users/usersRoutes');

if (process.env.NODE_ENV === 'development') {
  // adding 'GET' log messages
  app.use(morgan('dev'));
}

// body parser, reading data from body into req.body
// and limiting body size
app.use(express.json({ limit: '10kb' })); // middleware to add body in the request data

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
app.use('/api/v1/users', usersRouter);

// for routes not handled
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// global error handler
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
  // TODO: separate error handling in DEV and PROD (in PROD, no need for logs or stack trace... see NATOURS)
  console.log(err);
});

module.exports = app;
