let map = L.map('map', {
  center: [36.7783, -119.4179],  // Center of California
  zoom: 6  // Zoom level for California view
});

// Add OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create a layer group for doctor markers
let doctorLayer = L.layerGroup().addTo(map);  // Create an empty layer that will hold the markers

// Add the doctor layer to the map layer control, so it can be toggled on and off
let overlays = {
  "Doctors": doctorLayer
};

L.control.layers(null, overlays).addTo(map);  // Add the layer control to the map

// Fetch data from the Flask API
fetch('http://127.0.0.1:5000/api/v1.0/locations')  // URL of the Flask API
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})
.then(data => {
  console.log('Data from API:', data);  // Log the data to check what exactly the API returns

  // Loop through the data and add markers to the layer
  data.forEach(location => {
    console.log(location);  // Log each location object to verify that it contains the correct values

    // Marker color - blue
    let markerColor = 'blue';

    // Marker size based on the number of licensees (license count divided by 2, with a maximum size of 20)
    let radius = Math.min(location.Count_of_Licensees / 2, 20);

    // Create the marker
    L.circleMarker([location.Latitude, location.Longitude], {
      radius: radius,  // Marker size
      fillColor: markerColor,
      color: markerColor,
      weight: 1,
      opacity: 1,
      fillOpacity: 0.6
    })
    .bindPopup(`<b>Pediatricians Count: ${location.Count_of_Licensees}</b>`) // Show the number of licensees in the popup
    .addTo(doctorLayer);  // Add the marker to the doctor layer
  });
})
.catch(error => {
  console.error('Error fetching data:', error);  // Log any errors if the fetch fails
});
