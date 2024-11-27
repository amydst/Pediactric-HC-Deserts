let map = L.map('map', {
    center: [36.7783, -119.4179], // Coordinates for California
    zoom: 6
});

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create a layer group for coverage circles (this allows us to toggle the layer on/off)
let coverageLayer = L.layerGroup();  // For Coverage Rate

// Initialize an empty array for heatmap points data
let pointsData = [];
let minRatio = Infinity;
let maxRatio = -Infinity;

// Create a layer group for heatmap (this allows us to toggle the layer on/off)
let heatmapLayer = L.layerGroup();

// Fetch data from the API for both coverage and heatmap layers
fetch('/api/v1.0/locations')
    .then(response => response.json())
    .then(data => {
        data.forEach(location => {
            // Coverage Layer
            createCoverageCircle(location);

            // Heatmap Layer
            let lat = location.Latitude;
            let lng = location.Longitude;
            let ratio = location.Children_to_Doctor_Ratio;

            minRatio = Math.min(minRatio, ratio);
            maxRatio = Math.max(maxRatio, ratio);

            pointsData.push({ lat, lng, ratio });
        });

        
        plotHeatmapPoints(pointsData, minRatio, maxRatio);

        // Add layers to the map
        coverageLayer.addTo(map);
        heatmapLayer.addTo(map);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Function to get the radius based on coverage rate
function getCoverageRadius(coverageRate) {
    return Math.max(1000, 2000 - coverageRate * 5);
}

// Function to get the color based on coverage rate
function getCoverageColor(coverageRate) {
    if (coverageRate > 90) return '#0000FF';  // Blue
    if (coverageRate > 70) return '#FFFF00';  // Yellow
    if (coverageRate > 50) return '#FF0000';  // Red
    return '#800000';  // Dark Red
}

// Function to create a circle marker for coverage
function createCoverageCircle(location) {
    let coverageRate = location.Coverage_Rate;
    L.circle([location.Latitude, location.Longitude], {
        color: getCoverageColor(coverageRate),
        fillColor: getCoverageColor(coverageRate),
        fillOpacity: 0.6,
        weight: 0,
        radius: getCoverageRadius(coverageRate) // Using the adjusted radius
    })
    .bindPopup('<b>Coverage Rate: ' + coverageRate.toFixed(2) + '%</b>')
    .addTo(coverageLayer); // Add to the coverage layer
}

// Normalize the ratio for heatmap points
function normalize(ratio, minRatio, maxRatio) {
    return (ratio - minRatio) / (maxRatio - minRatio);
}


function getHeatmapColor(ratio, minRatio, maxRatio) {
    const normalized = normalize(ratio, minRatio, maxRatio);

  
    const colorScale = d3.scaleLinear()
        .domain([0, 0.2, 0.4, 0.6, 0.8, 1])
        .range(["green", "lightgreen", "yellow", "orange", "red", "brown"]);

    return colorScale(normalized);
}

function plotHeatmapPoints(data, minRatio, maxRatio) {
    data.forEach(point => {
        let lat = point.lat;
        let lng = point.lng;
        let ratio = point.ratio;

        
        L.circleMarker([lat, lng], {
            radius: 18,  
            color: getHeatmapColor(ratio, minRatio, maxRatio),  
            fillColor: getHeatmapColor(ratio, minRatio, maxRatio),  
            fillOpacity: 0.3,
            weight: 4,  
            opacity: 0.1  
        }).addTo(heatmapLayer);
    });
}

// Layer control (for toggling layers on/off)
L.control.layers(null, {
    "Coverage Circles": coverageLayer, 
    "Heatmap": heatmapLayer // Add the heatmap layer to the toggle control
}).addTo(map);

// Create a legend for the heatmap
function createHeatmapLegend() {
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend');
        const grades = [0, 0.2, 0.4, 0.6, 0.8, 1];
        const labels = ['green', 'lightgreen', 'yellow', 'orange', 'red', 'brown'];

        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getHeatmapColor(grades[i], 0, 1) + '"></i> ' +
                grades[i] * 100 + '%<br>';
        }

        return div;
    };

    return legend;
}

//legend when the heatmap layer is active
heatmapLayer.on('add', function () {
    createHeatmapLegend().addTo(map);
});

//legend when the heatmap layer is removed
heatmapLayer.on('remove', function () {
    map.removeControl(createHeatmapLegend());
});
