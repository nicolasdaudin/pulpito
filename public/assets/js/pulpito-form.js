/**
 * Click on "Ajouter un point de départ" in the search form, to add a new destination
 */
document
  .querySelector('#addMulticityRow')
  .addEventListener('click', function () {
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
    initPassengersButtons(newCityForm);

    // add autocomplete on that field
    const originInput = newCityForm.querySelector(
      `input[name='origins[][flyFrom]'`
    );
    autocomplete(originInput);

    formWrapper.appendChild(newCityForm);
  });

/**
 * Click on "Supprimer un point de départ" in the search flights form
 */
document.addEventListener('click', function (e) {
  if (e.target.id === 'remove_multi_city') {
    e.target.parentElement.closest('.multi_city_form').remove();
  }
});

/**
 * to update the total passengers count in the row identified by index
 * @param {} index
 */
const updateOriginPassengersCount = (index) => {
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
};

/**
 * Increase counter for that destination (identified by its index) and for that type of person (adults, children or infants) identified by selector
 * @param {} selector
 * @param {*} index
 */
const addCounter = (selector, index) => {
  const passengersTypes = document.querySelector(
    `.multi_city_form[data-origins-index='${index}'] .passengers-types`
  );
  const passengerSelector = passengersTypes.querySelector(selector);
  let value = +passengerSelector.value;
  value++;
  passengerSelector.value = value;

  event.stopPropagation();
  event.preventDefault();

  updateOriginPassengersCount(index);
};

/**
 * Decrease counter for that destination (identified by its index) and for that type of person (adults, children or infants) identified by selector.
 * Can't go over min value
 * @param {} selector
 * @param {*} index
 * @param {} minValue
 */
const substractCounter = (selector, index, minValue) => {
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
};

/**
 * Handler for clicks on add passengers buttons.
 * Before calling this function, it is necessary to bind an object of type {type} where type represents the type of button
 * @param {*} e
 */
const addBtnHandler = function (e) {
  const originsIndex =
    e.target.closest('.multi_city_form').dataset.originsIndex;
  addCounter(this.type, originsIndex);
};

/**
 * Handler for clicks on remove passengers buttons.
 * Before Calling this function it is necessary to bind an object of type {type,minValue} where type represents the type of button, and minValue the min value
 * @param {*} e
 */
const substractBtnHandler = function (e) {
  const originsIndex =
    e.target.closest('.multi_city_form').dataset.originsIndex;
  substractCounter(this.type, originsIndex, this.minValue);
};

/**
 * Init new passengers buttons, either on page load or when a destination is added in the search form
 *
 * @param {*} htmlElement identifies the html element where the buttons are located
 */
const initPassengersButtons = (htmlElement) => {
  // adultes
  htmlElement
    .querySelector('.btn-add')
    .addEventListener('click', addBtnHandler.bind({ type: '.pcount' }));
  htmlElement
    .querySelector('.btn-subtract')
    .addEventListener(
      'click',
      substractBtnHandler.bind({ type: '.pcount', minValue: 1 })
    );

  // enfants
  htmlElement
    .querySelector('.btn-add-c')
    .addEventListener('click', addBtnHandler.bind({ type: '.ccount' }));
  htmlElement
    .querySelector('.btn-subtract-c')
    .addEventListener(
      'click',
      substractBtnHandler.bind({ type: '.ccount', minValue: 0 })
    );

  // bébés
  htmlElement
    .querySelector('.btn-add-in')
    .addEventListener('click', addBtnHandler.bind({ type: '.incount' }));
  htmlElement
    .querySelector('.btn-subtract-in')
    .addEventListener(
      'click',
      substractBtnHandler.bind({ type: '.incount', minValue: 0 })
    );
};
// first call on load
initPassengersButtons(document);
