const flightSearchResultWrapper = document.querySelector(
  '.flight_search_result_wrapper'
);
const btnApplySearchFilters = document.querySelector('.apply_search_filters');
const btnRadioMaxConnections = document.querySelector(
  '.btn_radio_max_connections'
);
const priceSlider = document.querySelector('#price-slider-flights');

/**
 * handle click on "Book all flights" button on search results - to open at once all the booking links
 * @param {*} links
 */
const openLinks = (links) => {
  links.forEach((link) => {
    window.open(link, '_blank');
  });
};

/**
 * Handler for click on open links
 * @param {*} e
 * @returns
 */
const openLinksHandler = (e) => {
  const btnBookAll = e.target.closest('.btn_book_all');
  if (!btnBookAll) return;
  openLinks(JSON.parse(btnBookAll.dataset.links));
};

/**
 * Handler when click on "apply" for filters
 * @param {} e
 */
const applySearchFiltersHandler = (e) => {
  let urlParams = [];

  // document.querySelector('.preloader').style.display = 'block';

  // get sliders value
  const [priceFrom, priceTo] = priceSlider.noUiSlider
    .get()
    .map((value) => Number(value.replace(' €', '')));

  urlParams.push(`&priceFrom=${priceFrom}`, `&priceTo=${priceTo}`);

  const btnRadioMaxConnectionsChecked = btnRadioMaxConnections.querySelector(
    'input[name="maxConnections"]:checked'
  );
  urlParams.push(`&maxConnections=${btnRadioMaxConnectionsChecked.value}`);

  // retrive sort param
  const sortResultsElement = document.querySelector('.sort_results');
  if (sortResultsElement) {
    urlParams.push(`&sort=${sortResultsElement.dataset.sort}`);
  }

  // get current url and append these two new params
  const currentUrl = window.location.href;
  const newUrl = `${currentUrl}${urlParams.join('')}`;

  // open location
  window.open(newUrl, '_self');
};

/**
 *  update price ranger filters on document load
 */
const updatePriceSlider = () => {
  // getting options from datasets-
  const { minPossiblePrice, maxPossiblePrice, priceFrom, priceTo } =
    priceSlider.dataset;

  // remove the slider created by the template, not sure how it works or how to access it.
  // and we don't want to modify the template...
  if (priceSlider.noUiSlider) priceSlider.noUiSlider.destroy();
  noUiSlider.create(priceSlider, {
    start: [+priceFrom, +priceTo],
    connect: true,
    step: 25,
    margin: 50,
    range: {
      min: +minPossiblePrice,
      max: +maxPossiblePrice,
    },
    tooltips: true,
    format: wNumb({
      decimals: 0,
      suffix: ' €',
    }),
  });
};

/**
 * update on page load the URL in the navigation bar with info from the search query (since we can't redirect from pug)
 * @param {*} e
 */
const updateNavigationBarUrl = () => {
  const originInputs = document.querySelectorAll(
    `.multi_city_form input[name='origins[][flyFrom]'`
  );
  if (originInputs[0].value) {
    // form has been filled with values
    const searchForm = document
      .querySelector('.multi_city_form')
      .closest('form');

    const formData = new FormData(searchForm);
    const urlQueryParamsFromFormData = new URLSearchParams(formData);

    const newUrl = '/common?' + urlQueryParamsFromFormData.toString();

    window.history.replaceState({}, document.title, newUrl);
  }
};

flightSearchResultWrapper.addEventListener('click', openLinksHandler);
btnApplySearchFilters.addEventListener('click', applySearchFiltersHandler);

updateNavigationBarUrl();
updatePriceSlider();
