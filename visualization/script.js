// This example requires the Visualization library. Include the libraries=visualization
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=visualization">

let map, heatmap;
// const files = ["2017-10-25-19-24-46.csv", "2017-10-25-19-35-16.csv", "2017-10-25-19-45-06.csv"]

async function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: 43.661679, lng: -79.387141 },
        // mapTypeId: 'satellite'
    });

    const transitLayer = new google.maps.TransitLayer();
    transitLayer.setMap(map);
    let hm
        // const points = await Promise.all(files.map(filename => getPoints(filename)))
        // for (let i = 0; i < 10; i++) {
        //     await showmap(map, points[i % 3], 2000)
        // }
    heatmap = await showmap(map, await getPoints("big2017-10-25-22-37-38.csv"))
}

async function showmap(map, points, duration = 0) {
    if (duration == 0) {
        return renderMap(map, points)
    } else {
        const hmap = renderMap(map, points)
        await new Promise(accept => setTimeout(accept, duration))
        setTimeout(() => hmap.setMap(null), 200)
        return null
    }
}

function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}

function weightedPoints(lat, long, value) {
    // value is discrete
    const degree = 0.006
    if (value === -1) return []
    const points = new Array(value)
    return points.fill([lat, long])
        .map(([lat, long]) => new google.maps.LatLng(lat + degree * (Math.random() - 0.5), long + degree * (Math.random() - 0.5)))
}

function changeOpacity() {
    heatmap.set('opacity', heatmap.get('opacity') ? null : 0.3);
}

function renderMap(map, data) {
    const heatmap = new google.maps.visualization.HeatmapLayer({
        data: data,
        map: map
    });
    heatmap.set('radius', 6);
    return heatmap
}

async function getPoints(filename) {
    const data = await fetchData(filename)
    const points = []
    data.map(({ lat, long, value }) => points.push(...weightedPoints(lat, long, value)))
    return points
}

async function fetchData(filename) {
    const csv = await fetch("/uber/ubercorrect/" + filename).then(res => res.text())
    const data = csv.split('\n')
        .slice(1).map(line => line.split(','))
        .map(([lat, long, time]) => ([parseFloat(lat), parseFloat(long), parseInt(time, 10)]))
        .map(([lat, long, time]) => ({ lat, long, value: Math.round(time, 10 / 60) }))
    return data
}