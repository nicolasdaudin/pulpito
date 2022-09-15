const AppError = require('./appError');

const handleKiwiError = (err) => {
  // console.log(
  //   'Error while processing the request to KIWI : ',
  //   err.response.data
  // );

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

exports.catchAsync = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch((err) => {
      console.error(err);
      next(err);
    });
  };
};

exports.catchAsyncKiwi = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch((err) => catchKiwiError(err, next));
  };
};
