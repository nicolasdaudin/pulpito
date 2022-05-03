const { isAlpha, isDate, isNumeric } = require('validator');
const AppError = require('./appError');

// const validateParams = (req, res, next) => {};

const isCommaSeparatedAlpha = (str) => {
  const splitted = str.split(',');
  return splitted.every((split) => isAlpha(split));
};

const isCommaSeparatedNumeric = (str) => {
  const splitted = str.split(',');
  return splitted.every(isNumeric);
};

exports.validateRequestParamsManyOrigins = (req, res, next) => {
  // const { origin, departureDate } = req.params;
  console.log(req.query);

  // const params = new URLSearchParams(req.params);

  // FIXME: is this really necessary to be so specific about parameter types? isn't it better to have a good documentation and only send an error msg like "Parameters have wrong type"
  const requestModelParams = [
    {
      name: 'origin',
      required: true,
      typeCheck: isCommaSeparatedAlpha,
      errorMsg: `a comma-separated list of IATA airport or airport area codes, for example 'JFK,BRU' (but not 'JFK,BRU,')`,
    },
    {
      name: 'departureDate',
      required: true,
      typeCheck: (str) => isDate(str, { format: 'DD/MM/YYYY' }),
      errorMsg: `a date of format DD/MM/YYYY, for example 22/06/2022`,
    },
    {
      name: 'returnDate',
      required: true,
      typeCheck: (str) => isDate(str, { format: 'DD/MM/YYYY' }),
      errorMsg: `a date of format DD/MM/YYYY, for example 22/06/2022`,
    },
    {
      name: 'adults',
      required: false,
      typeCheck: isCommaSeparatedNumeric,
      errorMsg: `a comma-separated list of numbers, for example '2,1' (but not '2,1,')`,
    },
    {
      name: 'children',
      required: false,
      typeCheck: isCommaSeparatedNumeric,
      errorMsg: `a comma-separated list of numbers, for example '2,1' (but not '2,1,')`,
    },
    {
      name: 'infants',
      required: false,
      typeCheck: isCommaSeparatedNumeric,
      errorMsg: `a comma-separated list of numbers, for example '2,1' (but not '2,1,')`,
    },
  ];

  // check if required parameters are present

  const missingParams = requestModelParams
    .filter((param) => param.required && !req.query[param.name])
    .map((param) => param.name);
  if (missingParams.length > 0)
    return next(
      new AppError(
        `Please provide missing parameter(s) to process this request: ${missingParams.join(
          ','
        )}`,
        400
      )
    );

  // check if the type of parameters are correct
  const wrongTypeParams = requestModelParams.filter((param) => {
    // console.log(
    //   req.query[param.name],
    //   typeof req.query[param.name],
    //   req.query[param.name]
    //     ? param.typeCheck(req.query[param.name])
    //     : 'not tested'
    // );
    return req.query[param.name] && !param.typeCheck(req.query[param.name]);
  });
  // console.log('wrongTypeParams', wrongTypeParams);
  if (wrongTypeParams.length > 0) {
    const errorMsg = wrongTypeParams
      .map(
        (wrongTypeParam) =>
          `'${wrongTypeParam.name}' should be ${wrongTypeParam.errorMsg}`
      )
      .join(', ');
    return next(
      new AppError(
        `Following parameters do not have the expected type: ${errorMsg}`,
        400
      )
    );
  }

  const origins = req.query.origin.split(',');

  const adults = req.query.adults
    ? req.query.adults.split(',')
    : new Array(origins.length).fill(1);
  if (origins.length !== adults.length)
    return next(
      new AppError(
        `Not the same number of origins and adults specified, was expecting either ${origins.length} adults or ${adults.length} origins`,
        400
      )
    );

  const children = req.query.children
    ? req.query.children.split(',')
    : new Array(origins.length).fill(0);
  if (origins.length !== children.length)
    return next(
      new AppError(
        `Not the same number of origins and children specified, was expecting either ${origins.length} children or ${children.length} origins`,
        400
      )
    );

  const infants = req.query.infants
    ? req.query.infants.split(',')
    : new Array(origins.length).fill(0);
  if (origins.length !== infants.length)
    return next(
      new AppError(
        `Not the same number of origins and infants specified, was expecting either ${origins.length} infants or ${infants.length} origins`,
        400
      )
    );
  next();
};

exports.validateRequestParamsOneOrigin = (req, res, next) => {
  // const { origin, departureDate } = req.params;
  console.log(req.query);

  // const params = new URLSearchParams(req.params);

  // FIXME: is this really necessary to be so specific about parameter types? isn't it better to have a good documentation and only send an error msg like "Parameters have wrong type"
  const requestModelParams = [
    {
      name: 'origin',
      required: true,
      typeCheck: isAlpha,
      errorMsg: 'only airport or airport area codes, for example LON or JFK', // see https://wikitravel.org/en/Metropolitan_Area_Airport_Codes
    },
    {
      name: 'departureDate',
      required: true,
      typeCheck: (str) => isDate(str, { format: 'DD/MM/YYYY' }),
      errorMsg: `a date of format DD/MM/YYYY, for example 22/06/2022`,
    },
    {
      name: 'returnDate',
      required: true,
      typeCheck: (str) => isDate(str, { format: 'DD/MM/YYYY' }),
      errorMsg: `a date of format DD/MM/YYYY, for example 22/06/2022`,
    },
    {
      name: 'adults',
      required: false,
      typeCheck: isNumeric,
      errorMsg: 'a number, for example 2',
    },
    {
      name: 'children',
      required: false,
      typeCheck: isNumeric,
      errorMsg: 'a number, for example 2',
    },
    {
      name: 'infants',
      required: false,
      typeCheck: isNumeric,
      errorMsg: 'a number, for example 2',
    },
  ];

  // check if required parameters are present

  const missingParams = requestModelParams
    .filter((param) => param.required && !req.query[param.name])
    .map((param) => param.name);
  if (missingParams.length > 0)
    return next(
      new AppError(
        `Please provide missing parameter(s) to process this request: ${missingParams.join(
          ','
        )}`,
        400
      )
    );

  // check if the type of parameters are correct
  const wrongTypeParams = requestModelParams.filter((param) => {
    // console.log(
    //   req.query[param.name],
    //   typeof req.query[param.name],
    //   param.typeCheck(req.query[param.name])
    // );
    return req.query[param.name] && !param.typeCheck(req.query[param.name]);
  });
  // console.log(wrongTypeParams);
  if (wrongTypeParams.length > 0) {
    const errorMsg = wrongTypeParams
      .map(
        (wrongTypeParam) =>
          `'${wrongTypeParam.name}' should be ${wrongTypeParam.errorMsg}`
      )
      .join(', ');
    return next(
      new AppError(
        `Following parameters do not have the expected type: ${errorMsg}`,
        400
      )
    );
  }

  next();
};
