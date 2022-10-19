/**
 * After adding or removing an origin, we 'renumber' the Header text for each origin row
 */
const renumberOriginHeaders = () => {
  const formWrapper = document.querySelector('.multi_city_form_wrapper');
  // const originForms = formWrapper.querySelector('.multi');
  const originForms = formWrapper.querySelectorAll('.multi_city_form');
  originForms.forEach((originForm, i) => {
    if (originForm.dataset.originsIndex) {
      // its a city form, not the first multi_city_form (which is actually the date)
      originForm.querySelector('.origin_header').innerHTML = `Ville #${i}`;
    }
  });
};

/**
 * Click on "Ajouter un point de départ" in the search form, to add a new destination
 */
const addOriginHandler = () => {
  // add the new origin
  if (document.querySelectorAll('.multi_city_form').length === 9) {
    alert('Max City Limit Reached!!');
    return;
  }

  const formWrapper = document.querySelector('.multi_city_form_wrapper');
  // const originForms = formWrapper.querySelector('.multi');
  const lastCityForm = formWrapper.querySelector('.multi_city_form:last-child');
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
  renumberOriginHeaders();
};

const removeOriginHandler = (e) => {
  // remove the html element
  if (e.target.id === 'remove_multi_city') {
    const cityToBeRemoved = e.target.parentElement.closest('.multi_city_form');
    const cityToBeRemovedIndex = +cityToBeRemoved.dataset.originsIndex;
    cityToBeRemoved.remove();

    // renumerate the "Ville #" for each origins
    renumberOriginHeaders();
  }
};

document
  .querySelector('#addMulticityRow')
  .addEventListener('click', addOriginHandler);

/**
 * Click on "Supprimer un point de départ" in the search flights form
 */
document.addEventListener('click', removeOriginHandler);

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
    .querySelectorAll('.btn-add')
    .forEach((btn) =>
      btn.addEventListener('click', addBtnHandler.bind({ type: '.pcount' }))
    );
  htmlElement
    .querySelectorAll('.btn-subtract')
    .forEach((btn) =>
      btn.addEventListener(
        'click',
        substractBtnHandler.bind({ type: '.pcount', minValue: 1 })
      )
    );

  // enfants
  htmlElement
    .querySelectorAll('.btn-add-c')
    .forEach((btn) =>
      btn.addEventListener('click', addBtnHandler.bind({ type: '.ccount' }))
    );
  htmlElement
    .querySelectorAll('.btn-subtract-c')
    .forEach((btn) =>
      btn.addEventListener(
        'click',
        substractBtnHandler.bind({ type: '.ccount', minValue: 0 })
      )
    );

  // bébés
  htmlElement
    .querySelectorAll('.btn-add-in')
    .forEach((btn) =>
      btn.addEventListener('click', addBtnHandler.bind({ type: '.incount' }))
    );
  htmlElement
    .querySelectorAll('.btn-subtract-in')
    .forEach((btn) =>
      btn.addEventListener(
        'click',
        substractBtnHandler.bind({ type: '.incount', minValue: 0 })
      )
    );
};
// first call on load
initPassengersButtons(document);
