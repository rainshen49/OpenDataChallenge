// This example requires the Visualization library. Include the libraries=visualization
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization">

let map, heatmap;

async function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: 43.661679, lng: -79.387141 },
        // mapTypeId: 'satellite'
    });

    const transitLayer = new google.maps.TransitLayer();
    transitLayer.setMap(map);

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: await getPoints(),
        map: map
    });
    heatmap.set('radius', 4);
}

function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}

function weightedPoints(lat, long, value) {
    // value is discrete
    const degree = 0.004
    const points = new Array(value)
    return points.fill([lat, long])
        .map(([lat, long]) => new google.maps.LatLng(lat + degree * (Math.random() - 0.5), long + degree * (Math.random() - 0.5)))
}

function changeOpacity() {
    heatmap.set('opacity', heatmap.get('opacity') ? null : 0.3);
}
// Heatmap data: 500 Points
async function getPoints() {
    const data = await fetchData('2017-10-25-19-24-46.csv')
    const points = []
    data.map(({ lat, long, value }) => points.push(...weightedPoints(lat, long, value)))
    return points
        // const south = { lat: 43.644162, long: -79.384392 } //union
        // const north = { lat: 43.687612, long: -79.392548 } // st clair
        // const west = { lat: 43.655844, long: -79.435483 } // dufferin mall
        // const east = { lat: 43.667592, long: -79.359194 } // ryerson
        // return [
        //     ...weightedPoints(south.lat, south.long, 4),
        //     ...weightedPoints(north.lat, north.long, 4),
        //     ...weightedPoints(west.lat, west.long, 4),
        //     ...weightedPoints(east.lat, east.long, 4),
        // ]
}

async function fetchData(filename) {
    const csv = await fetch("./data/" + filename).then(res => res.text())
    const data = csv.split('\n')
        .slice(1).map(line => line.split(','))
        .map(([lat, long, time]) => ([parseFloat(lat), parseFloat(long), parseInt(time, 10)]))
        .map(([lat, long, time]) => ({ lat, long, value: Math.round(time, 10 / 60) }))
    return data
}