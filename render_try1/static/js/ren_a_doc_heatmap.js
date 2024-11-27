const width = window.innerWidth;
const height = window.innerHeight;

// Create an SVG element where the map will be drawn
const svg = d3.select("svg")
              .attr("width", width)
              .attr("height", height);

// Color scale for the heatmap
const colorScale = d3.scaleSequential(d3.interpolateViridis)
                     .domain([0, 1]); // Range of intensity from 0 to 1


const projection = d3.geoMercator()
                     .center([-119.4179, 36.7783]) // Center on California
                     .scale(1500) // Set the scale of the map
                     .translate([width / 2, height / 2]); // Translate the map to center in the SVG

// Fetch data from the API
fetch('/api/v1.0/locations')
  .then(response => response.json())
  .then(data => {

    // Prepare data for the heatmap (converting lat/lon to screen positions)
    const heatmapData = data.map(location => {
        return {
            lat: location.Latitude,
            lon: location.Longitude,
            intensity: location.Children_to_Doctor_Ratio 
        };
    });

    // intensity (it's between 0 and 1)
    const maxIntensity = d3.max(heatmapData, d => d.intensity);
    const normalizeIntensity = (intensity) => Math.min(intensity / maxIntensity, 1); //value never goes above 1

    // Draw the circles for the heatmap (each circle represents a location with intensity)
    svg.selectAll("circle")
       .data(heatmapData)
       .enter()
       .append("circle")
       .attr("cx", d => projection([d.lon, d.lat])[0]) // Convert lat/lon to screen x coordinate
       .attr("cy", d => projection([d.lon, d.lat])[1]) // Convert lat/lon to screen y coordinate
       .attr("r", 15)  // radius of the circles
       .style("fill", d => colorScale(normalizeIntensity(d.intensity)))  // color based on intensity
       .style("opacity", 0.7) 
       .attr("stroke", "black")
       .attr("stroke-width", 0.5);

    // Add tooltips to show the ratio when hovering over each circle
    svg.selectAll("circle")
       .append("title")
       .text(d => `Children-to-Doctor Ratio: ${d.intensity}`);

  })
  .catch(error => {
    // If there's an error fetching the data, log it
    console.error('Error fetching data:', error);
  });