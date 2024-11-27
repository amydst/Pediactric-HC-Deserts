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
    // Define a more granular gradient with 12 shades
    let gradient = {
        0.0: 'darkgreen',    // Very low ratio (few children per doctor)
        0.08: 'green',       // Low ratio
        0.16: 'lightgreen',  // Low-medium ratio
        0.24: 'yellowgreen', // Medium-low ratio
        0.32: 'yellow',      // Medium ratio
        0.40: 'lightyellow', // Medium-high ratio
        0.48: 'orange',      // High ratio
        0.56: 'darkorange',  // Higher ratio
        0.64: 'red',         // Very high ratio
        0.72: 'darkred',     // Extremely high ratio
        0.80: 'brown',       // Highest ratio
        1.0: 'black'         // Maximal ratio
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
        
        // Define the grades and colors for the legend
        let grades = [minRatio, (maxRatio - minRatio) * 0.08, (maxRatio - minRatio) * 0.16, (maxRatio - minRatio) * 0.24, (maxRatio - minRatio) * 0.32, (maxRatio - minRatio) * 0.40, 
                      (maxRatio - minRatio) * 0.48, (maxRatio - minRatio) * 0.56, (maxRatio - minRatio) * 0.64, (maxRatio - minRatio) * 0.72, (maxRatio - minRatio) * 0.80, maxRatio];
        let labels = [];
        let colors = ['darkgreen', 'green', 'lightgreen', 'yellowgreen', 'yellow', 'lightyellow', 'orange', 'darkorange', 'red', 'darkred', 'brown', 'black'];

        // Generate the labels with a colored box for each range
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