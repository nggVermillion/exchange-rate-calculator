//when the page gets refreshed or loaded we fetch the exchange rates
//for the available currencies to chose from
window.onload = function() {
    updateExchangeRates();
  };

let exchangeRates = {};

//make this dynamic by iterating over the options of select to make it scalable
function getAvailableCurrencies(){
  const selectEl = document.getElementById("base");
  const availableCurrencies = selectEl.querySelectorAll("option");
  var currencies = "";
  availableCurrencies.forEach(option => {
    if(currencies === ""){
      currencies += option.value;
    }else{
      currencies += "," + option.value;
    }
  });
  return currencies;
}

//add to dictionary "exchange rates"

function addToExchangeRates(response){
  const base = response["base"];
  let currencies = {};
  for(const currency in response.rates){
    currencies[currency] = response.rates[currency];
  }
  exchangeRates[base] = currencies;
}

//make the fetch request
//need to first add api key
function makeRequest(source){
  var myHeaders = new Headers();
  myHeaders.append("apiKey", "Your API Key");

  var requestOptions = {
    method: "Get",
    redirect: "follow",
    headers: myHeaders
  };

  //let base = source;
  let base = source;
  let symbols = getAvailableCurrencies();

  fetch(`https://api.apilayer.com/exchangerates_data/latest?symbols=${symbols}&base=${base}`, requestOptions)
  .then(response => response.text())
  .then(result => {
    console.log(result);
    addToExchangeRates(JSON.parse(result));
  })
  .catch(error => console.log('error', error));
}

//iterate over all options and for each option make a new dict key and add the
//respective exchange rates as "currency":"exchange rate" values

function updateExchangeRates(){
  const selectEl = document.getElementById("base");
  const availableCurrencies = selectEl.querySelectorAll("option");

  availableCurrencies.forEach(option => {
    makeRequest(option.value);
  })
}


//so now we have a dictionary with all the exchange rates for the available currencies
// we now need to dynamically change the values displayed if the user changes something

//get both <select> and input fields
const fromCurrency = document.getElementById("base");
const toCurrency = document.getElementById("final");

const fromAmount = document.getElementById("amt-base");
const toAmount = document.getElementById("amt-final");

//save the selected currencies and amount entered
var currentFromCurrency = fromCurrency.options[fromCurrency.selectedIndex].value;
var currentToCurrency = toCurrency.options[toCurrency.selectedIndex].value;



//add event listener to both <select> "base" and "final"
fromCurrency.addEventListener("change", function(event){
    var selectedCurrency = event.target.value;
    currentFromCurrency = selectedCurrency;

});

toCurrency.addEventListener("change", function(event){
    var selectedCurrency = event.target.value;
    currentToCurrency = selectedCurrency;
});

//add event listener to both input fields
fromAmount.addEventListener("input", function(event){
    var currentAmount = event.target.value;
    var exchangeR = exchangeRates[`${currentFromCurrency}`][`${currentToCurrency}`];
    toAmount.value = currentAmount *exchangeR;
});

toAmount.addEventListener("input", function(event){
    var currentAmount = event.target.value;
    var exchangeR = exchangeRates[`${currentToCurrency}`][`${currentFromCurrency}`];
    fromAmount.value = currentAmount*exchangeR;
});

const swapButton = document.getElementById("swap-button");

swapButton.addEventListener("click", function(event){
  var base = currentFromCurrency;
  currentFromCurrency = currentToCurrency;
  fromCurrency.value = currentToCurrency;
  currentToCurrency = base;
  toCurrency.value = base;

  var amtBase = fromAmount.value;
  fromAmount.value = toAmount.value;
  toAmount.value = amtBase;
})
