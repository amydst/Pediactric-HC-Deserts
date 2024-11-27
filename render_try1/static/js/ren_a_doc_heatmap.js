let map = L.map('map', {
    center: [36.7783, -119.4179],
    zoom: 6
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let heatmapData = [];
let minRatio = Infinity;
let maxRatio = -Infinity;

fetch('/api/v1.0/locations')
    .then(response => response.json())
    .then(data => {
        data.forEach(location => {
            let ratio = location.Children_to_Doctor_Ratio;
            let lat = location.Latitude;
            let lng = location.Longitude;

            minRatio = Math.min(minRatio, ratio);
            maxRatio = Math.max(maxRatio, ratio);

            heatmapData.push([lat, lng, ratio]);
        });

        plotHeatmap(heatmapData, minRatio, maxRatio);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

function plotHeatmap(data, minRatio, maxRatio) {
    let svg = d3.select(map.getPanes().overlayPane).append('svg')
        .attr('width', map.getSize().x)
        .attr('height', map.getSize().y);

    let g = svg.append('g');

    let radiusScale = d3.scaleLinear()
        .domain([minRatio, maxRatio])
        .range([5, 30]);

    let colorScale = d3.scaleLinear()
        .domain([minRatio, maxRatio])
        .range(["green", "red"]);

    let latLngToPoint = map.latLngToLayerPoint.bind(map);

    let circles = g.selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('cx', d => latLngToPoint(L.latLng(d[0], d[1])).x)
        .attr('cy', d => latLngToPoint(L.latLng(d[0], d[1])).y)
        .attr('r', d => radiusScale(d[2]))
        .style('fill', d => colorScale(d[2]))
        .style('opacity', 0.6);

    map.on('moveend', () => {
        circles.attr('cx', d => latLngToPoint(L.latLng(d[0], d[1])).x)
            .attr('cy', d => latLngToPoint(L.latLng(d[0], d[1])).y);
    });

    map.on('resize', () => {
        svg.attr('width', map.getSize().x)
            .attr('height', map.getSize().y);
    });
}