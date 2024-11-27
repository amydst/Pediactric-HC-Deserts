let map = L.map('map', {
    center: [36.7783, -119.4179],
    zoom: 6
});

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Prepare data for doctor ratio heatmap
let heatmapData = [];
let minRatio = Infinity;
let maxRatio = -Infinity;

// Fetch data from the API
fetch('/api/v1.0/locations')
    .then(response => response.json())
    .then(data => {
        // Add data points for the heatmap and find min/max ratios
        data.forEach(location => {
            let ratio = location.Children_to_Doctor_Ratio;
            let lat = location.Latitude;
            let lng = location.Longitude;

            // Track the min and max doctor-to-child ratios
            minRatio = Math.min(minRatio, ratio);
            maxRatio = Math.max(maxRatio, ratio);

            // Push the location and normalized ratio into the heatmap data array
            heatmapData.push([lat, lng, ratio]);
        });

        // Now plot the heatmap using the calculated data
        plotHeatmap(heatmapData, minRatio, maxRatio);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Function to plot heatmap using D3
function plotHeatmap(data, minRatio, maxRatio) {
    // Create an SVG layer for the heatmap (D3 will handle it)
    let svg = d3.select(map.getPanes().overlayPane).append('svg')
        .attr('width', map.getSize().x)
        .attr('height', map.getSize().y);

    let g = svg.append('g'); // Group for heatmap points

    // Scale for circle size (based on ratio)
    let radiusScale = d3.scaleLinear()
        .domain([minRatio, maxRatio]) // From min to max ratio
        .range([5, 30]); // Adjust circle sizes based on ratio

    // Color scale: green (low ratio) to red (high ratio)
    let colorScale = d3.scaleLinear()
        .domain([minRatio, maxRatio])  // Use the ratio range for color scale
        .range(["green", "red"]);  // Green for fewer children per doctor, red for more

    // Project latitude and longitude to the map's pixel coordinates
    let latLngToPoint = map.latLngToLayerPoint.bind(map);

    // Bind data points to circles
    let circles = g.selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('cx', d => latLngToPoint(L.latLng(d[0], d[1])).x) // X position
        .attr('cy', d => latLngToPoint(L.latLng(d[0], d[1])).y) // Y position
        .attr('r', d => radiusScale(d[2])) // Radius based on doctor-to-child ratio
        .style('fill', d => colorScale(d[2])) // Color based on ratio
        .style('opacity', 0.6);

    // Update circles on map move or zoom
    map.on('moveend', () => {
        circles.attr('cx', d => latLngToPoint(L.latLng(d[0], d[1])).x)
            .attr('cy', d => latLngToPoint(L.latLng(d[0], d[1])).y);
    });

    // Handle resizing
    map.on('resize', () => {
        svg.attr('width', map.getSize().x)
            .attr('height', map.getSize().y);
    });
}