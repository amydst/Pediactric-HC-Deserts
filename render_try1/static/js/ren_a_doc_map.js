let map = L.map('map', {
    center: [36.7783, -119.4179],  // California coordinates
    zoom: 6
});

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create layer groups for the doctor ratio and coverage circles
let doctorRatioLayer = L.layerGroup().addTo(map);  // For heatmap (Doctor Ratio)
let coverageLayer = L.layerGroup().addTo(map);  // For Coverage Rate

// Create heatmap data array
let heatmapData = [];

// Layer control for toggling between doctor ratio heatmap and coverage rate
let overlays = {
    "Doctor Ratio Heatmap": L.heatLayer(heatmapData, {
        radius: 25,      
        blur: 15,        
        maxZoom: 17,     
        gradient: {      
            0.4: 'blue',
            0.6: 'lime',
            0.8: 'red'
        }
    }).addTo(doctorRatioLayer),  
    "Coverage Rate": coverageLayer,  
};

L.control.layers(null, overlays).addTo(map);

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

function getHeatmapIntensity(ratio) {
    return Math.min(ratio / 10000, 1);
}

// heatmap data based on children-to-doctor ratio
function createDoctorRatioHeatmap(location) {
    let ratio = location.Children_to_Doctor_Ratio;
    let lat = location.Latitude;
    let lng = location.Longitude;

   
    heatmapData.push([lat, lng, getHeatmapIntensity(ratio)]);
}

// Fetch data from the API
fetch('/api/v1.0/locations')
.then(response => response.json())
.then(data => {
    data.forEach(location => {
        createCoverageCircle(location);  // Create coverage rate circle
        createDoctorRatioHeatmap(location);  // Add data point for doctor ratio heatmap
    });


    overlays["Doctor Ratio Heatmap"].setLatLngs(heatmapData);
})
.catch(error => {
    console.error('Error fetching data:', error);
});