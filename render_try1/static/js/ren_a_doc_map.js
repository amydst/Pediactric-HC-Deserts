let map = L.map('map', {
    center: [36.7783, -119.4179], // Coordinates for California
    zoom: 6
});

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create layer groups
let coverageLayer = L.layerGroup();
let heatmapLayer = L.layerGroup();

let pointsData = [];
let minRatio = Infinity;
let maxRatio = -Infinity;

// Fetch data from the API
fetch('/api/v1.0/locations')
    .then(response => response.json())
    .then(data => {
        data.forEach(location => {
            let lat = location.Latitude;
            let lng = location.Longitude;
            let ratio = location.Children_to_Doctor_Ratio;

            pointsData.push({ lat, lng, ratio });


            createCoverageCircle(location);
        });

        plotHeatmapPoints(pointsData, minRatio, maxRatio);

        // Add layers to the map
        coverageLayer.addTo(map);
        heatmapLayer.addTo(map);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Function to create coverage circles
function createCoverageCircle(location) {
    let coverageRate = location.Coverage_Rate;
    let color = getCoverageColor(coverageRate);
    L.circle([location.Latitude, location.Longitude], {
        color: color,
        fillColor: color,
        fillOpacity: 0.6,
        weight: 0,
        radius: getCoverageRadius(coverageRate)
    })
    .bindPopup('<b>Coverage Rate: ' + coverageRate.toFixed(2) + '%</b>')
    .addTo(coverageLayer);
}

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

// heatmap points
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

// Layer control for toggling
L.control.layers(null, {
    "Coverage Circles": coverageLayer,
    "Heatmap": heatmapLayer
}).addTo(map);

// Create heatmap legend
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

// Show legend when heatmap is active
heatmapLayer.on('add', function () {
    createHeatmapLegend().addTo(map);
});

// Remove legend when heatmap is removed
heatmapLayer.on('remove', function () {
    map.removeControl(createHeatmapLegend());
});