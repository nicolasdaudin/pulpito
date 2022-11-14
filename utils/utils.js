const buffer = require('buffer');
const utf8 = require('utf8');

const reencodeString = (str) => {
  const result = utf8.decode(
    buffer.transcode(Buffer.from(str), 'utf8', 'latin1').toString('latin1')
  );
  return result;
};

const normalizeString = (str) => {
  const result = reencodeString(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return result;
};

/**
 * Remove fields from an object
 * @param {*} obj
 * @param  {...any} allowedFields
 */
const filterObj = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

module.exports = { reencodeString, normalizeString, filterObj };
