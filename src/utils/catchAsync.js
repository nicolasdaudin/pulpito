const AppError = require('./appError');

const handleKiwiError = (err) => {
  if (err.response.status === 422 || err.response.status === 400) {
    // an error occurred on 3rd party Kiwi because of some input query parameters fed to to Pulpito API client (if error 422) or because some parameters for KIWI are missing (error 400)
    return new AppError(
      `Error in 3rd party API : ${err.response.data.error}`,
      400
    );
  } else {
    return new AppError(
      `Something went wrong! Please contact your administrator`,
      500
    );
  }
};

const catchKiwiError = (err, next) => {
  if (err.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return next(handleKiwiError(err));
  } else {
    // There has been another kind of problem
    console.error(err);
    return next(
      new AppError(
        `Something went wrong! Please contact your administrator`,
        500
      )
    );
  }
};

/**
 * Helper to add a try-catch to a fonction.
 * Used for express routes, to encapsulate them with a catch clause (to avoid try-catch duplicated code in controller)
 * @param {*} fn function to be try-catched
 * @returns the same function, but now protected by try-catch
 */
exports.catchAsync = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch((err) => {
      console.error(err);
      next(err);
    });
  };
};

/**
 * Helper to add a try-catch to a function calling Kiwi API.
 * Used for express routes calling Kiwi API, to encapsulate them with a catch clause (to avoid try-catch duplicated code in controller)
 * @param {*} fn function to be try-catched
 * @returns a function protected by try-catch
 */
exports.catchAsyncKiwi = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch((err) => catchKiwiError(err, next));
  };
};
