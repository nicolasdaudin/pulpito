const { isAlpha, isNumeric } = require('validator');

// const validateParams = (req, res, next) => {};

const isCommaSeparatedAlpha = (str) => {
  const splitted = str.split(',');
  return splitted.every((split) => isAlpha(split));
};

const isCommaSeparatedNumeric = (str) => {
  const splitted = str.split(',');
  return splitted.every(isNumeric);
};

const findMissingParams = (model, params) => {
  const missingParams = model
    .filter((param) => param.required && !params[param.name])
    .map((param) => param.name);
  return missingParams;
};

const findWrongTypeParams = (model, params) => {
  return model
    .filter(
      (param) => params[param.name] && !param.typeCheck(params[param.name])
    )
    .map((param) => param.name);
};

module.exports = {
  isCommaSeparatedAlpha,
  isCommaSeparatedNumeric,
  findMissingParams,
  findWrongTypeParams,
};
