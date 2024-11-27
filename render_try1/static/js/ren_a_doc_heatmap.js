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

// Function to normalize ratio value between 0 and 1
function normalize(ratio, minRatio, maxRatio) {
    return (ratio - minRatio) / (maxRatio - minRatio);
}

// Function to define color based on ratio value
function getColor(ratio, minRatio, maxRatio) {
    const normalized = normalize(ratio, minRatio, maxRatio);
    if (normalized <= 0.2) return 'darkgreen';  
    if (normalized <= 0.4) return 'green';      
    if (normalized <= 0.6) return 'lightgreen'; 
    if (normalized <= 0.8) return 'yellow';    
    return 'red';  
}

// Function to plot points on the map
function plotPoints(data, minRatio, maxRatio) {
    data.forEach(point => {
        let lat = point.lat;
        let lng = point.lng;
        let ratio = point.ratio;

        // Create a circle marker with customized size and color
        L.circleMarker([lat, lng], {
            radius: 6,  // You can adjust the size of the marker
            color: getColor(ratio, minRatio, maxRatio),  // Color based on ratio
            fillColor: getColor(ratio, minRatio, maxRatio),  // Fill color
            fillOpacity: 0.7,  // Set the opacity to make the circles semi-transparent
            weight: 1  // Border weight
        }).addTo(map);
    });
}

// Add popup to display ratio on click
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

// Function to find the nearest point from the clicked location
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