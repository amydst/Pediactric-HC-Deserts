let map = L.map('map', {
    center: [36.7783, -119.4179],
    zoom: 6
});

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Prepare heatmap data for doctor ratio
let heatmapData = [];


function getHeatmapIntensity(ratio) {
    return Math.min(ratio / 10000, 1);  // Normalize ratio to a max of 1
}


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
    // Add data points for the heatmap
    data.forEach(location => {
        createDoctorRatioHeatmap(location);  
    });

    
    let heat = L.heatLayer(heatmapData, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        gradient: {
            0.4: 'blue',
            0.6: 'lime',
            0.8: 'red'
        }
    }).addTo(map);
})
.catch(error => {
    console.error('Error fetching data:', error);
});