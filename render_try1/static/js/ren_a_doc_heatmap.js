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
let heatLayer;  

// Fetch the data from the API
fetch('/api/v1.0/locations')
    .then(response => response.json())
    .then(data => {
        data.forEach(location => {
            let lat = location.Latitude;
            let lng = location.Longitude;
            let ratio = location.Children_to_Doctor_Ratio;

            minRatio = Math.min(minRatio, ratio);  // Find minimum ratio
            maxRatio = Math.max(maxRatio, ratio);  // Find maximum ratio

            heatmapData.push([lat, lng, ratio]);  
        });

        createHeatmap(heatmapData, minRatio, maxRatio);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Function to create the heatmap using leaflet-heat:
function createHeatmap(data, minRatio, maxRatio) {
   
    function normalize(ratio) {
  
        return Math.min(Math.log(ratio + 1) / Math.log(maxRatio + 1), 1); 
    }

   
    const gradient = {
        0.0: 'darkgreen',    
        0.2: 'green',        
        0.4: 'lightgreen',   
        0.6: 'yellow',       
        0.8: 'orange',       
        1.0: 'red'           
    };

    // Create the heatmap layer
    heatLayer = L.heatLayer(data.map(point => {
        let lat = point[0];
        let lng = point[1];
        let ratio = point[2];

        let normalizedRatio = normalize(ratio);  

        return [lat, lng, normalizedRatio];  
    }), {
        radius: 15,        
        blur: 20,         
        maxZoom: 13,      
        minOpacity: 0.3,   
        gradient: gradient 
    });

    // Add the heatLayer to the map
    heatLayer.addTo(map);

    // Control to toggle the heatmap layer on/off
    let baseMaps = {
        "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
    };

    let overlayMaps = {
        "Heatmap": heatLayer
    };

    L.control.layers(baseMaps, overlayMaps).addTo(map);

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
