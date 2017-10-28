// todo: fix max intensity for fb events
let map, heatmap;
const fbfiles = ["100events.dat"]
const uberfiles = [
    'fin2017-10-28-00-38-29.csv',
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
    'big2017-10-26-21-07-57.csv',
    'big2017-10-26-21-38-01.csv',
    'big2017-10-26-22-08-17.csv',
    'big2017-10-26-22-37-47.csv',
    'big2017-10-26-23-07-44.csv',
    'big2017-10-26-23-37-45.csv',
    'big2017-10-27-00-07-47.csv',
    'big2017-10-27-00-37-11.csv',
    'big2017-10-27-01-07-07.csv',
    'big2017-10-27-01-36-52.csv',
    'big2017-10-27-02-06-59.csv',
    'big2017-10-27-02-36-57.csv',
    'big2017-10-27-03-06-59.csv',
    'big2017-10-27-03-36-48.csv',
    'big2017-10-27-04-06-45.csv',
    'big2017-10-27-04-36-51.csv',
    'big2017-10-27-05-07-01.csv',
    'big2017-10-27-05-37-06.csv',
    'big2017-10-27-06-07-02.csv',
    'big2017-10-27-06-37-24.csv',
    'big2017-10-27-07-07-27.csv',
    'big2017-10-27-07-37-27.csv',
    'big2017-10-27-08-07-40.csv',
    'big2017-10-27-08-37-50.csv',
    'big2017-10-27-09-07-44.csv',
    'big2017-10-27-09-37-49.csv',
    'big2017-10-27-10-08-56.csv',
    'big2017-10-27-10-37-53.csv',
    'big2017-10-27-11-07-53.csv',
    'big2017-10-27-11-37-47.csv',
    'big2017-10-27-12-07-47.csv',
    'big2017-10-27-12-37-51.csv',
    'big2017-10-27-13-07-43.csv',
    'big2017-10-27-13-37-36.csv',
    'big2017-10-27-14-07-38.csv',
    'big2017-10-27-14-37-51.csv',
    'big2017-10-27-15-07-38.csv',
    'big2017-10-27-15-37-45.csv',
    'big2017-10-27-16-07-54.csv',
    'big2017-10-27-16-37-55.csv',
    'big2017-10-27-17-07-56.csv',
    'big2017-10-27-17-37-56.csv',
    'big2017-10-27-18-08-05.csv',
    'big2017-10-27-18-38-11.csv',
    'big2017-10-27-19-08-12.csv',
    'big2017-10-27-19-38-13.csv',
    'big2017-10-27-20-08-23.csv',
    'big2017-10-27-20-38-24.csv',
    'big2017-10-27-21-08-21.csv',
    'big2017-10-27-21-38-22.csv',
    'big2017-10-27-22-08-28.csv',
    'big2017-10-27-22-38-07.csv',
    'big2017-10-27-23-08-06.csv']


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
        map: map,
    });
    heatmap.set('radius', 60);
    // showuber(heatmap)
    showfb(heatmap)
}
function changeRadius(ev) {
    heatmap.set('radius', ev.target.value);
}
function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}
function changeOpacity() {
    heatmap.set('opacity', heatmap.get('opacity') ? null : 0.3);
}

async function showuber(hm) {
    const uberpoints = await Promise.all(uberfiles
        .map(filename => fetchData(filename, "uber/uberbig").then(processUberData)))
    async function changeHeatmap(ev) {
        const i = ev.target.value
        title.textContent = uberfiles[i]
        await new Promise(yes => requestAnimationFrame(yes))
        await new Promise(yes => requestAnimationFrame(yes))
        hm.setData(uberpoints[i])
    }
    document.querySelector('#index').oninput = changeHeatmap
    title.textContent = uberfiles[0]
    hm.setData(uberpoints[0])
}

async function showfb(hm) {
    const fbpoints = await Promise.all(fbfiles.map(filename => fetchtData(filename, "facebook").then(processFbdata)))
    title.textContent = fbfiles[0]
    hm.setData(fbpoints[0])
}

async function fetchData(filename, prefix) {
    const csv = await fetch(`/OpenDataChallenge/${prefix}/${filename}`).then(res => res.text())
    const data = csv.split('\n').map(line => line.split(','))
    return data
}

async function fetchtData(filename, prefix) {
    const csv = await fetch(`/OpenDataChallenge/${prefix}/${filename}`).then(res => res.text())
    const data = csv.split('\n').map(line => line.split('\t'))
    return data
}

function weightedpoint(lat, long, value) {
    // value is discrete
    // console.log(lat, long, value)
    return { location: new google.maps.LatLng(lat, long), weight: value }
}

function processUberData(list) {
    const points = list.slice(1)
        .map(([lat, long, time]) => ([parseFloat(lat), parseFloat(long), parseInt(time, 10)]))
        .map(([lat, long, time]) => ({ lat, long, value: time }))
    return [
        { location: new google.maps.LatLng(42.652, -79.381), weight: 1 },
        { location: new google.maps.LatLng(42.652, -79.381), weight: 17 },
        ...points.map(({ lat, long, value }) => weightedpoint(lat, long, Math.round(1000 / value)))]
}


function processFbdata(list) {
    const points = list.slice(1)
        .filter(([name]) => name !== "Error")
        .map(([name, lat, long, start_time, end_time, attending_count, type, id]) => ([name, parseFloat(lat), parseFloat(long), parseInt(attending_count, 10)]))
        .map(([name, lat, lng, attending_count]) => ({ label: name, position: { lat, lng }, weight: attending_count }))
    return points.map(({ label, position: { lat, lng }, weight }) => weightedpoint(lat, lng, weight ** 0.1))
}

document.querySelector('#radius').addEventListener('input', changeRadius)