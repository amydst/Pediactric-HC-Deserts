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

// Create the heatmap using leaflet-heat:
function createHeatmap(data, minRatio, maxRatio) {
    
    let gradient = {
        0.0: 'green',      // Low ratio (fewer children per doctor)
        0.2: 'light green',     // Slightly higher ratio
        0.5: 'yellow',     // Medium ratio
        0.8: 'orange',        // High ratio (many children per doctor)
        1.0: 'red'     // Very high ratio
    };

    // Create heatmap layer
    let heatLayer = L.heatLayer(data, {
        radius: 25,        
        blur: 20,          
        maxZoom: 13,      
        gradient: gradient 
    }).addTo(map);

    // Interactivity 
    heatLayer.on('click', function(event) {
        let latLng = event.latlng;
        let nearestPoint = findNearestPoint(latLng, data);
        if (nearestPoint) {
            let ratio = nearestPoint[2]; 
            let popupContent = `Children to Doctor Ratio: ${ratio}`;
            L.popup()
                .setLatLng(latLng)
                .setContent(popupContent)
                .openOn(map);
        }
    });

    // Add a legend
    addLegend(minRatio, maxRatio);
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

// Function to add a legend to the map
function addLegend(minRatio, maxRatio) {
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function(map) {
        let div = L.DomUtil.create('div', 'info legend');
        let grades = [minRatio, (maxRatio - minRatio) * 0.2, (maxRatio - minRatio) * 0.5, (maxRatio - minRatio) * 0.8, maxRatio];
        let labels = [];
        let colors = ['green', 'yellow', 'orange', 'red', 'darkred'];

        // Go through each range and make a label with a colored box for each range
        for (let i = 0; i < grades.length; i++) {
            labels.push(
                '<i style="background:' + colors[i] + '"></i> ' +
                Math.round(grades[i]) + ' - ' + Math.round(grades[i + 1] || maxRatio)
            );
        }

        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(map);
}