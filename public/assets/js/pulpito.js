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
});
