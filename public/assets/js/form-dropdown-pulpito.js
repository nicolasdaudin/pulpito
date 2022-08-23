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

  console.log(adults, children, infants);

  const passengersCount = adults + children + infants;
  console.log(passengersCount);

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
  console.log(value, minValue);

  if (value !== minValue) {
    value--;
  }
  passengerSelector.value = value;
  event.stopPropagation();
  event.preventDefault();

  updateOriginPassengersCount(index);
}

// adultes
$('.btn-add').on('click touchstart', function (e) {
  const originsIndex =
    e.target.closest('.multi_city_form').dataset.originsIndex;
  addCounter('.pcount', originsIndex);
});

$('.btn-subtract').on('click touchstart', function (e) {
  const originsIndex =
    e.target.closest('.multi_city_form').dataset.originsIndex;
  substractCounter('.pcount', originsIndex, 1);
});

// enfants
$('.btn-add-c').on('click touchstart', function (e) {
  const originsIndex =
    e.target.closest('.multi_city_form').dataset.originsIndex;
  addCounter('.ccount', originsIndex);
});

$('.btn-subtract-c').on('click touchstart', function (e) {
  const originsIndex =
    e.target.closest('.multi_city_form').dataset.originsIndex;
  substractCounter('.ccount', originsIndex, 0);
});

// bébés
$('.btn-add-in').on('click touchstart', function (e) {
  const originsIndex =
    e.target.closest('.multi_city_form').dataset.originsIndex;
  addCounter('.incount', originsIndex);
});

$('.btn-subtract-in').on('click touchstart', function (e) {
  const originsIndex =
    e.target.closest('.multi_city_form').dataset.originsIndex;
  substractCounter('.incount', originsIndex, 0);
});

$(document).ready(function () {
  $('.cabin-list button').click(function () {
    event.stopPropagation();
    event.preventDefault();
    $('.cabin-list button.active').removeClass('active');
    $(this).addClass('active');
  });
});
