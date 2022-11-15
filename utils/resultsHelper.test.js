const helper = require('./resultsHelper.js');
const { RESULTS_SEARCH_LIMIT } = require('../config');

describe('Results Helper', () => {
  const ZERO_CONNECTIONS = [];
  const ONE_CONNECTION = ['London'];
  const TWO_CONNECTIONS = ['London', 'Chicago'];
  const ITINERARY_SEVERAL_ORIGINS = {
    cityTo: 'Dallas',
    flights: [
      {
        flyFrom: 'CDG',
        route: {
          oneway: {
            connections: ZERO_CONNECTIONS,
          },
          return: {
            connections: ONE_CONNECTION,
          },
        },
        price: 978,
        // fare: { adults: 978 },
      },
      {
        flyFrom: 'LYS',
        route: {
          oneway: {
            connections: TWO_CONNECTIONS,
          },
          return: {
            connections: TWO_CONNECTIONS,
          },
        },
        price: 1245,
        //fare: { adults: 1245 },
      },
    ],
    price: 2223, // 978 + 12
  };
  const ITINERARY_SEVERAL_ORIGINS_2 = {
    cityTo: 'Bangkok',
    flights: [
      {
        flyFrom: 'CDG',
        route: {
          oneway: {
            connections: ZERO_CONNECTIONS,
          },
          return: {
            connections: ONE_CONNECTION,
          },
        },
        price: 1521,
        // fare: { adults: 978 },
      },
      {
        flyFrom: 'BER',
        route: {
          oneway: {
            connections: TWO_CONNECTIONS,
          },
          return: {
            connections: TWO_CONNECTIONS,
          },
        },
        price: 1314,
        //fare: { adults: 1245 },
      },
    ],
    price: 2835, // 1521 + 1314
  };
  const ITINERARY_ONE_ORIGIN = {
    cityTo: 'Dallas',
    flyFrom: 'CDG',
    route: {
      oneway: {
        connections: ONE_CONNECTION,
      },
      return: {
        connections: ONE_CONNECTION,
      },
    },
    price: 1120,
    // fare: { adults: 1120 },
  };

  describe('filterByMaxConnections', () => {
    test('should return true when there are several origins and no flights have  more than 2 connections', () => {
      expect(helper.filterByMaxConnections(ITINERARY_SEVERAL_ORIGINS, 2)).toBe(
        true
      );
    });
    test('should return true when there is only origin and no flights have  more than 2 connections', () => {
      expect(helper.filterByMaxConnections(ITINERARY_ONE_ORIGIN, 2)).toBe(true);
    });
    test('should return false when there are several origins and at least one flight have more than 1 connection', () => {
      expect(helper.filterByMaxConnections(ITINERARY_SEVERAL_ORIGINS, 1)).toBe(
        false
      );
    });
    test('should return false when there is only one origin and at least one flight have more than 0 connection', () => {
      expect(helper.filterByMaxConnections(ITINERARY_ONE_ORIGIN, 0)).toBe(
        false
      );
    });
  });

  describe('filterByPriceRange', () => {
    test('should return true when there are several origins and all the flights prices are inside the price range', () => {
      expect(
        helper.filterByPriceRange(ITINERARY_SEVERAL_ORIGINS, 900, 1300)
      ).toBe(true);
    });
    test('should return true when there is only one origin and the flight price is inside the price range', () => {
      expect(helper.filterByPriceRange(ITINERARY_ONE_ORIGIN, 900, 1300)).toBe(
        true
      );
    });
    test('should return true when there are several origins, no min price has been specified and all the flights prices are below the max price', () => {
      expect(
        helper.filterByPriceRange(ITINERARY_SEVERAL_ORIGINS, undefined, 1300)
      ).toBe(true);
    });
    test('should return true when there are several origins, no max price has been specified and all the flights prices are above the min price', () => {
      expect(
        helper.filterByPriceRange(ITINERARY_SEVERAL_ORIGINS, 900, undefined)
      ).toBe(true);
    });
    test('should return true when there is only one origin, no min price has been specified and the flight price is below the max price', () => {
      expect(
        helper.filterByPriceRange(ITINERARY_ONE_ORIGIN, undefined, 1300)
      ).toBe(true);
    });
    test('should return true when there is only one origin, no max price has been specified and the flight price is above the min price', () => {
      expect(
        helper.filterByPriceRange(ITINERARY_ONE_ORIGIN, 900, undefined)
      ).toBe(true);
    });
    test('should return false when there are several origins and at least one flight price is not inside the price range', () => {
      expect(
        helper.filterByPriceRange(ITINERARY_SEVERAL_ORIGINS, 1200, 1300)
      ).toBe(false);
    });
    test('should return true when there is only one origin and the flight price is not inside the price range', () => {
      expect(helper.filterByPriceRange(ITINERARY_ONE_ORIGIN, 1200, 1300)).toBe(
        false
      );
    });
  });

  describe('getFilters', () => {
    test('should returns an object with all the current filters applied', () => {
      const itineraries = [
        ITINERARY_SEVERAL_ORIGINS,
        ITINERARY_SEVERAL_ORIGINS_2,
      ];
      const filterParams = {
        priceFrom: 13,
        priceTo: 424,
        maxConnections: 1,
      };
      const filters = helper.getFilters(itineraries, filterParams);

      expect(filters.minPossiblePrice).toEqual(978);
      expect(filters.maxPossiblePrice).toEqual(1521);
      expect(filters.maxConnections).toEqual(filterParams.maxConnections);
      expect(filters.priceFrom).toEqual(filterParams.priceFrom);
      expect(filters.priceTo).toEqual(filterParams.priceTo);
    });
  });

  describe('filter', () => {
    test.todo('should filter by maxConnections and price range as expected');
    test.todo(
      'should return a clone of the itineraries if there are no filters'
    );
  });

  describe('paginate', () => {
    const itineraries = [
      'item1',
      'item2',
      'item3',
      'item4',
      'item5',
      'item6',
      'item7',
      'item8',
      'item9',
      'item10',
    ];

    test('should return only some itineraries for regular cases', () => {
      const result = helper.paginate(itineraries, { page: 2, limit: 3 });
      expect(result).toStrictEqual(['item4', 'item5', 'item6']);
    });

    test('should return the first itineraries for the first page', () => {
      const result = helper.paginate(itineraries, { page: 1, limit: 3 });
      expect(result).toStrictEqual(['item1', 'item2', 'item3']);
    });

    test('should return the last itineraries for the last page', () => {
      const result = helper.paginate(itineraries, { page: 4, limit: 3 });
      expect(result).toStrictEqual(['item10']);
    });

    test('should return no itineraries if page is too big', () => {
      const result = helper.paginate(itineraries, { page: 5, limit: 3 });
      expect(result).toStrictEqual([]);
    });

    test('should return all the itineraries if limit is bigger than the number of itineraries', () => {
      const result = helper.paginate(itineraries, { page: 1, limit: 12 });
      expect(result).toStrictEqual(itineraries);
    });

    test('should return a subset of the array if no pagination filters', () => {
      const manyResults = [
        itineraries,
        itineraries,
        itineraries,
        itineraries,
        itineraries,
        itineraries,
        itineraries,
        itineraries,
        itineraries,
      ].flat();
      const result = helper.paginate(manyResults, {});
      expect(result).toHaveLength(RESULTS_SEARCH_LIMIT);
    });

    test.todo(
      'should return results based on default values if page filter has been specified, but not the limit filter'
    );

    test.todo(
      'should return results based on default values if limit filter has been specified, but not the page filter'
    );
  });

  describe('sort', () => {
    const itineraries = [
      { cityTo: 'Bangkok', price: 1300, distance: 5000 },
      { cityTo: 'Barcelona', price: 213, distance: 1900 },
      { cityTo: 'London', price: 200, distance: 2200 },
      { cityTo: 'Paris', price: 80, distance: 2000 },
    ];

    test('should sort by ascending price when no sort parameters', () => {
      const sorted = helper.sort(itineraries, {});
      expect(sorted[0].cityTo).toEqual('Paris');
      expect(sorted[1].cityTo).toEqual('London');
      expect(sorted[2].cityTo).toEqual('Barcelona');
      expect(sorted[3].cityTo).toEqual('Bangkok');
    });

    test('should sort by ascending total price when sort=price parameter is provided', () => {
      const sorted = helper.sort(itineraries, { sort: 'price' });
      expect(sorted[0].cityTo).toEqual('Paris');
      expect(sorted[1].cityTo).toEqual('London');
      expect(sorted[2].cityTo).toEqual('Barcelona');
      expect(sorted[3].cityTo).toEqual('Bangkok');
    });
    test('should sort by ascending total distance when sort=distance parameter is provided', () => {
      const sorted = helper.sort(itineraries, { sort: 'distance' });
      expect(sorted[0].cityTo).toEqual('Barcelona');
      expect(sorted[1].cityTo).toEqual('Paris');
      expect(sorted[2].cityTo).toEqual('London');
      expect(sorted[3].cityTo).toEqual('Bangkok');
    });
    test('should sort by ascending price when the sort parameter is a non-sortable field', () => {
      const sorted = helper.sort(itineraries, { sort: 'departureDate' });
      expect(sorted[0].cityTo).toEqual('Paris');
      expect(sorted[1].cityTo).toEqual('London');
      expect(sorted[2].cityTo).toEqual('Barcelona');
      expect(sorted[3].cityTo).toEqual('Bangkok');
    });

    test('should return an empty array if the itineraries argument is empty', () => {
      const sorted = helper.sort([], {});
      expect(sorted).toBeInstanceOf(Array);
      expect(sorted).toHaveLength(0);
    });
  });

  describe('applyFilters', () => {
    test.todo('should apply filters, paginane and sort as expected');
    test.todo(
      'should return a clone of the itineraries if there was no filters, page or sort filters'
    );
  });

  describe('getCurrentUrlFromRequest', () => {
    test('return a well-formed URLSearchParams object from req.query', () => {
      const req = {
        query: {
          departureDate: '2022-09-22',
          origins: {
            flyFrom: ['MAD', 'LIS'],
            adults: ['1', '1'],
            children: ['0', '0'],
            infants: ['0', '0'],
          },
        },
      };

      const url = helper.getCurrentUrlFromRequest(req);
      expect(url).toBeInstanceOf(URLSearchParams);
      expect(url.get('departureDate')).toBe('2022-09-22');
      expect(url.getAll('origins[][flyFrom]')).toEqual(
        expect.arrayContaining(['MAD', 'LIS'])
      );
    });
    test('return a well-formed URLSearchParams object from req.body', () => {
      const req = {
        body: {
          departureDate: '2022-09-22',
          origins: {
            flyFrom: ['MAD', 'LIS'],
            adults: ['1', '1'],
            children: ['0', '0'],
            infants: ['0', '0'],
          },
        },
      };

      const url = helper.getCurrentUrlFromRequest(req);
      expect(url).toBeInstanceOf(URLSearchParams);
      expect(url.get('departureDate')).toBe('2022-09-22');
      expect(url.getAll('origins[][flyFrom]')).toEqual(
        expect.arrayContaining(['MAD', 'LIS'])
      );
    });
  });

  describe('buildNavigationUrlsFromRequest', () => {
    let req, route;
    beforeEach(() => {
      req = {
        body: {
          departureDate: '2022-09-22',
          origins: {
            flyFrom: ['MAD', 'LIS'],
            adults: ['1', '1'],
            children: ['0', '0'],
            infants: ['0', '0'],
          },
        },
        filter: {
          page: 2,
          sort: 'distance',
          priceFrom: 32,
          priceTo: 522,
          maxConnections: 0,
        },
      };
      route = '/common';
    });
    test('should return an object with previous, next, sort, sortByPrice and sortByDistance fields', () => {
      const navigation = helper.buildNavigationUrlsFromRequest(
        req,
        route,
        true
      );

      expect(navigation).toHaveProperty('previous');
      expect(navigation).toHaveProperty('next');
      expect(navigation).toHaveProperty('sort');
      expect(navigation).toHaveProperty('sortByPrice');
      expect(navigation).toHaveProperty('sortByDistance');
    });

    test('should return a previous url with a page field in a normal scenario', () => {
      const navigation = helper.buildNavigationUrlsFromRequest(
        req,
        route,
        true
      );
      expect(navigation.previous).toMatch(/&page=/);
    });

    test('should return a null previous url when there is no page parameter', () => {
      delete req.filter.page;
      const navigation = helper.buildNavigationUrlsFromRequest(
        req,
        route,
        true
      );
      expect(navigation.previous).toBeNull();
    });
    test('should return a null previous url when page parameter is 1', () => {
      req.filter.page = 1;
      const navigation = helper.buildNavigationUrlsFromRequest(
        req,
        route,
        true
      );
      expect(navigation.previous).toBeNull();
    });

    test('should return a null next url when no next page is requested', () => {
      const navigation = helper.buildNavigationUrlsFromRequest(
        req,
        route,
        false
      );
      expect(navigation.next).toBeNull();
    });

    // TODO: complete with more tests for other fields
  });
});
