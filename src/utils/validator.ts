import { isAlpha, isNumeric } from 'validator';

// const validateParams = (req, res, next) => {};

/**
 * Check if str is a comma-separated list of alphabetic strings
 * @param {*} str
 * @returns true if str is a comma-separated list of alphabetic strings (i.e. 'MAD,BRU,POE'), false otherwise (i.e. 'MAD-BRU-POE', or 'MAD-BRU2-POR')
 */
const isCommaSeparatedAlpha = (str) => {
  const splitted = str.split(',');
  return splitted.every((split) => isAlpha(split));
};

/**
 * Check if str is a comma-separated list of numbers
 * @param {*} str
 * @returns true if str is a comma-separated list of numbers (i.e. '1,2,2')
 */
const isCommaSeparatedNumeric = (str) => {
  const splitted = str.split(',');
  return splitted.every(isNumeric);
};

/**
 * Finds all the missing parameters (it is missing when it should be present, i.e. it's a required param)
 * @param {*} model
 * @param {*} params
 * @returns list of missing params name
 */
const findMissingParams = (model, params) => {
  const missingParams = model
    .filter((param) => param.required && !params[param.name])
    .map((param) => param.name);
  return missingParams;
};

/**
 * Finds all the parameters with a wrong type (it has a wrong type when its type check is false)
 * @param {*} model
 * @param {*} params
 * @returns list of params name for which we have a wrong type
 */
const findWrongTypeParams = (model, params) => {
  return model
    .filter(
      (param) => params[param.name] && !param.typeCheck(params[param.name])
    )
    .map((param) => param.name);
};

export = {
  isCommaSeparatedAlpha,
  isCommaSeparatedNumeric,
  findMissingParams,
  findWrongTypeParams,
};
