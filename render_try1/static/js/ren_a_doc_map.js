function createDoctorIcon() {
    return L.divIcon({
        className: 'doctor-icon',
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="30" height="30">
                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-96 55.2C54 332.9 0 401.3 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7c0-81-54-149.4-128-171.1l0 50.8c27.6 7.1 48 32.2 48 62l0 40c0 8.8-7.2 16-16 16l-16 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l0-24c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 24c8.8 0 16 7.2 16 16s-7.2 16-16 16l-16 0c-8.8 0-16-7.2-16-16l0-40c0-29.8 20.4-54.9 48-62l0-57.1c-6-.6-12.1-.9-18.3-.9l-91.4 0c-6.2 0-12.3 .3-18.3 .9l0 65.4c23.1 6.9 40 28.3 40 53.7c0 30.9-25.1 56-56 56s-56-25.1-56-56c0-25.4 16.9-46.8 40-53.7l0-59.1zM144 448a24 24 0 1 0 0-48 24 24 0 1 0 0 48z" 
                fill="#1E90FF" stroke="#000000" stroke-width="5"/>
              </svg>`,
        iconSize: [30, 30],  // Icon size
        iconAnchor: [15, 30],  // Anchor point of the icon
        popupAnchor: [0, -30]  // Popup offset
    });
}

// Initialize the map centered on California
let map = L.map('map', {
    center: [36.7783, -119.4179],  // Coordinates for California
    zoom: 6  // Initial zoom level
});

// Add OpenStreetMap tiles to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create layer groups: one for doctor markers and one for coverage circles
let doctorCluster = L.markerClusterGroup();  // Correct method call here
let coverageLayer = L.layerGroup().addTo(map);

// Layer control to toggle between doctor markers and coverage circles
let overlays = {
    "Doctors": doctorCluster,
    "Coverage Rate": coverageLayer
};
L.control.layers(null, overlays).addTo(map);

// Function to determine the color of the coverage circle based on the coverage rate
function getColor(coverageRate) {
    if (coverageRate > 90) return '#006400';  // Dark green
    if (coverageRate > 80) return '#FFD700';  // Gold
    if (coverageRate > 70) return '#FF8C00';  // Orange
    if (coverageRate > 60) return '#FF4500';  // Dark orange
    if (coverageRate > 50) return '#FF0000';  // Red
    return '#B22222';  // Firebrick red
}

// Function to calculate the radius of the coverage circle based on the coverage rate
function getRadius(coverageRate) {
    return Math.max(2000, 3000 - coverageRate * 10); // Adjust radius based on coverage rate
}

// Function to create the coverage circle on the map
function createCoverageCircle(location) {
    let coverageRate = location.Coverage_Rate;  // Get the coverage rate from the location data

    L.circle([location.Latitude, location.Longitude], {
        color: getColor(coverageRate),  // Set the border color based on coverage rate
        fillColor: getColor(coverageRate),  // Set the fill color based on coverage rate
        fillOpacity: 0.6,  // Set the opacity of the circle
        weight: 0,  // Set the border weight to 0 (no visible border)
        radius: getRadius(coverageRate)  // Set the radius based on coverage rate
    })
    .bindPopup('<b>Coverage Rate: ' + coverageRate.toFixed(2) + '%</b>')  // Popup with the coverage rate
    .addTo(coverageLayer);  // Add the circle to the coverage layer
}

// Fetch location data from the API
fetch('/api/v1.0/locations')  // Ensure this API endpoint is correct
.then(response => response.json())
.then(data => {
    data.forEach(location => {
        // Only create a doctor marker if there is a positive number of doctors
        let countOfDoctors = location.Count_of_Licensees || 0;

        if (countOfDoctors > 0) {
            // Create a marker for the doctor at the given latitude and longitude
            L.marker([location.Latitude, location.Longitude], {
                icon: createDoctorIcon()  // Use the custom doctor icon
            })
            .bindPopup('<b>Doctors Count: ' + countOfDoctors + '</b>')  // Popup with the number of doctors
            .addTo(doctorCluster);  // Add the doctor marker to the doctor cluster
        }

        // Create the coverage circle for each location
        createCoverageCircle(location);
    });
})
.catch(error => {
    console.error('Error fetching data:', error);
});