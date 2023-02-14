import buffer from 'buffer';
import utf8 from 'utf8';

/**
 * Helper to reencode data from airport json data source
 * @param {*} str 
 * @returns 
 */
const reencodeString = (str) => {
  const result = utf8.decode(
    buffer.transcode(Buffer.from(str), 'utf8', 'latin1').toString('latin1')
  );
  return result;
};

/**
 * Helper to normalize data from airport data json source
 * @param {*} str 
 * @returns 
 */
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

export = { reencodeString, normalizeString, filterObj };
