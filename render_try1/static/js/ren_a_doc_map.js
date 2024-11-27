// Create the map object
let map = L.map('map', {
    center: [36.7783, -119.4179], // Coordinates for California
    zoom: 6
});

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create a layer group for coverage circles (this allows us to toggle the layer on/off)
let coverageLayer = L.layerGroup();  // For Coverage Rate


function getCoverageRadius(coverageRate) {
    
    return Math.max(1000, 2000 - coverageRate * 5); 
}

// Color circles based on coverage rate
function getCoverageColor(coverageRate) {
    if (coverageRate > 90) return '#0000FF';  // Blue
    if (coverageRate > 70) return '#FFFF00';  // Yellow
    if (coverageRate > 50) return '#FF0000';  // Red
    return '#800000';  // Dark Red 
}

// Create a circle for each location based on coverage rate
function createCoverageCircle(location) {
    let coverageRate = location.Coverage_Rate;
    L.circle([location.Latitude, location.Longitude], {
        color: getCoverageColor(coverageRate),
        fillColor: getCoverageColor(coverageRate),
        fillOpacity: 0.6,
        weight: 0,
        radius: getCoverageRadius(coverageRate) // Using the adjusted radius
    })
    .bindPopup('<b>Coverage Rate: ' + coverageRate.toFixed(2) + '%</b>')
    .addTo(coverageLayer); // Add to the coverage layer
}

// Fetch data from the API
fetch('/api/v1.0/locations')
.then(response => response.json())
.then(data => {
    
    data.forEach(location => {
        createCoverageCircle(location);  
    });

    
    coverageLayer.addTo(map);
})
.catch(error => {
    console.error('Error fetching data:', error);
});

// Add a layer control to toggle coverage circles on/off
L.control.layers(null, {
    "Coverage Circles": coverageLayer // Add the coverage layer to the toggle control
}).addTo(map);