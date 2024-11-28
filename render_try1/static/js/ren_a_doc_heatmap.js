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


function getColor(ratio, minRatio, maxRatio) {
    const normalized = normalize(ratio, minRatio, maxRatio);

    const colorScale = d3.scaleLinear()
        .domain([0, 0.2, 0.4, 0.6, 0.8, 1])
        .range(["green", "lightgreen", "yellow", "orange", "red", "brown"]);

    return colorScale(normalized);
}

// Plot points on the map with color depending on ratio
function plotPoints(data, minRatio, maxRatio) {
    data.forEach(point => {
        let lat = point.lat;
        let lng = point.lng;
        let ratio = point.ratio;

       
        let circleMarker = L.circleMarker([lat, lng], {
            radius: 18,  
            color: getColor(ratio, minRatio, maxRatio),  
            fillColor: getColor(ratio, minRatio, maxRatio),  
            fillOpacity: 0.3,
            weight: 4,  
            opacity: 0.1  
        }).addTo(map);

        // Add display data when clicked on the circle
        circleMarker.on('click', function () {
            let roundedRatio = Math.round(ratio);
            let popupContent = `Children per Doctor: ${roundedRatio}`;
            L.popup()
                .setLatLng([lat, lng])
                .setContent(popupContent)
                .openOn(map);
        });
    });
}