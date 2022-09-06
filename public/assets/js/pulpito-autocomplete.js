const cities = [
  'Madrid MAD',
  'London Luton LTN',
  'London Gatwick GAT',
  'London Stansted STN',
  'Paris Charles de Gaulles CDG',
  'Paris Orly ORY',
  'Paris Beauvais BVA',
  'Lyon Saint Exupéry LYS',
  "Dublin O'Farrell DUB",
  'Lisbon José Saramago LIS',
  'Oporto OPO',
  'Bangkok BKK',
  'Sydney SYD',
  'Bordeaux BOD',
  'Toulouse TLS',
  'Barcelona El Prat BCN',
];

function doesItemContainsInput(item, input) {
  // console.log('doesItemContainsInput', item, input);
  return item.toLowerCase().includes(input.toLowerCase());
}

function autocomplete(inp, arr) {
  /*the autocomplete function takes only one argument, the text field element */

  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener('input', async function (e) {
    let itemsContainer,
      matchingItem,
      val = this.value;

    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val || val.length < 3) {
      return false;
    }
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    itemsContainer = document.createElement('DIV');
    itemsContainer.setAttribute('id', this.id + 'autocomplete-list');
    itemsContainer.setAttribute('class', 'autocomplete-items');
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(itemsContainer);
    /*for each item in the array...*/

    // we fetch the matching values from API
    try {
      const res = await axios({
        method: 'GET',
        url: `/api/v1/airports/?q=${val}`,
      });
      if (res.data.status === 'success' && res.data.data.airports.length > 0) {
        const airports = res.data.data.airports;

        airports.forEach((airport) => {
          /*check if the item starts with the same letters as the text field value:*/

          /*create a DIV element for each matching element:*/
          matchingItem = document.createElement('DIV');
          /*make the matching letters bold:*/

          matchingItem.innerHTML = `${airport.municipality} - ${airport.name} (${airport.iata_code}) - ${airport.country}`;

          /*insert a input field that will hold the current array item's value:*/
          matchingItem.innerHTML += `<input type='hidden' data-iata-code='${airport.iata_code}' data-municipality='${airport.municipality}' data-name='${airport.name}' data-country='${airport.country}'>`;
          /*execute a function when someone clicks on the item value (DIV element):*/
          matchingItem.addEventListener('click', function (e) {
            const airportInfo = this.getElementsByTagName('input')[0].dataset;

            /*insert the value for the autocomplete text field:*/
            inp.value = airportInfo.iataCode;

            // `${
            //   this.getElementsByTagName('input')[0].dataset.municipality
            // } (${this.getElementsByTagName('input')[0].dataset.iataCode})`;
            /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/

            /* complete the span part below */
            inp.parentElement.getElementsByTagName(
              'span'
            )[0].innerHTML = `${airportInfo.municipality} - ${airportInfo.name} (${airportInfo.iataCode}) - ${airportInfo.country}`;

            closeAllLists();
          });
          itemsContainer.appendChild(matchingItem);
        });
      }
    } catch (err) {
      if (err.response) {
        console.error(err.response.data.message);
      } else {
        console.error(err.message);
      }
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener('keydown', function (e) {
    var x = document.getElementById(this.id + 'autocomplete-list');
    if (x) x = x.getElementsByTagName('div');
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) {
      //up
      /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add('autocomplete-active');
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove('autocomplete-active');
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName('autocomplete-items');
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener('click', function (e) {
    closeAllLists(e.target);
  });
}

const originsInput = document.querySelectorAll(
  `.multi_city_form input[name='origins[][flyFrom]'`
);
originsInput.forEach((originInput) => autocomplete(originInput, cities));
