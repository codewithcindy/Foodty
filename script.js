"use strict";

const form = document.querySelector(".form");
const inputRestaurant = document.querySelector(".form__input--restaurant");
const inputRating = document.querySelector(".form__input--rating");
const inputPrice = document.getElementById("form__input--price");
const inputDescription = document.querySelector(".form__input--description");

class Log {
  date = new Date();
  id = (Date.now() + "").slice(-10);

  constructor(coords, name, rating, price, description) {
    this.coords = coords;
    this.name = name;
    this.rating = rating;
    this.price = price;
    this.description = description;
  }
}

let map, mapEvent;

class App {
  #map;
  #mapEvent;
  #logs = [];

  constructor() {
    this._getPosition();

    form.addEventListener("submit", this._newLog.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Unable to get your location");
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];
    console.log(coords);

    this.#map = L.map("map").setView(coords, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
  }

  _newLog(e) {
    const validInputs = (...inputs) => inputs.every((inp) => inp.length > 0);
    const positiveInputs = (...inputs) => inputs.every((inp) => inp > 0);

    e.preventDefault();

    // Get data from form
    const name = inputRestaurant.value;
    const rating = inputRating.value;
    const price = inputPrice.options[inputPrice.selectedIndex].text;
    const description = inputDescription.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let log;

    // Create new log object

    // Check if data is valid
    if (!validInputs(name, description))
      return alert("Must fill out all fields");
    if (!positiveInputs(rating)) return alert("Must enter a positive rating");

    log = new Log([lat, lng], name, rating, price, description);

    // Add object to log array
    this.#logs.push(log);
    console.log(log);

    // Render new log on map as marker
    this._renderLogMarker(log);

    // Render new log on list
    this._renderLog(log);

    // Hide form + clear input values
    form.classList.add("hidden");
    inputRestaurant.value = inputRating.value = inputDescription.value = "";

    // Set local storage
  }

  _renderLogMarker(log) {
    L.marker(log.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          minWidth: 100,
          maxWidth: 200,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(`${log.name} <br> ${log.rating}/5 ${log.price}`)
      .openPopup();
  }

  _renderLog(log) {
    const html = `<li class="log">
    <h2>${log.name}</h2>
    <div class="log__details">
      <div class="log__details--left">
        ${log.description}
      </div>
      <div class="log__details--right">
        <div class="details__rating">${log.rating}/5</div>
        <div class="details__price">${log.price}</div>
      </div>
    </div>
  </li>`;

    form.insertAdjacentHTML("afterend", html);
  }
}

const app = new App();
