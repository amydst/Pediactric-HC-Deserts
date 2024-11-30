let map = L.map('map', {            
    center: [36.7783, -119.4179],  // Lat, Lon for California
    zoom: 6
});

// Adding OpenStreetMap:
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Making empty group for layers:
let coverageLayer = L.layerGroup();  

// Making circles - size depends on coverage rate, but not smaller than 1000
function getCoverageRadius(coverageRate) {
    return Math.max(1000, 4000 - coverageRate * 7);
}

// Making color depends on coverage rate:
function getCoverageColor(coverageRate) {
    if (coverageRate > 90) return '#FFB6C1';  // Light pink
    if (coverageRate > 70) return '#FF69B4';  // Pink
    if (coverageRate > 50) return '#C71585';  // Dark pink
    return '#000000';  // Black
}

// Making circle for each location based on lon and lan and coverage rate and set the color of the circles:
function createCoverageCircle(location) {
    let coverageRate = location.Coverage_Rate;
    L.circle([location.Latitude, location.Longitude], {
        color: getCoverageColor(coverageRate),
        fillColor: getCoverageColor(coverageRate),
        fillOpacity: 0.7,  
        weight: 0,  
        radius: getCoverageRadius(coverageRate)  
    })
    .bindPopup('<b>Coverage Rate: ' + coverageRate.toFixed(2) + '%</b>')  //toFixed round the number to .00
    .addTo(coverageLayer);  // Adding circle to layer
}

// taking datas form API:
fetch('/api/v1.0/locations')
    .then(response => response.json())
    .then(data => {
        data.forEach(location => {
            createCoverageCircle(location);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Making 2 layer Children to doctor:
let doctorRatioLayer = L.layerGroup();  // Creating empty group 

// Normalize ratio (0-1)
function normalize(ratio, minRatio, maxRatio) {
    return (ratio - minRatio) / (maxRatio - minRatio);
}

// Assigning color based on ratio to spots: 
function getDoctorRatioColor(ratio, minRatio, maxRatio) {
    const normalized = normalize(ratio, minRatio, maxRatio);

    const colorScale = d3.scaleLinear()
        .domain([0, 0.2, 0.4, 0.6, 0.8, 1])  //normalized values
        .range(["green", "lightgreen", "yellow", "orange", "red", "brown"]); //color based on this normalized values

    return colorScale(normalized);
}

// Making circles for Children - Doctor-Ratio
function createDoctorRatioCircle(location, minRatio, maxRatio) {
    let ratio = location.Children_to_Doctor_Ratio;
    let lat = location.Latitude;
    let lng = location.Longitude;

    L.circle([lat, lng], {
        radius: 6000,  // Size of the circle
        color: getDoctorRatioColor(ratio, minRatio, maxRatio),
        fillColor: getDoctorRatioColor(ratio, minRatio, maxRatio),
        fillOpacity: 0.6,  
        weight: 4,  
        opacity: 0.1 
    })
    .bindPopup('<b>Children per Doctor Ratio: ' + Math.round(ratio) + '</b>')
    .addTo(doctorRatioLayer);  // Adding circle to layer
}

// Taking datas form Api and creating layer:
fetch('/api/v1.0/locations')
    .then(response => response.json())
    .then(data => {
        let pointsData = [];
        let minRatio = Infinity;
        let maxRatio = -Infinity;

        data.forEach(location => {
            let ratio = location.Children_to_Doctor_Ratio;
            minRatio = Math.min(minRatio, ratio);
            maxRatio = Math.max(maxRatio, ratio);

            pointsData.push(location);
        });

        pointsData.forEach(location => {
            createDoctorRatioCircle(location, minRatio, maxRatio);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Control panel to turn on/ off layers: 
L.control.layers(null, {
    "Percentage of insured children": coverageLayer,
    "Children per doctor": doctorRatioLayer
}).addTo(map);