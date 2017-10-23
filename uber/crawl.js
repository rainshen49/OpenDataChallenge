const request = require('request')
const token = "TEE9Azy7gOZD5cQ9I8i5qngO_fV_pAOTvCG1X4tA"
const bay832 = {
    start_latitude: 43.661679,
    start_longitude: -79.387141
}

const south = { lat: 43.644162, long: -79.384392 } //union
const north = { lat: 43.667692, long: -79.392457 } // ROM
const west = { lat: 43.654841, long: -79.402228 } // kensington market
const east = { lat: 43.657860, long: -79.378655 } // ryerson
const rangelat = [Math.round(Math.min(west.lat, east.lat) * 1000) / 1000, Math.round(Math.max(west.lat, east.lat) * 1000) / 1000]
const rangelong = [Math.round(Math.min(west.long, east.long) * 1000) / 1000, Math.round(Math.max(west.long, east.long) * 1000) / 1000]

const headers = {
    'Authorization': 'Token ' + token,
    'Accept-Language': 'en_US',
    'Content-Type': 'application/json'
}

const endpoint = "https://api.uber.com/v1.2/estimates"

function callapi(url) {
    return new Promise((yes, ops) => {
        console.log('requesting', url)
        request({ url, headers }, (err, res, body) => {
            if (err) ops(err); // Print the error if one occurred
            else yes(body); // Print the HTML for the Google homepage.
        })
    })
}

async function getTimeEstimate(lat, long) {
    const url = endpoint + `/time?start_latitude=${lat}&start_longitude=${long}`
    const response = await callapi(url)
    return response//a string
}

function getUberXTime(response) {
    const data = JSON.parse(response).times
    if (!data) return -1
    const estimate = data.filter(({ localized_display_name }) => localized_display_name.toLowerCase() == "ubersuv")
    if (estimate.length > 0) return estimate[0].estimate
    else return -1//in seconds
}

function fakeEstimate() {
    return Math.round(Math.random() * 600)
}

async function getAll(rangelat, rangelong) {
    console.log("range", rangelat, rangelong)
    const result = new Map()
    const degree = 0.002
    for (let i = rangelat[0]; i < rangelat[1]; i += degree) {
        for (let j = rangelong[0]; j < rangelong[1]; j += degree) {
            // const all = await getTimeEstimate(i, j)
            // const uberx = getUberXTime(all)
            const uberx = fakeEstimate()
            result.set(`${i.toFixed(3)},${j.toFixed(3)}`, uberx)
            console.log(uberx)
        }
        console.log(i, 'th group done')
    }
    return result
}

//todo: map them on a map
getAll(rangelat, rangelong).then(res => console.log(res))