"use strict";

const form = document.querySelector(".form");
const inputRestaurant = document.querySelector(".form__input--restaurant");
const inputRating = document.querySelector(".form__input--rating");
const inputPrice = document.getElementById("form__input--price");
const inputDescription = document.querySelector(".form__input--description");
const logsContainer = document.querySelector(".logs");
const sorting = document.querySelector(".sorting");
const sortingInput = document.querySelector(".sorting__input");

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
  #mapZoomLevel = 13;
  #logs = [];

  constructor() {
    // Get user's current position
    this._getPosition();

    // Retrieve data from local storage
    this._getLocalStorage();

    // Event handlers
    form.addEventListener("submit", this._newLog.bind(this));
    logsContainer.addEventListener("click", this._moveToPopup.bind(this));

    if (sortingInput.options[sortingInput.selectedIndex].value === "rating")
      console.log("rating");
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

    const coords = [34.0201613, -118.4227626];

    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));

    this.#logs.forEach((log) => this._renderLogMarker(log));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    sorting.classList.add("hidden");
  }

  _hideForm() {
    form.classList.add("hidden");
    sorting.classList.remove("hidden");
    inputRestaurant.value = inputRating.value = inputDescription.value = "";
  }

  _newLog(e) {
    const validInputs = (...inputs) => inputs.every((inp) => inp.length > 0);

    e.preventDefault();

    // Get data from form
    const name = inputRestaurant.value;
    const rating = inputRating.options[inputRating.selectedIndex].text;
    const price = inputPrice.options[inputPrice.selectedIndex].text;
    const description = inputDescription.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let log;

    // Create new log object

    // Check if data is valid
    if (!validInputs(name, description))
      return alert("Must fill out all fields");

    log = new Log([lat, lng], name, rating, price, description);

    // Add object to log array
    this.#logs.push(log);

    // Render new log on map as marker
    this._renderLogMarker(log);

    // Render new log on list
    this._renderLog(log);

    // Hide form + clear input values
    this._hideForm();

    // Set local storage
    this._setLocalStorage();
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
      .setPopupContent(`${log.name} ${log.price}<br> ${log.rating} `)
      .openPopup();
  }

  _renderLog(log) {
    const html = `<li class="log" data-id=${log.id}>
    <h2>${log.name}</h2>
    <div class="log__details">
      <div class="log__details--left">
        ${log.description}
      </div>
      <div class="log__details--right">
        <div class="details__rating">${log.rating}</div>
        <div class="details__price">${log.price}</div>
      </div>
    </div>
  </li>`;

    form.insertAdjacentHTML("afterend", html);
  }

  _sortLogsByRating() {
    this.#logs.sort(function (a, b) {
      if (a.rating < b.rating) return 1;
    });
  }

  _moveToPopup(e) {
    const logEl = e.target.closest(".log");

    if (!logEl) return;

    const log = this.#logs.find((log) => log.id === logEl.dataset.id);

    this.#map.setView(log.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  _setLocalStorage() {
    localStorage.setItem("logs", JSON.stringify(this.#logs));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("logs"));

    if (!data) {
      sorting.classList.add("hidden");
      return;
    }

    this.#logs = data;

    this.#logs.forEach((log) => this._renderLog(log));
    console.log(this.#logs);
  }

  reset() {
    localStorage.removeItem("logs");
    location.reload();
  }
}

const app = new App();
