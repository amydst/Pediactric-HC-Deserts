let map = L.map('map', {
    center: [36.7783, -119.4179],
    zoom: 6
});

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Initialize an empty array for points data
let pointsData = [];
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

            minRatio = Math.min(minRatio, ratio);
            maxRatio = Math.max(maxRatio, ratio);

            pointsData.push({ lat, lng, ratio });
        });

        plotPoints(pointsData, minRatio, maxRatio);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Normalize the ratio to a value between 0 and 1
function normalize(ratio, minRatio, maxRatio) {
    return (ratio - minRatio) / (maxRatio - minRatio);
}

// Function to generate a color scale using D3.js for smoother transitions
function getColor(ratio, minRatio, maxRatio) {
    const normalized = normalize(ratio, minRatio, maxRatio);

    // Generate a color scale from green (low) to red (high) with more smooth transitions
    const colorScale = d3.scaleLinear()
        .domain([0, 0.2, 0.4, 0.6, 0.8, 1])
        .range(["green", "lightgreen", "yellow", "orange", "red", "brown"]);

    return colorScale(normalized);
}

// Function to plot points on the map with color depending on ratio
function plotPoints(data, minRatio, maxRatio) {
    data.forEach(point => {
        let lat = point.lat;
        let lng = point.lng;
        let ratio = point.ratio;

        // Create a circle marker with customized size, transparency and smoother color transitions
        L.circleMarker([lat, lng], {
            radius: 15,  
            color: getColor(ratio, minRatio, maxRatio),  
            fillColor: getColor(ratio, minRatio, maxRatio),  
            fillOpacity: 0.4,  
            weight: 2,  
            opacity: 0.5  
        }).addTo(map);
    });
}

// Popup to display ratio on click
map.on('click', function(event) {
    let latLng = event.latlng;
    let nearestPoint = findNearestPoint(latLng, pointsData);
    if (nearestPoint) {
        let ratio = nearestPoint.ratio;
        let roundedRatio = Math.round(ratio);
        let popupContent = `Children to Doctor Ratio: ${roundedRatio}`;
        L.popup()
            .setLatLng(latLng)
            .setContent(popupContent)
            .openOn(map);
    }
});

// Find the nearest point from the clicked location
function findNearestPoint(latLng, data) {
    let closestPoint = null;
    let minDistance = Infinity;
    data.forEach(point => {
        let pointLatLng = L.latLng(point.lat, point.lng);
        let distance = latLng.distanceTo(pointLatLng);
        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = point;
        }
    });
    return closestPoint;
}