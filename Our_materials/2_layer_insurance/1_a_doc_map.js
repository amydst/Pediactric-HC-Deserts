function createDoctorIcon() {
    return L.divIcon({
        className: 'doctor-icon',  // Custom icon class for the doctor icon
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="30" height="30">
                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-96 55.2C54 332.9 0 401.3 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7c0-81-54-149.4-128-171.1l0 50.8c27.6 7.1 48 32.2 48 62l0 40c0 8.8-7.2 16-16 16l-16 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l0-24c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 24c8.8 0 16 7.2 16 16s-7.2 16-16 16l-16 0c-8.8 0-16-7.2-16-16l0-40c0-29.8 20.4-54.9 48-62l0-57.1c-6-.6-12.1-.9-18.3-.9l-91.4 0c-6.2 0-12.3 .3-18.3 .9l0 65.4c23.1 6.9 40 28.3 40 53.7c0 30.9-25.1 56-56 56s-56-25.1-56-56c0-25.4 16.9-46.8 40-53.7l0-59.1zM144 448a24 24 0 1 0 0-48 24 24 0 1 0 0 48z" 
                fill="#1E90FF" stroke="#000000" stroke-width="5"/>
              </svg>`,
        iconSize: [30, 30],  // Icon size (30x30 px)
        iconAnchor: [15, 30],  // Anchor point for positioning
        popupAnchor: [0, -30]  // Position for the popup
    });
}

// Create the map centered on California
let map = L.map('map', {
    center: [36.7783, -119.4179],  // California coordinates
    zoom: 6  // Default zoom level
});

// Add OpenStreetMap tiles to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Layer groups for doctors and coverage circles
let doctorCluster = L.markerClusterGroup();  // Group for doctor markers
let coverageLayer = L.layerGroup().addTo(map);  // Layer for coverage circles

// Layer control to toggle between doctors and coverage circles
let overlays = {
    "Doctors": doctorCluster,
    "Coverage Rate": coverageLayer
};
L.control.layers(null, overlays).addTo(map);

// Get color based on coverage rate
function getColor(coverageRate) {
    if (coverageRate > 90) return '#006400';  // Dark green
    if (coverageRate > 80) return '#FFD700';  // Gold
    if (coverageRate > 70) return '#FF8C00';  // Orange
    if (coverageRate > 60) return '#FF4500';  // Dark orange
    if (coverageRate > 50) return '#FF0000';  // Red
    if (coverageRate > 40) return '#B22222';  // Firebrick red
    if (coverageRate > 30) return '#8B0000';  // Dark red
    if (coverageRate > 20) return '#800000';  // Maroon
    return '#550000';  // Very dark red
}

// Calculate circle radius based on coverage rate
function getRadius(coverageRate) {
    return Math.max(2000, 3000 - coverageRate * 10);  // Adjust radius size
}

// Create coverage circle based on location data
function createCoverageCircle(location) {
    let coverageRate = location.Coverage_Rate;  // Get the coverage rate

    // Create a circle with adjusted color and radius based on coverage rate
    L.circle([location.Latitude, location.Longitude], {
        color: getColor(coverageRate),  
        fillColor: getColor(coverageRate),
        fillOpacity: 0.6,  // Slightly transparent fill
        weight: 0,  // No border
        radius: getRadius(coverageRate)  // Dynamic radius
    })
    .bindPopup(`<b>Coverage Rate: ${coverageRate.toFixed(2)}%</b>`)  // Popup showing coverage rate
    .addTo(coverageLayer);  // Add to the coverage layer
}

// Fetch location data from the server
fetch('http://127.0.0.1:5000/api/v1.0/locations')
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
})
.then(data => {
    console.log('Data from API:', data);  // Debug: log data

    // Loop through each location to add markers and coverage circles
    data.forEach(location => {
        let countOfDoctors = location.Count_of_Licensees || 0;  // Default to 0 if no data

        // If doctors exist, add a marker
        if (countOfDoctors > 0) {
            L.marker([location.Latitude, location.Longitude], {
                icon: createDoctorIcon()  // Custom icon for doctors
            })
            .bindPopup(`<b>Doctors Count: ${countOfDoctors}</b>`, {
                className: 'doctor-popup'  // Style for doctor popup
            })
            .addTo(doctorCluster);  // Add to the doctor marker cluster
        }

        // Create coverage circles for each location
        createCoverageCircle(location);  // Function to create circle based on coverage
    });
})
.catch(error => {
    console.error('Error fetching data:', error);  // Catch any fetch errors
});