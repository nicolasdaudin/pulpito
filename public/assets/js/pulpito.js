$(document).ready(function () {
  $('#addMulticityRow').on('click', function () {
    if (document.querySelectorAll('.multi_city_form').length === 9) {
      alert('Max City Limit Reached!!');
      return;
    }

    const formWrapper = document.querySelector('.multi_city_form_wrapper');
    // const cityForms = formWrapper.querySelector('.multi');
    const lastCityForm = formWrapper.querySelector(
      '.multi_city_form:last-child'
    );
    const newIndex = +lastCityForm.dataset.originsIndex + 1;
    const newCityForm = lastCityForm.cloneNode(true);

    newCityForm.dataset.originsIndex = newIndex;
    newCityForm
      .querySelector('.btn-add')
      .addEventListener('click', addBtnHandler.bind({ type: '.pcount' }));
    newCityForm
      .querySelector('.btn-add-c')
      .addEventListener('click', addBtnHandler.bind({ type: '.ccount' }));
    newCityForm
      .querySelector('.btn-add-in')
      .addEventListener('click', addBtnHandler.bind({ type: '.incount' }));
    newCityForm
      .querySelector('.btn-subtract')
      .addEventListener(
        'click',
        substractBtnHandler.bind({ type: '.pcount', minValue: 1 })
      );
    newCityForm
      .querySelector('.btn-subtract-c')
      .addEventListener(
        'click',
        substractBtnHandler.bind({ type: '.ccount', minValue: 0 })
      );
    newCityForm
      .querySelector('.btn-subtract-in')
      .addEventListener(
        'click',
        substractBtnHandler.bind({ type: '.incount', minValue: 0 })
      );

    const originInput = newCityForm.querySelector(
      `input[name='origins[][flyFrom]'`
    );
    autocomplete(originInput);

    formWrapper.appendChild(newCityForm);
  });
  // Remove Button Click
  $(document).on('click', function (e) {
    if (e.target.id === 'remove_multi_city') {
      $(e.target).parent().closest('.multi_city_form').remove();
    }
  });
});

$('.btn-add,.btn-subtract').on('click touchstart', function () {
  const qadult = $('#f-qadult').val();
  const qchild = $('#f-qchild').val();
  const qinfant = $('#f-qinfant').val();

  $('.qstring').text(
    ` ${qadult} Adults - ${qchild} Childs - ${qinfant} Infants`
  );
  event.stopPropagation();
  event.preventDefault();
});

function updateOriginPassengersCount(index) {
  const passengersCountElement = document.querySelector(
    `.multi_city_form[data-origins-index='${index}'] .final-count`
  );

  const passengersTypes = document.querySelector(
    `.multi_city_form[data-origins-index='${index}'] .passengers-types`
  );
  const adults = +passengersTypes.querySelector('.pcount').value;
  const children = +passengersTypes.querySelector('.ccount').value;
  const infants = +passengersTypes.querySelector('.incount').value;

  const passengersCount = adults + children + infants;

  passengersCountElement.innerHTML = `${passengersCount} Passager${
    passengersCount > 1 ? 's' : ''
  }`;
}

function addCounter(selector, index) {
  const passengersTypes = document.querySelector(
    `.multi_city_form[data-origins-index='${index}'] .passengers-types`
  );
  const passengerSelector = passengersTypes.querySelector(selector);
  let value = +passengerSelector.value;
  //   console.log('currentPassengerNb', value);
  value++;
  passengerSelector.value = value;

  event.stopPropagation();
  event.preventDefault();

  updateOriginPassengersCount(index);
}

function substractCounter(selector, index, minValue) {
  const passengersTypes = document.querySelector(
    `.multi_city_form[data-origins-index='${index}'] .passengers-types`
  );
  const passengerSelector = passengersTypes.querySelector(selector);
  let value = +passengerSelector.value;

  if (value !== minValue) {
    value--;
  }
  passengerSelector.value = value;
  event.stopPropagation();
  event.preventDefault();

  updateOriginPassengersCount(index);
}

