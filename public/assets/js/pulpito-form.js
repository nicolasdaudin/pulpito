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
    // newCityForm
    //   .querySelector('.btn-add')
    //   .addEventListener('click', addBtnHandler.bind({ type: '.pcount' }));
    // newCityForm
    //   .querySelector('.btn-add-c')
    //   .addEventListener('click', addBtnHandler.bind({ type: '.ccount' }));
    // newCityForm
    //   .querySelector('.btn-add-in')
    //   .addEventListener('click', addBtnHandler.bind({ type: '.incount' }));
    // newCityForm
    //   .querySelector('.btn-subtract')
    //   .addEventListener(
    //     'click',
    //     substractBtnHandler.bind({ type: '.pcount', minValue: 1 })
    //   );
    // newCityForm
    //   .querySelector('.btn-subtract-c')
    //   .addEventListener(
    //     'click',
    //     substractBtnHandler.bind({ type: '.ccount', minValue: 0 })
    //   );
    // newCityForm
    //   .querySelector('.btn-subtract-in')
    //   .addEventListener(
    //     'click',
    //     substractBtnHandler.bind({ type: '.incount', minValue: 0 })
    //   );

    const originInput = newCityForm.querySelector(
      `input[name='origins[][flyFrom]'`
    );
    autocomplete(originInput);

    formWrapper.appendChild(newCityForm);
  });
// Remove Button Click
document.addEventListener('click', function (e) {
  if (e.target.id === 'remove_multi_city') {
    e.target.parentElement.closest('.multi_city_form').remove();
  }
});

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
initPassengersButtons(document);
