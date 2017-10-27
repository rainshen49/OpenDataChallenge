// todo: fix first heatmap not show
let map, heatmap;
const files = [
    'big2017-10-25-22-37-38.csv',
    'big2017-10-26-00-07-45.csv',
    'big2017-10-26-00-37-29.csv',
    'big2017-10-26-01-07-43.csv',
    'big2017-10-26-01-37-32.csv',
    'big2017-10-26-02-07-27.csv',
    'big2017-10-26-02-37-26.csv',
    'big2017-10-26-03-07-24.csv',
    'big2017-10-26-03-37-24.csv',
    'big2017-10-26-04-07-22.csv',
    'big2017-10-26-04-37-20.csv',
    'big2017-10-26-05-07-29.csv',
    'big2017-10-26-05-37-33.csv',
    'big2017-10-26-06-07-44.csv',
    'big2017-10-26-06-37-44.csv',
    'big2017-10-26-07-07-51.csv',
    'big2017-10-26-07-38-05.csv',
    'big2017-10-26-08-08-02.csv',
    'big2017-10-26-08-38-10.csv',
    'big2017-10-26-09-08-26.csv',
    'big2017-10-26-09-38-06.csv',
    'big2017-10-26-10-08-17.csv',
    'big2017-10-26-10-38-21.csv',
    'big2017-10-26-11-08-19.csv',
    'big2017-10-26-11-38-17.csv',
    'big2017-10-26-12-08-05.csv',
    'big2017-10-26-12-38-04.csv',
    'big2017-10-26-13-08-07.csv',
    'big2017-10-26-13-38-28.csv',
    'big2017-10-26-14-07-44.csv',
    'big2017-10-26-14-37-47.csv',
    'big2017-10-26-15-13-20.csv',
    'big2017-10-26-15-45-24.csv',
    'big2017-10-26-16-17-01.csv',
    'big2017-10-26-16-46-03.csv',
    'big2017-10-26-17-17-05.csv',
    'big2017-10-26-17-37-38.csv',
    'big2017-10-26-18-08-16.csv',
    'big2017-10-26-18-40-02.csv',
    'big2017-10-26-19-11-41.csv',
    'big2017-10-26-19-39-47.csv',
    'big2017-10-26-20-08-28.csv',
    'big2017-10-26-20-38-10.csv',
    'big2017-10-26-21-07-57.csv']

const title = document.querySelector('#title')

async function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: 43.661679, lng: -79.387141 },
        // mapTypeId: 'satellite'
    });

    const transitLayer = new google.maps.TransitLayer();
    transitLayer.setMap(map);

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: [],
        map: map
    });
    heatmap.set('radius', 60);
    const points = await Promise.all(files.map(filename => getPoints(filename)))
    while (true) {
        for (let i in points) {
            await new Promise(yes => setTimeout(yes, 2000))
            title.textContent = files[i]
            heatmap.setData(points[i])
            await new Promise(yes => setTimeout(yes, 2000))
        }
    }
}

// function weightedPoints(lat, long, value) {
//     // value is discrete
//     const degree = 0.005
//     if (value === -1) return []
//     const points = new Array(value)
//     return points.fill([lat, long])
//         .map(([lat, long]) => new google.maps.LatLng(lat + degree * (Math.random() - 0.5), long + degree * (Math.random() - 0.5)))
// }

document.querySelector('#radius').addEventListener('input', changeRadius)
function changeRadius(ev) {
    heatmap.set('radius', ev.target.value);
}
function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}
function changeOpacity() {
    heatmap.set('opacity', heatmap.get('opacity') ? null : 0.3);
}

async function fetchData(filename) {
    const csv = await fetch("/OpenDataChallenge/uber/ubercorrect/" + filename).then(res => res.text())
    const data = csv.split('\n')
        .slice(1).map(line => line.split(','))
        .map(([lat, long, time]) => ([parseFloat(lat), parseFloat(long), parseInt(time, 10)]))
        .map(([lat, long, time]) => ({ lat, long, value: time }))
    return data
}

function weightedpoint(lat, long, value) {
    // value is discrete
    return { location: new google.maps.LatLng(lat, long), weight: Math.round(10000 / value) }
}

async function getPoints(filename) {
    const data = await fetchData(filename)
    const points = [
        { location: new google.maps.LatLng(42.652, -79.381), weight: 0 },
        { location: new google.maps.LatLng(42.652, -79.381), weight: 17 }
    ]
    // data.map(({ lat, long, value }) => points.push(...weightedPoints(lat, long, value)))
    data.map(({ lat, long, value }) => points.push(weightedpoint(lat, long, value)))
    return points
}

