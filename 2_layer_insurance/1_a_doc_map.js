let map = L.map('map', {
    center: [36.7783, -119.4179],  // Center of California
    zoom: 6  // Zoom level for California view
});

// Add OpenStreetMap tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create layer groups for different layers
let doctorLayer = L.layerGroup().addTo(map);  // Layer for doctors
let coverageLayer = L.layerGroup().addTo(map);  // Layer for coverage rate

// Add the layers to the map control so they can be toggled
let overlays = {
    "Doctors": doctorLayer,
    "Coverage Rate": coverageLayer
};

L.control.layers(null, overlays).addTo(map);  // Add layer control to the map

// Function to determine color based on coverage rate
function getColor(coverageRate) {
    return coverageRate > 90 ? '#006400' :  // Dark green for > 90%
           coverageRate > 80 ? '#228B22' :  // Green for > 80%
           coverageRate > 70 ? '#32CD32' :  // Lime green for > 70%
           coverageRate > 60 ? '#98FB98' :  // Pale green for > 60%
           coverageRate > 50 ? '#FFFF00' :  // Yellow for > 50%
           coverageRate > 40 ? '#FFD700' :  // Gold for > 40%
           coverageRate > 30 ? '#FF8C00' :  // Dark orange for > 30%
           coverageRate > 20 ? '#FF4500' :  // Orange red for > 20%
           '#B22222';                     // Dark red for <= 20%
}

// Function to calculate circle radius based on coverage rate
// In this case, larger radius means lower coverage rate
function getRadius(coverageRate) {
    return Math.max(500, 1000 - coverageRate * 10);  // Min radius is 500, max is 1000 meters
}

// Fetch data from the Flask API
fetch('http://127.0.0.1:5000/api/v1.0/locations')
.then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
})
.then(data => {
    console.log('Data from API:', data);  // Log the data to check what exactly the API returns

    // Loop through the data and add markers to the doctor layer
    data.forEach(location => {
        // Calculate the marker size for pediatricians based on the count of licensees
        // But we'll keep it small by limiting the maximum size
        let radius = Math.min(location.Count_of_Licensees / 5, 10);  // Smaller size (max radius = 10)

        // Add doctor markers to the doctor layer, using small circle markers
        L.circleMarker([location.Latitude, location.Longitude], {
            radius: radius,  // Smaller radius for doctors
            fillColor: 'blue',
            color: 'blue',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6  // Semi-transparent fill
        })
        .bindPopup(`<b>Pediatricians Count: ${location.Count_of_Licensees}</b>`)
        .addTo(doctorLayer);  // Add the marker to the doctor layer

        // Add coverage rate circles to the coverage layer
        let coverageRate = location.Coverage_Rate;  // Assuming coverage_rate is in percentage

        // Add circles with radius depending on coverage rate
        L.circle([location.Latitude, location.Longitude], {
            color: getColor(coverageRate),
            fillColor: getColor(coverageRate),
            fillOpacity: 0.3,  // More transparent for better visibility of underlying data
            radius: getRadius(coverageRate)  // Set radius based on coverage rate
        })
        .bindPopup(`<b>Coverage Rate: ${coverageRate}%</b>`)
        .addTo(coverageLayer);  // Add the circle to the coverage layer
    });
})
.catch(error => {
    console.error('Error fetching data:', error);
});