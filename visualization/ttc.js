import { weightedpoint } from './script.js'
const markers = new Set()
let active = false;
const heatmap = new google.maps.visualization.HeatmapLayer({
    data: [],
    map: null,
});

async function grabData() {
    const bus = await fetch("./data/ttc_summary_bus.json").then(res => res.json())
    const streetcar = await fetch("./data/ttc_summary_streetcar.json").then(res => res.json())
    const subway = await fetch("./data/ttc_summary_subway.json").then(res => res.json())
    return { bus, streetcar, subway }
}
// weekday, saturday, sunday

function convertToPoints(array24) {
    return array24
        .map(stations => stations
            .map(data => ({ name: data[1], lat: data[2], lng: data[3], weight: parseInt(data[5] / 2, 10) })))
}

async function loadTTC(map) {
    let { bus, streetcar, subway } = await grabData()
    bus = bus.map(convertToPoints)
    streetcar = streetcar.map(convertToPoints)
    subway = subway.map(convertToPoints)
    dom('#timeline').addEventListener('input', ev => {
        const t = parseInt(ev.target.value, 10)
        const date = new Date((new Date(t)).toLocaleString())
        const hours = date.getHours()
        let i
        switch (date.getDay()) {
            case 0:
                // sunday
                i = 2

            case 6:
                // saturday
                i = 1
            default:
                // weekdays
                i = 0
        }
        const points = []
        markers.forEach(marker => marker.setMap(null))
        markers.clear()
        bus[i][hours].forEach(({ lat, lng, weight }) => {
            addToPoints(lat, lng, weight, points, map)
        })
        streetcar[i][hours].forEach(({ lat, lng, weight }) => {
            addToPoints(lat, lng, weight, points, map)
        })
        subway[i][hours].forEach(({ lat, lng, weight }) => {
            addToPoints(lat, lng, weight, points, map)
        })
        heatmap.setData(points)
    })
    dom('#timeline').dispatchEvent(new Event('input'))
    console.log(bus)
    console.log(streetcar)
    console.log(subway)
}

function addToPoints(lat, lng, weight, points, map) {
    if (weight === 0) return
    points.push(weightedpoint(lat, lng, parseInt(weight / 10, 10)))
    markers.add(new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        label: weight.toString(),
        map: active ? map : null
    }))
}

export async function showttc(map) {
    active = true
    if (heatmap.getMap() == null) {
        await loadTTC(map)
    }
    markers.forEach(marker => marker.setMap(map))
    heatmap.setMap(map)
    return heatmap
}

export function hidettc() {
    markers.forEach(marker => marker.setMap(null))
    markers.clear()
    active = false;
}