"use strict";

const form = document.querySelector(".form");
const inputRestaurant = document.querySelector(".form__input--restaurant");

let map, mapEvent;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const { latitude } = position.coords;
      const { longitude } = position.coords;

      const coords = [latitude, longitude];
      console.log(coords);

      map = L.map("map").setView(coords, 13);

      L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on("click", function (mapE) {
        form.classList.remove("hidden");
        mapEvent = mapE;
      });
    },
    function () {
      alert("Unable to get your location");
    }
  );

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const { lat, lng } = mapEvent.latlng;

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(
        L.popup({
          minWidth: 100,
          maxWidth: 200,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent("Food spot")
      .openPopup();
  });
}
