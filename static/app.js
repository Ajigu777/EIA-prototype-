document.addEventListener("DOMContentLoaded", () => {

  // MAP
  const map = L.map("map").setView([9.0765, 7.3986], 6);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  let marker;

  // DRAWING
  const drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  const drawControl = new L.Control.Draw({
    edit: { featureGroup: drawnItems },
    draw: {
      polygon: true,
      polyline: true,
      rectangle: true,
      marker: true,
      circle: false
    }
  });
  map.addControl(drawControl);

  map.on(L.Draw.Event.CREATED, e => {
    drawnItems.addLayer(e.layer);
  });

  // MAP CLICK
  map.on("click", e => {
    updateLocation(e.latlng.lat, e.latlng.lng);
  });

  async function updateLocation(lat, lng) {
    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);
    map.setView([lat, lng], 14);

    document.getElementById("latitude").value = lat.toFixed(5);
    document.getElementById("longitude").value = lng.toFixed(5);

    const res = await fetch("/calculate_impacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng })
    });

    const data = await res.json();

    updateImpacts(data);
  }

  function updateImpacts(data) {
    noiseRange.value = data.noise_pollution;
    waterRange.value = data.water_resource;
    bioRange.value = data.biodiversity_sensitivity;

    noiseLabel.innerText = data.noise_pollution + "%";
    waterLabel.innerText = data.water_resource + "%";
    bioLabel.innerText = data.biodiversity_sensitivity + "%";

    const avg = (data.noise_pollution + data.water_resource + data.biodiversity_sensitivity) / 3;
    const status = document.getElementById("screeningStatus");
    const text = document.getElementById("statusText");

    if (avg < 40) {
      status.className = "rounded-lg border bg-green-50 border-green-200 p-4";
      text.innerText = "Low Impact";
    } else if (avg < 70) {
      status.className = "rounded-lg border bg-yellow-50 border-yellow-200 p-4";
      text.innerText = "Moderate Impact";
    } else {
      status.className = "rounded-lg border bg-red-50 border-red-200 p-4";
      text.innerText = "High Impact";
    }
  }

  // GEOJSON UPLOAD
  const geojsonInput = document.getElementById("geojsonInput");
  if (geojsonInput) {
    geojsonInput.addEventListener("change", async e => {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("geojson", file);

      const res = await fetch("/upload_geojson", {
        method: "POST",
        body: formData
      });

      const result = await res.json();
      alert(result.message || result.error);
    });
  }

  // SEARCH
  window.goToLocation = async function () {
    const place = document.getElementById("locationInput").value;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${place}`);
    const data = await res.json();
    if (data.length) updateLocation(+data[0].lat, +data[0].lon);
  };

  window.goToCoordinates = function () {
    const lat = parseFloat(latitude.value);
    const lng = parseFloat(longitude.value);
    if (!isNaN(lat) && !isNaN(lng)) updateLocation(lat, lng);
  };

});
      
