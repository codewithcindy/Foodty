"use strict";

const form = document.querySelector(".form");
const logsTop = document.querySelector(".logs__top");
const logName = document.querySelector(".log__title");
const logsList = document.querySelector(".logs__entries");
const logsListClear = document.querySelector(".logs__clear");
const inputRestaurant = document.querySelector(".form__input--restaurant");
const inputRating = document.querySelector(".form__input--rating");
const inputPrice = document.getElementById("form__input--price");
const inputDescription = document.querySelector(".form__input--description");
const formHideBtn = document.querySelector(".form__hide__btn");
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
  #mapZoomLevel = 10.5;
  #logs = [];

  constructor() {
    // Get user's current position
    this._getPosition();

    // Retrieve data from local storage
    this._getLocalStorage();

    // Event handlers
    form.addEventListener("submit", this._newLog.bind(this));
    sortingInput.addEventListener("change", this._sortLogs.bind(this));
    logsListClear.addEventListener("click", this._reset.bind(this));
    formHideBtn.addEventListener("click", this._hideForm.bind(this));
    logsContainer.addEventListener("click", this._deleteOrMove.bind(this));
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

    const coords = [37.5576621, -122.3604431];
    // const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._showForm.bind(this));

    this._renderLogMarker(this.#logs);
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputRestaurant.focus();
  }

  _hideForm(e) {
    // e.preventDefault();

    form.classList.add("hidden");
    logsTop.classList.remove("hidden");
    inputRestaurant.value = inputDescription.value = "";
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
    this._renderLogMarker(this.#logs);

    // Render log array
    this._renderLog(this.#logs);

    // Hide form + clear input va1211lues
    this._hideForm();

    // Set local storage
    this._setLocalStorage();
  }

  _renderLogMarker(logs) {
    let markerContainer = document.querySelector(".leaflet-marker-pane");
    let popupContainer = document.querySelector(".leaflet-popup-pane");
    let shadowContainer = document.querySelector(".leaflet-shadow-pane");
    // const overlayContainer = document.querySelector(".leaflet-overlay-pane");

    markerContainer.innerHTML = "";
    popupContainer.innerHTML = "";
    shadowContainer.innerHTML = "";

    logs.forEach((log) => {
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
    });
  }

  _renderLog(logs) {
    logsList.innerHTML = "";
    logsTop.classList.remove("hidden");

    logs.forEach((log) => {
      const html = `<li class="log" data-id=${log.id}>
      <button class="log__delete">
          <i class="far fa-trash-alt "></i>
      </button>
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

      logsList.insertAdjacentHTML("afterbegin", html);
    });
  }

  _sortLogs(e) {
    const sortOption = e.target.value;

    if (sortOption === "rating") {
      const sortByRating = this.#logs.sort(function (a, b) {
        if (a.rating > b.rating) return 1;
        if (a.rating < b.rating) return -1;
      });

      this._renderLog(sortByRating);
    }

    if (sortOption === "price") {
      const sortByPrice = this.#logs.sort(function (a, b) {
        if (a.price > b.price) return -1;
        if (a.price < b.price) return 1;
      });

      this._renderLog(sortByPrice);
    }

    if (sortOption === "date") {
      const sortByDate = this.#logs.sort(function (a, b) {
        if (a.date > b.date) return 1;
        if (a.date < b.date) return -1;
      });

      this._renderLog(sortByDate);
    }
  }

  _deleteOrMove(e) {
    const logEl = e.target.closest(".log");

    // Return if map has not loaded or if no log element was clicked
    if (!this.#map || !logEl) return;

    const log = this.#logs.find((log) => log.id === logEl.dataset.id);

    // User clicks on the trash icon
    if (e.target.classList.contains("fa-trash-alt")) {
      // Remove selected element from logs array
      const deleteEl = this.#logs.indexOf(log);
      this.#logs.splice(deleteEl, 1);

      // Re render log
      this._renderLog(this.#logs);

      // Re render log markers
      this._renderLogMarker(this.#logs);

      // Update local storage
      this._setLocalStorage();
    }
    // User clicks on the log item
    else {
      this.#map.setView(log.coords, this.#mapZoomLevel, {
        animate: true,
        pan: {
          duration: 1,
        },
      });
    }
  }

  _setLocalStorage() {
    localStorage.setItem("logs", JSON.stringify(this.#logs));
  }

  _getLocalStorage() {
    // Get data from storage and turn back int objects
    const data = JSON.parse(localStorage.getItem("logs"));

    // If no data in storage, do nothing
    if (!data) {
      sorting.classList.add("hidden");
      return;
    }

    // If there is data, render it
    this.#logs = data;
    this._renderLog(this.#logs);
  }

  _reset() {
    localStorage.removeItem("logs");
    location.reload();
    // logsTop.classList.add("hidden");
  }
}

const app = new App();
