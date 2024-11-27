let map = L.map('map', {
    center: [36.7783, -119.4179],
    zoom: 6
});

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Initialize an empty array for heatmap data
let heatmapData = [];

// Fetch the data from the API
fetch('/api/v1.0/locations')
    .then(response => response.json())
    .then(data => {
        data.forEach(location => {
            let lat = location.Latitude;
            let lng = location.Longitude;
            let ratio = location.Children_to_Doctor_Ratio;

            // Push the data into heatmapData array, format is [latitude, longitude, intensity]
            heatmapData.push([lat, lng, ratio]);
        });

        // Create the heatmap layer and add it to the map
        createHeatmap(heatmapData);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Function to create the heatmap using leaflet-heat
function createHeatmap(data) {
    // Create heatmap layer
    let heatLayer = L.heatLayer(data, {
        radius: 25, 
        blur: 15,  
        maxZoom: 13, 
        gradient: {
            0.0: 'green',   // Low ratio (children per doctor) - green
            0.5: 'yellow',  // Mid ratio - yellow
            1.0: 'red'      // High ratio (many children per doctor) - red
        }
    }).addTo(map);

    // Add interactivity (click event) on the heatmap
    heatLayer.on('click', function(event) {
        let latLng = event.latlng;
        let nearestPoint = findNearestPoint(latLng, data);
        if (nearestPoint) {
            let ratio = nearestPoint[2];  // Children-to-doctor ratio
            let popupContent = `Children to Doctor Ratio: ${ratio}`;
            L.popup()
                .setLatLng(latLng)
                .setContent(popupContent)
                .openOn(map);
        }
    });
}

// Function to find the nearest heatmap point to the clicked point
function findNearestPoint(latLng, data) {
    let closestPoint = null;
    let minDistance = Infinity;
    data.forEach(point => {
        let pointLatLng = L.latLng(point[0], point[1]);
        let distance = latLng.distanceTo(pointLatLng);
        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
        }
    });
    return closestPoint;
}