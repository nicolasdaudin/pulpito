const buffer = require('buffer');
const utf8 = require('utf8');

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

module.exports = { reencodeString, normalizeString };
