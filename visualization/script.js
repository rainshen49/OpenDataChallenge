// common functions used in data visualization
// weighted point v
// UI
// Side bar data source selector
// Global heatmap features: opacity, radius, timeline
// Each data source will be in a own module, handling data fetching and visualization

import { showttc, hidettc } from "./ttc.js"
import { showFB, hideFB } from "./fb.js"

const heatmaps = new Map()
const map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: { lat: 43.661679, lng: -79.387141 },
    // mapTypeId: 'satellite'
});
const transitLayer = new google.maps.TransitLayer();
transitLayer.setMap(map);

window.heatmaps = heatmaps

const fab = dom('.fab')
const add = dom('#add')
const fb = fab.children[1]
const ttc = fab.children[2]
window.fab = fab

Array.from(fab.children).forEach(child => {
    child.addEventListener('click', (ev) => {
        ev.target.classList.toggle('active')
    })
})

fb.addEventListener('click', async ev => {
    const active = ev.target.classList.contains("active")
    if (active) {
        heatmaps.set('fb', await showFB(map))
    } else {
        heatmaps.get('fb').setMap(null)
        heatmaps.set('fb', null)
        hideFB()
    }
})

ttc.addEventListener('click', async ev => {
    const active = ev.target.classList.contains("active")
    if (active) {
        heatmaps.set('ttc', await showttc(map))
    } else {
        heatmaps.get('ttc').setMap(null)
        heatmaps.set('ttc', null)
        hidettc()
    }
})

document.querySelector('#radius').addEventListener('input', function changeRadius(ev) {
    heatmaps.forEach((heatmap) => heatmap.set('radius', ev.target.value))
})

dom('#opacity').onclick = function changeOpacity() {
    heatmaps.forEach((heatmap) => heatmap.set('opacity', heatmap.get('opacity') ? null : 0.3))
}

dom('#timeline').oninput = ev => {
    const time = parseInt(ev.target.value, 10)
        // console.log(time)
    dom('label[for="timeline"]').textContent = (new Date(time)).toLocaleString()
}

export function weightedpoint(lat, long, value, name) {
    // console.log(lat, long, value)
    return { location: new google.maps.LatLng(lat, long), weight: value, name }
}

export function weightedPoints(lat, long, value, data) {
    // value is discrete
    const degree = 0.0001
    const points = new Array(value)
    return points.fill([lat, long])
        .map(([lat, long]) => ({ location: new google.maps.LatLng(lat + degree * (Math.random() - 0.5), long + degree * (Math.random() - 0.5)), weight: 1, data }))
}

function processUberData(list) {
    // process raw data from csv and accomodate for duplicates
    // take smaller waiting time for duplicates
    const points = list.map(([lat, long, time]) => ([lat + "," + long, parseInt(time, 10)]))
        .filter(a => a[1] !== -1)
    const store = {}
    points.forEach(([location, time]) => {
        if (location in store) {
            store[location] = Math.min(store[location], time)
        } else {
            store[location] = time
        }
    })
    return Object.keys(store).map(key => ([...key.split(','), store[key]]))
}

function makeUberPoints(list) {
    return [
        { location: new google.maps.LatLng(42.652, -79.381), weight: 1 },
        { location: new google.maps.LatLng(42.652, -79.381), weight: 17 },
        ...list.map(([lat, long, value]) => weightedpoint(lat, long, (1000 / value)))
    ]
}

async function fetchData(filename, prefix) {
    const csv = await fetch(`/dom{prefix}/dom{filename}`).then(res => res.text())
    const data = csv.split('\n').map(line => line.split(','))
    return data
}