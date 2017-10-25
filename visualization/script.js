// This example requires the Visualization library. Include the libraries=visualization
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization">

let map, heatmap;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: 43.661679, lng: -79.387141 },
        // mapTypeId: 'satellite'
    });

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: getPoints(),
        map: map
    });
}

function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}

function changeRadius() {
    heatmap.set('radius', heatmap.get('radius') ? null : 20);
}

function weightedPoints(lat, long, value) {
    // value is discrete
    const degree = 0.001
    const points = new Array(value)
    return points.fill([lat, long])
        .map(([lat, long]) => new google.maps.LatLng(lat + degree * (Math.random() - 0.5), long + degree * (Math.random() - 0.5)))
}

// Heatmap data: 500 Points
function getPoints() {
    const south = { lat: 43.644162, long: -79.384392 } //union
    const north = { lat: 43.687612, long: -79.392548 } // st clair
    const west = { lat: 43.655844, long: -79.435483 } // dufferin mall
    const east = { lat: 43.667592, long: -79.359194 } // ryerson
    return [
        ...weightedPoints(south.lat, south.long, 4),
        ...weightedPoints(north.lat, north.long, 4),
        ...weightedPoints(west.lat, west.long, 4),
        ...weightedPoints(east.lat, east.long, 4),
    ]
}