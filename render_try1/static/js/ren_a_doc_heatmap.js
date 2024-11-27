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

            //console.log('Ratio:', ratio); 

            
            minRatio = Math.min(minRatio, ratio);
            maxRatio = Math.max(maxRatio, ratio);

            
            heatmapData.push([lat, lng, ratio]);
        });

       
        createHeatmap(heatmapData, minRatio, maxRatio);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Function to create the heatmap using leaflet-heat:
function createHeatmap(data, minRatio, maxRatio) {
    // Normalize the ratio to a scale of 0 to 1
    function normalize(ratio) {
        return (ratio - minRatio) / (maxRatio - minRatio);
    }

    // color function based on normalized value
    function getColor(normalizedRatio) {
        console.log('Normalized Ratio:', normalizedRatio); 
        if (normalizedRatio <= 0.1) {
            console.log('Assigned Color: darkgreen');  
            return 'darkgreen';
        } else if (normalizedRatio <= 0.2) {
            console.log('Assigned Color: green');  
            return 'green';
        } else if (normalizedRatio <= 0.4) {
            console.log('Assigned Color: lightgreen'); 
            return 'lightgreen';
        } else if (normalizedRatio <= 0.6) {
            console.log('Assigned Color: yellow');  
            return 'yellow';
        } else if (normalizedRatio <= 0.8) {
            console.log('Assigned Color: orange'); 
            return 'orange';
        } else {
            console.log('Assigned Color: red');  
            return 'red'; // For ratios above 0.8
        }
    }

    // Log the min and max ratios for debugging
    console.log("Min Ratio: ", minRatio);
    console.log("Max Ratio: ", maxRatio);

    // Create the heatmap layer
    let heatLayer = L.heatLayer(data.map(point => {
        let lat = point[0];
        let lng = point[1];
        let ratio = point[2];

     
        let normalizedRatio = normalize(ratio);

        console.log('Normalized Ratio:', normalizedRatio);

   
        let color = getColor(normalizedRatio);  

       
        return [lat, lng, normalizedRatio]; 
    }), {
        radius: 25,        
        blur: 20,          
        maxZoom: 13
    }).addTo(map);

    // Add popup on map click to show the ratio
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