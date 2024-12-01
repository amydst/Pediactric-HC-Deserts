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
let doctorRatioLayer = L.layerGroup();  
let combinedLayer = L.layerGroup();  // This is the new combined layer for population density and doctor ratio

// Function to create the custom triangle marker for coverageRate
function getCoverageMarker(coverageRate) {
    const size = Math.max(10, 30 - coverageRate / 2);  // Smaller size based on coverage rate

    // Creating a triangle icon using HTML and CSS
    const triangleIcon = L.divIcon({
        className: 'coverage-triangle',  // Custom class
        html: `<div style="width: 0; height: 0; border-left: ${size}px solid transparent; border-right: ${size}px solid transparent; border-bottom: ${size * 1.5}px solid ${getCoverageColor(coverageRate)};"></div>`,
        iconSize: [size * 2, size * 1.5]  // Width and height based on size of triangle
    });

    return triangleIcon;
}

// Making color depends on coverage rate:
function getCoverageColor(coverageRate) {
    if (coverageRate > 90) return '#FFB6C1';  // Light pink
    if (coverageRate > 70) return '#FF69B4';  // Pink
    if (coverageRate > 50) return '#C71585';  // Dark pink
    return '#000000';  // Black
}

// Creating triangle for each location based on lat, lon, and coverage rate
function createCoverageTriangle(location) {
    let coverageRate = location.Coverage_Rate;
    let coverageMarker = getCoverageMarker(coverageRate);

    L.marker([location.Latitude, location.Longitude], {
        icon: coverageMarker  // Use the custom triangle icon
    })
    .bindPopup('<b>Coverage Rate: ' + coverageRate.toFixed(2) + '%</b>')  // Showing coverage rate in the popup
    .addTo(coverageLayer);  // Adding the marker to the coverage layer
}

// Fetching data from the API and creating markers for coverage
fetch('/api/v1.0/locations')
    .then(response => response.json())
    .then(data => {
        data.forEach(location => {
            createCoverageTriangle(location);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Function to normalize ratio (0-1)
function normalize(ratio, minRatio, maxRatio) {
    return (ratio - minRatio) / (maxRatio - minRatio);
}

// Assigning color scale for Children per Doctor (from green to red)
function getDoctorRatioColor(ratio, minRatio, maxRatio) {
    const normalized = normalize(ratio, minRatio, maxRatio);
    
    // Define a color scale from green to red
    const colorScale = d3.scaleLinear()
        .domain([0, 0.2, 0.4, 0.6, 0.8, 1])  //normalized values
        .range(["green", "lightgreen", "yellow", "orange", "red", "brown"]);

    return colorScale(normalized);
}

// Creating circles for Children - Doctor Ratio
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

// Taking data from the API and creating layer for doctor ratio markers
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

// Creating the combined marker based on Population Density and Children per Doctor Ratio
function createCombinedMarker(location, minRatio, maxRatio) {
    let populationDensity = location.Population_Density;
    let doctorRatio = location.Children_to_Doctor_Ratio;

    // Round the population density to 0 decimal places
    // and round the children to doctor ratio to 1 decimal place
    populationDensity = Math.round(populationDensity);  // Round population density
    doctorRatio = doctorRatio.toFixed(1);  // Round children to doctor ratio to 1 decimal place

    // Calculate size based on Population Density (scaled to a reasonable range)
    const size = Math.min(30, Math.max(6, location.Population_Density / 1500));  // Smaller size for combined layer
    
    // Get color based on doctor ratio with the new blue-red scale
    const color = getCombinedColor(doctorRatio, minRatio, maxRatio);
    
    // Create a circle marker for the combined layer
    L.circleMarker([location.Latitude, location.Longitude], {
        radius: size,  // Size based on Population Density
        color: color,  // Color based on Children to Doctor Ratio with new scale
        fillColor: color,
        fillOpacity: 0.6,
        weight: 1
    })
    .bindPopup(`<b>Population Density per 1 square mile: ${populationDensity}</b><br><b>Children to Doctor Ratio: ${doctorRatio}</b>`)
    .addTo(combinedLayer);  // Add to combined layer
}

// Assigning color scale for Population Density (from blue to red)
function getCombinedColor(ratio, minRatio, maxRatio) {
    const normalized = normalize(ratio, minRatio, maxRatio);

    // Define a color scale from blue to red
    const colorScale = d3.scaleLinear()
        .domain([0, 0.2, 0.4, 0.6, 0.8, 1])  // Normalized values
        .range(["#ffffcc", "#ffff00", "#ff9900", "#ff3300", "#b35c00", "#4b2a00"]);  // blue -> yellow -> red

    return colorScale(normalized);
}

// Fetching data and creating markers for the combined layer
fetch('/api/v1.0/locations')
    .then(response => response.json())
    .then(data => {
        let pointsData = [];
        let minRatio = Infinity;
        let maxRatio = -Infinity;

        // Find min and max ratio for color normalization
        data.forEach(location => {
            let ratio = location.Children_to_Doctor_Ratio;
            minRatio = Math.min(minRatio, ratio);
            maxRatio = Math.max(maxRatio, ratio);
            pointsData.push(location);
        });

        // Create the combined markers for each location
        pointsData.forEach(location => {
            createCombinedMarker(location, minRatio, maxRatio);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Control panel to turn on/off layers
L.control.layers(null, {
    "Percentage of insured children": coverageLayer,
    "Children per doctor": doctorRatioLayer,  // Ensure this layer is available in the control panel
    "Population Density vs Children to Doctor Ratio": combinedLayer  // Adding the new combined layer
}).addTo(map);