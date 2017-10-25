const request = require('request')
const fs = require('fs')
const token = "y9YqlgZXKzplIgMbK6mO1nvHawgaJHbYix3wtnyy"
const bay832 = {
    start_latitude: 43.661679,
    start_longitude: -79.387141
}

const south = { lat: 43.638871, long: -79.3795452 } //harbourfront
const north = { lat: 43.687612, long: -79.392548 } // st clair
const west = { lat: 43.646573, long: -79.461256 } // high park
const east = { lat: 43.667592, long: -79.359194 } // DVP
const rangelat = [Math.min(north.lat, south.lat), Math.max(north.lat, south.lat)]
const rangelong = [Math.min(west.long, east.long), Math.max(west.long, east.long)]

const headers = {
    'Authorization': 'Token ' + token,
    'Accept-Language': 'en_US',
    'Content-Type': 'application/json'
}

const endpoint = "https://api.uber.com/v1.2/estimates"

function callapi(url) {
    return new Promise((yes, ops) => {
        // console.log('requesting', url)
        request({ url, headers }, (err, res, body) => {
            if (err) ops(err); // Print the error if one occurred
            else yes(body); // Print the HTML for the Google homepage.
        })
    })
}

async function getTimeEstimate(lat, long) {
    const url = endpoint + `/time?start_latitude=${lat}&start_longitude=${long}`
    const response = await callapi(url)
    return response //a string
}

function getUberX(response) {
    const data = JSON.parse(response).times || JSON.parse(response).prices
    if (!data) return -1
    const estimate = data.filter(({ localized_display_name }) => localized_display_name.toLowerCase() == "uberx")
    if (estimate.length > 0) return estimate[0].estimate
    else return -1 //in seconds
}

async function getPriceEstimate(lat, long) {
    const url = endpoint + `/price?start_latitude=${lat}&start_longitude=${long}&end_latitude=${lat}&end_longitude=${long}`
    const response = await callapi(url)
    return response
}

function fakeEstimate() {
    return Math.round(Math.random() * 600)
}

async function getAll(rangelat, rangelong) {
    // console.log("range", rangelat, rangelong)
    const result = new Map()
    const degree = 0.004
    for (let i = rangelat[0]; i < rangelat[1]; i += degree) {
        for (let j = rangelong[0]; j < rangelong[1]; j += degree) {
            // const [time, price] = await Promise.all([getTimeEstimate(i, j), getPriceEstimate(i, j)])
            const time = await getTimeEstimate(i, j)
            const uberx = getUberX(time)
                // const xprice = getUberX(price)
                // const uberx = fakeEstimate()
            result.set(`${i.toFixed(3)},${j.toFixed(3)}`, uberx)
                // console.log(uberx, xprice)
        }
        // console.log(i, 'th group done')
    }
    return result
}
let i = 0
async function run() {
    console.log(i, 'th grab start')
    const result = await getAll(rangelat, rangelong)
    const output = ["lat,long,time"]
    for (let [location, time] of result) {
        output.push(`${location},${time}`)
    }
    fs.writeFileSync(`./ubercorrect/${(new Date()).toLocaleString().replace(/:| /g, "-")}.csv`, output.join('\n'))
    console.log(i, 'th grab done')
    i += 1
    setTimeout(run, 600000)
}

run()
    // getAll(rangelat, rangelong)