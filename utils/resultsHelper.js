const paginate = (itineraries, page, limit) => {
  const result = JSON.parse(JSON.stringify(itineraries));
  return result.slice((page - 1) * limit, page * limit);
  // return result;
};

module.exports = {
  paginate,
};
