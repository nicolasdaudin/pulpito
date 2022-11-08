/* eslint-disable no-undef */
/**
 * Found in the original template and adapted
 * @param {} originInput the html input element to which we want to apply the autocomplete
 */
function autocomplete(originInput) {
  /*the autocomplete function takes only one argument, the text field element */

  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  originInput.addEventListener('input', async function () {
    let userInputValue = this.value;

    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!userInputValue || userInputValue.length < 3) {
      // less than 3 characters in the input field, we don't display any autocomplete results.
      return false;
    }
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    let itemsContainer = document.createElement('DIV');
    itemsContainer.setAttribute('id', this.id + 'autocomplete-list');
    itemsContainer.setAttribute('class', 'autocomplete-items');
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(itemsContainer);
    /*for each item in the array...*/

    // we fetch the matching values from API
    try {
      const res = await axios({
        method: 'GET',
        url: `/api/v1/airports/?q=${userInputValue}`,
      });
      if (res.data.status === 'success' && res.data.data.airports.length > 0) {
        const airports = res.data.data.airports;

        airports.forEach((airport) => {
          /*check if the item starts with the same letters as the text field value:*/

          /*create a DIV element for each matching element:*/
          let matchingItem = document.createElement('DIV');
          /*make the matching letters bold:*/

          matchingItem.innerHTML = `${airport.municipality} - ${airport.name} (${airport.iata_code}) - ${airport.country}`;

          /*execute a function when someone clicks on the item value (DIV element):*/
          matchingItem.addEventListener('click', function () {
            //const airportInfo = this.getElementsByTagName('input')[0].dataset;

            /*insert the value for the autocomplete text field:*/
            originInput.value = airport.iata_code;

            /* complete the span part below */
            originInput.parentElement.getElementsByTagName(
              'span'
            )[0].innerHTML = `${airport.municipality} - ${airport.name} (${airport.iata_code}) - ${airport.country}`;

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

  /**
   * execute a function presses a key on the keyboard:
   **/
  originInput.addEventListener('keydown', function (e) {
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

  /**
   * Make the current autocomplete item "active"  - Found in the original template
   * @param {*} x autocomplete list
   * @returns
   */
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

  /**
   * Make the current autocomplete item "inactive" - Found in the original template
   * @param {} x autocomplete list
   */
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove('autocomplete-active');
    }
  }

  /**
   * Close all autocomplete lists in the document,
   * except the one passed as an argument
   * Found in the original template
   * @param {*} elmnt
   */
  function closeAllLists(elmnt) {
    var x = document.getElementsByClassName('autocomplete-items');
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != originInput) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }

  /**
   * whenever someones clicks somewhere in the document, all the opened autocomplete lists are closed except the target of the click (if it's a list)
   */
  document.addEventListener('click', function (e) {
    closeAllLists(e.target);
  });
}

const originsInput = document.querySelectorAll(
  `.multi_city_form input[name='origins[][flyFrom]'`
);
originsInput.forEach((originInput) => autocomplete(originInput));