const addBtnHandler = function (e) {
  const originsIndex =
    e.target.closest('.multi_city_form').dataset.originsIndex;

  addCounter(this.type, originsIndex);
};

const substractBtnHandler = function (e) {
  const originsIndex =
    e.target.closest('.multi_city_form').dataset.originsIndex;
  substractCounter(this.type, originsIndex, this.minValue);
};

// adultes
$('.btn-add').on('click touchstart', addBtnHandler.bind({ type: '.pcount' }));
$('.btn-subtract').on(
  'click touchstart',
  substractBtnHandler.bind({ type: '.pcount', minValue: 1 })
);

// enfants
$('.btn-add-c').on('click touchstart', addBtnHandler.bind({ type: '.ccount' }));
$('.btn-subtract-c').on(
  'click touchstart',
  substractBtnHandler.bind({ type: '.ccount', minValue: 0 })
);

// bébés
$('.btn-add-in').on(
  'click touchstart',
  addBtnHandler.bind({ type: '.incount' })
);
$('.btn-subtract-in').on(
  'click touchstart',
  substractBtnHandler.bind({ type: '.incount', minValue: 0 })
);

$(document).ready(function () {
  $('.cabin-list button').click(function () {
    event.stopPropagation();
    event.preventDefault();
    $('.cabin-list button.active').removeClass('active');
    $(this).addClass('active');
  });

  // handle click on "Book all flights" button on search results - to open at once all the booking links
  const openLinks = (links) => {
    links.forEach((link) => {
      window.open(link, '_blank');
    });
  };

  const flightSearchResultWrapper = document.querySelector(
    '.flight_search_result_wrapper'
  );
  flightSearchResultWrapper.addEventListener('click', (e) => {
    const btnBookAll = e.target.closest('.btn_book_all');
    if (!btnBookAll) return;
    openLinks(JSON.parse(btnBookAll.dataset.links));
  });

  // update the URL in the navigation bar with info from the search query (since we can't redirect from pug)

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

  // update price ranger filters on document load
  const priceSlider = document.querySelector('#price-slider');
  if (priceSlider) {
    // getting options from datasets-
    const { minPossiblePrice, maxPossiblePrice, priceFrom, priceTo } =
      priceSlider.dataset;
    console.log(
      'update price slider',
      minPossiblePrice,
      maxPossiblePrice,
      priceFrom,
      priceTo
    );
    // remove the slider created by the template, not sure how it works or how to access it.
    // and we don't want to modify the template...

    priceSlider.noUiSlider.destroy();
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
  }

  const btnRadioMaxConnections = document.querySelector(
    '.btn_radio_max_connections'
  );

  // handle click on 'Apply' for search filters
  const btnApplySearchFilters = document.querySelector('.apply_search_filters');
  if (btnApplySearchFilters) {
    btnApplySearchFilters.addEventListener('click', (e) => {
      let urlParams = [];
      if (priceSlider) {
        // get sliders value
        const [priceFrom, priceTo] = priceSlider.noUiSlider
          .get()
          .map((value) => Number(value.replace(' €', '')));

        urlParams.push(`&priceFrom=${priceFrom}`, `&priceTo=${priceTo}`);
      }

      if (btnRadioMaxConnections) {
        const btnRadioMaxConnectionsChecked =
          btnRadioMaxConnections.querySelector(
            'input[name="maxConnections"]:checked'
          );
        console.log(btnRadioMaxConnectionsChecked.value);
        urlParams.push(
          `&maxConnections=${btnRadioMaxConnectionsChecked.value}`
        );
      }

      // get current url and append these two new params
      const currentUrl = window.location.href;
      console.log('current url', currentUrl);

      const newUrl = `${currentUrl}${urlParams.join('')}`;
      console.log('gonna open this url:', newUrl);

      // open location
      window.open(newUrl, '_self');
    });
  }
});
