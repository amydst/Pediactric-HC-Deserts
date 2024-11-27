let map = L.map('map', {
    center: [36.7783, -119.4179],
    zoom: 6
});

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create layer group for coverage circles
let coverageLayer = L.layerGroup();  // For Coverage Rate

// Color circles based on coverage rate
function getCoverageColor(coverageRate) {
    if (coverageRate > 90) return '#006400';  // Dark green
    if (coverageRate > 80) return '#FFD700';  // Gold
    if (coverageRate > 70) return '#FF8C00';  // Orange
    if (coverageRate > 60) return '#FF4500';  // Dark orange
    if (coverageRate > 50) return '#FF0000';  // Red
    return '#B22222';  // Firebrick red
}

// Calculate circle size based on coverage rate
function getCoverageRadius(coverageRate) {
    return Math.max(2000, 3000 - coverageRate * 10); // Adjust radius based on coverage rate
}

// Create coverage rate circle
function createCoverageCircle(location) {
    let coverageRate = location.Coverage_Rate;
    L.circle([location.Latitude, location.Longitude], {
        color: getCoverageColor(coverageRate),
        fillColor: getCoverageColor(coverageRate),
        fillOpacity: 0.6,
        weight: 0,
        radius: getCoverageRadius(coverageRate)
    })
    .bindPopup('<b>Coverage Rate: ' + coverageRate.toFixed(2) + '%</b>')
    .addTo(coverageLayer);
}

// Fetch data from the API
fetch('/api/v1.0/locations')
.then(response => response.json())
.then(data => {
    // Create coverage circles for each location
    data.forEach(location => {
        createCoverageCircle(location);  // Create coverage rate circle
    });

    // Add the coverage circles to the map
    coverageLayer.addTo(map);
})
.catch(error => {
    console.error('Error fetching data:', error);
});