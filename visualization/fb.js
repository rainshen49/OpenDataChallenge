import { weightedPoints } from './script.js'
let active = false;

const heatmap = new google.maps.visualization.HeatmapLayer({
    data: [],
    map: null,
});

let topMarker = new google.maps.Marker({
    animation: google.maps.Animation.DROP
});

heatmap.set('radius', 60)

function generateTimeline(start, end) {
    const map = new Map()
    for (let i = start.valueOf(); i < end.valueOf(); i += 3600000) {
        // console.log(new Date(i))
        map.set(i, [])
    }
    return map
}

function printTimeline(timeline) {
    for (let [time, list] of timeline) {
        console.log((new Date(time)).toLocaleString())
        console.log(list)
    }
}

function addToTimeline(event, timeline) {
    // [name, lat, long, start_time, end_time, attending_count]
    const startTime = (new Date(event[3])).valueOf()
    const endTime = (new Date(event[4])).valueOf()
    for (let [time, list] of timeline) {
        if (startTime - time >= 0 && startTime - time < 3600000) {
            // if started
            list.push(event)
        }
        if (time - endTime >= 0 && time - endTime < 3600000) {
            // if ended
            list.push(event)
        }
    }
}

function processFbdata(list) {
    const points = list.slice(1)
        .filter(([name]) => name !== "Error")
        .map(([name, lat, long, start_time, end_time, attending_count, type, id]) => [name, parseFloat(lat), parseFloat(long), new Date(start_time), new Date(end_time), parseInt(attending_count, 10)])
    return points
}

function duration(start, end) {
    // in minutes
    return (end.valueOf() - start.valueOf()) / 1000 / 60
}

async function fetchFBData() {
    const csv = await fetch(`./data/1000events.dat`).then(res => res.text())
    const data = csv.split('\n').map(line => line.split('\t'))
    return data
}

async function loadFBdata(map) {
    const events = await fetchFBData().then(processFbdata)
    const shortevents = events.filter(event => !isNaN(duration(event[3], event[4])) && duration(event[3], event[4]) < 720)
    window.shortevents = shortevents
    shortevents.sort((a, b) => a[3].valueOf() - b[3].valueOf())
    const timeline = generateTimeline(start, end)
    shortevents.forEach(event => addToTimeline(event, timeline))
    window.timeline = timeline

    topMarker.addListener('click', () => infowindow.open(map, topMarker));

    const infowindow = new google.maps.InfoWindow({
        content: ""
    });

    dom('#timeline').addEventListener('input', (ev) => {
        const t = parseInt(ev.target.value, 10)
            // console.log('changing timeline')
        const points = []
        const events = timeline.get(t).sort((a, b) => b[5] - a[5])
        timeline.get(t).forEach((ev) => {
            const [name, lat, long, start_time, end_time, attending_count] = ev
            points.push(...weightedPoints(lat, long, parseInt(attending_count / 100), ev))
        })
        if (events.length > 0 && events[0][5] > 100 && active) {
            console.log('marker', events[0])
            topMarker.set('position', new google.maps.LatLng(events[0][1], events[0][2]))
            topMarker.set('label', "^" + events[0][5] + "^")
            topMarker.setMap(map)
            infowindow.set('content', `<a href="#">${events[0][0]}</a> from ${(new Date(events[0][3])).toLocaleString()} to ${(new Date(events[0][4])).toLocaleString()} has ${events[0][5]} attendance. That is pretty high!`)
            infowindow.open(map, topMarker)
            window.topMarker = topMarker
        } else {
            topMarker.setMap(null)
        }
        heatmap.setData(points)
    })
    dom('#timeline').dispatchEvent(new Event('input'))
}

export async function showFB(map) {
    active = true
    if (heatmap.getData().length === 0) {
        // show initial data
        await loadFBdata(map)
    }
    heatmap.setMap(map)
    return heatmap
}

export async function hideFB() {
    active = false
    topMarker.setMap(null)
}