// Step 1: Get user coordinates
function getCoordintes() {
  let options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  function success(pos) {
    let crd = pos.coords;
    let lat = crd.latitude.toString();
    let lng = crd.longitude.toString();
    let coordinates = [lat, lng];
    console.log(`Latitude: ${lat}, Longitude: ${lng}`);
    getCity(coordinates);
  }

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  navigator.geolocation.getCurrentPosition(success, error, options);
}

// Step 2: Get city name
function getCity(coordinates) {
  let xhr = new XMLHttpRequest();
  let lat = coordinates[0];
  let lng = coordinates[1];

  // Paste your LocationIQ token below.
  xhr.open('GET', "https://us1.locationiq.com/v1/reverse.php?key=pk.362593489846339f3055b241a316287a&lat=" +
    lat + "&lon=" + lng + "&format=json", true);
  xhr.send();
  xhr.onreadystatechange = processRequest;
  xhr.addEventListener("readystatechange", processRequest, false);

  function processRequest() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      let response = JSON.parse(xhr.responseText);
      let city = response.address.city;
      getResults(city);
    }
  }
}
getCoordintes();

//api for request with city name and get weather of that location :
const api = {
  key: "2fa73590fd8b5a4c6e68098ad5625395",
  base: "https://api.openweathermap.org/data/2.5/"
};

const searchbox = document.querySelector(".search-box");

function getResults(query) {
  fetch(`${api.base}weather?q=${query}&units=metric&APPID=${api.key}`)
    .then((weather) => {
      return weather.json();
    })
    .then((res) => displayResults(res));
}

function displayResults(weather) {
  if (weather.cod === '404') {
    alert('invalid country or city')
  }
  else {
    let city = document.querySelector(".location .city");
    city.innerText = `${weather.name}, ${weather.sys.country}`;

    let now = new Date();
    let date = document.querySelector(".location .date");
    date.innerText = dateBuilder(now);

    let temp = document.querySelector(".current .temp");
    temp.innerHTML = `${Math.round(weather.main.temp)}<span>°C</span>`;

    let weather_el = document.querySelector(".current .weather");
    weather_el.innerText = weather.weather[0].main;

    let hilow = document.querySelector(".hi-low");
    hilow.innerText = `${weather.main.temp_min}°C / ${weather.main.temp_max}°C`;
    document.getElementById('myInput').value = '';

    //for deleter all items of auto compelete
    let x = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < x.length; i++) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}

function dateBuilder(d) {
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  //getDay() retrun number of week
  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();

  return `${day} ${date} ${month} ${year}`;
}

//Add autocomplete feature to site
document.getElementById("myInput").addEventListener("input", () => {
  let search = document.getElementById("myInput").value;
  if (search === '') {
    let x = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < x.length; i++) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
  else {
    //a for loop that make a delay when user input and request to api :
    for (let i = 100000000; i <= 899999999; i += 2);
    fetch(`https://api.locationiq.com/v1/autocomplete?key=pk.362593489846339f3055b241a316287a&q=${search}&limit=10&dedupe=1&tag=place:city`).then((response) => {
      if (response.status === 200)
        return response.json();
      else {
        let x = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < x.length; i++) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }).then((res) => convert(res));

    function convert(obj) {
      if (obj !== undefined) {
        let array = [];
        for (let j = 0; j < obj.length; j++)
          array[j] = obj[j].display_place;

        autocomplete(array);
      }
    }
  }; //Time before execution
});

function autocomplete(arr) {
  closeAllLists();

  /*create a DIV element that will contain the items (values):*/
  let divElement = document.createElement("DIV");
  divElement.setAttribute("id", document.getElementById("myInput").id + "autocomplete-list");
  divElement.setAttribute("class", "autocomplete-items");
  /*append the DIV element as a child of the autocomplete container:*/
  document.getElementById("myInput").parentNode.appendChild(divElement);
  /*for each item in the array...*/
  for (let i = 0; i < arr.length; i++) {
    /*check if the item starts with the same letters as the text field value:*/
    if (arr[i].substr(0, document.getElementById("myInput").value.length).toUpperCase() == document.getElementById("myInput").value.toUpperCase()) {
      /*create a DIV element for each matching element:*/
      let b = document.createElement("DIV");
      /*make the matching letters bold:*/
      b.innerHTML = "<strong>" + arr[i].substr(0, document.getElementById("myInput").value.length) + "</strong>";
      b.innerHTML += arr[i].substr(document.getElementById("myInput").value.length);
      /*insert a input field that will hold the current array item's value:*/
      b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
      /*execute a function when someone clicks on the item value (DIV element):*/
      b.addEventListener("click", (eve) => {
        document.getElementById('myInput').value = eve.target.lastElementChild.value;
        getResults(document.getElementById('myInput').value);
      });
      divElement.appendChild(b);
    }
  }
}

let currentFocus;
currentFocus = -1;
/*execute a function presses a key on the keyboard:*/
document.getElementById("myInput").addEventListener("keydown", (e) => {
  let val = document.getElementById("myInput").value;
  if (!val) {
    return false;
  }
  //x is all pop up list that shows :
  let x = document.querySelector('.autocomplete-items')
  if (x !== null)
    x = x.getElementsByTagName("div");

  if (e.key == 'ArrowDown') {
    currentFocus++;
    /*make the current item more visible:*/
    addActive(x);

    const clck = document.querySelector('.autocomplete-active');
    if (clck) {
      document.getElementById("myInput").value = clck.lastElementChild.value;
    }
  }
  else if (e.key == "ArrowUp") {
    currentFocus--;
    /*make the current item more visible:*/
    addActive(x);

    const clck = document.querySelector('.autocomplete-active');
    if (clck) {
      document.getElementById("myInput").value = clck.lastElementChild.value;
    }
  }
  else if (e.key == 'Enter') {
    e.preventDefault();
    getResults(document.getElementById("myInput").value);

    closeAllLists();
  }
});

function addActive(x) {
  if (!x)
    return false;
  /*start by removing the "active" class on all items:*/
  removeActive(x);
  if (currentFocus >= x.length)
    currentFocus = 0;
  if (currentFocus < 0)
    currentFocus = (x.length - 1);
  /*add class "autocomplete-active" for show more visible :*/
  x[currentFocus].classList.add("autocomplete-active");
}

function removeActive(x) {
  /*a function to remove the "active" class from all autocomplete items:*/
  for (let i = 0; i < x.length; i++) {
    x[i].classList.remove("autocomplete-active");
  }
}
function closeAllLists(elmnt) {
  /*close all autocomplete lists in the document,except the one passed as an argument:*/
  let x = document.getElementsByClassName("autocomplete-items");
  for (let i = 0; i < x.length; i++) {
    if (elmnt != x[i] && elmnt != document.getElementById("myInput")) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
  closeAllLists(e.target);
});