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
let minRatio = Infinity;
let maxRatio = -Infinity;

// Fetch the data from the API
fetch('/api/v1.0/locations')
    .then(response => response.json())
    .then(data => {
        data.forEach(location => {
            let lat = location.Latitude;
            let lng = location.Longitude;
            let ratio = location.Children_to_Doctor_Ratio;

            console.log('Ratio:', ratio);

            // Track the min/max ratios to adjust the color scale
            minRatio = Math.min(minRatio, ratio);
            maxRatio = Math.max(maxRatio, ratio);

            // Push the data into heatmapData array
            heatmapData.push([lat, lng, ratio]);
        });

        // Create the heatmap layer with the dynamic color scale
        createHeatmap(heatmapData, minRatio, maxRatio);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Function to create the heatmap using leaflet-heat:
function createHeatmap(data, minRatio, maxRatio) {
    // Define the custom gradient based on your manual ranges
    let gradient = {
        0.0: 'darkgreen',    // Very low ratio
        0.10: 'green',       // Low ratio
        0.20: 'lightgreen',  // Medium-low ratio
        0.30: 'yellowgreen', // Medium ratio
        0.40: 'yellow',      // Medium-high ratio
        0.50: 'orange',      // High ratio
        0.60: 'red',         // Very high ratio
        0.70: 'darkred',     // Extremely high ratio
        1.0: 'brown'         // Maximal ratio
    };

    // Create the heatmap layer based on the ratio values
    let heatLayer = L.heatLayer(data.map(point => {
        let lat = point[0];
        let lng = point[1];
        let ratio = point[2];

        // Normalize ratio between 0 and 1 for the gradient
        let normalizedRatio = (ratio - minRatio) / (maxRatio - minRatio);

        // Push normalized data to heatmap layer
        return [lat, lng, normalizedRatio];
    }), {
        radius: 25,        
        blur: 20,          
        maxZoom: 13,
        gradient: gradient // Apply the gradient to control color
    }).addTo(map);

    // Handle click events on the map to show ratio
    map.on('click', function(event) {
        let latLng = event.latlng;
        let nearestPoint = findNearestPoint(latLng, data);
        if (nearestPoint) {
            let ratio = nearestPoint[2]; 
            // Round the ratio to the nearest whole number
            let roundedRatio = Math.round(ratio);
            let popupContent = `Children to Doctor Ratio: ${roundedRatio}`;
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