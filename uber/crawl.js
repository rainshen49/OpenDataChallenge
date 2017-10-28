const request = require('request')
const fs = require('fs')
let token
const bay832 = {
    start_latitude: 43.661679,
    start_longitude: -79.387141
}

const south = { lat: 43.638871, long: -79.3795452 } //harbourfront
const north = { lat: 43.687612, long: -79.392548 } // st clair
const west = { lat: 43.646573, long: -79.461256 } // high park
const east = { lat: 43.667592, long: -79.359194 } // DVP
const rhsouth = { lat: 43.854723, long: -79.436322 } //Hillcrest
const rhnorth = { lat: 43.918067, long: -79.441300 } // summit golf club
const rhwest = { lat: 43.887270, long: -79.493485 } // maple downs golf course
const rheast = { lat: 43.901495, long: -79.391003 } // costco
const markham = { lat: 43.845262, long: -79.337210 }
const sonycenter = { lat: 43.646662, long: -79.376052 }
const staples = { lat: 43.652845, long: -79.388036 }
const queenyonge = { lat: 43.652442, long: -79.379073 }
const union = { lat: 43.644244, long: -79.383944 }
let rangelat, rangelong, prefix = "",
    degree, interval = 30
const arg = process.argv.slice(2)[0]
console.log('crawling', arg)
if (arg === "north") {
    rangelat = [Math.min(rhnorth.lat, rhsouth.lat), Math.max(rhnorth.lat, rhsouth.lat)]
    rangelong = [Math.min(rhwest.long, rheast.long), Math.max(rhwest.long, rheast.long)]
    prefix = "rhill"
    token = "VkJBsTM1zFEsp8L0f8r-rZF8Qkh8Df5z_wBcJstR"
    degree = 0.004
} else if (arg == "fin") {
    rangelat = [Math.min(sonycenter.lat, staples.lat), Math.max(sonycenter.lat, staples.lat)]
    rangelong = [Math.min(sonycenter.long, staples.long), Math.max(sonycenter.long, staples.long)]
    token = "y9YqlgZXKzplIgMbK6mO1nvHawgaJHbYix3wtnyy"
    degree = 0.001
    prefix = "fin"
    interval = 3
} else {
    rangelat = [Math.min(west.lat, markham.lat), Math.max(west.lat, markham.lat)]
    rangelong = [Math.min(west.long, markham.long), Math.max(west.long, markham.long)]
    prefix = "big"
    token = "VkJBsTM1zFEsp8L0f8r-rZF8Qkh8Df5z_wBcJstR"
    degree = 0.005
}

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
    return response
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
    for (let i = rangelat[0]; i < rangelat[1]; i += degree) {
        for (let j = rangelong[0]; j < rangelong[1]; j += degree) {
            const time = await getTimeEstimate(i, j)
            const uberx = getUberX(time)
            // const uberx = fakeEstimate()
            result.set(`${i},${j}`, uberx)
            // console.log(uberx, xprice)
        }
        // console.log(i, 'th group done')
    }
    return result
}
let i = 0
async function run() {
    setTimeout(run, 60000)
    if ((new Date()).getMinutes() % interval === 0) {
        const startTime = new Date()
        console.log(i, 'th grab start', startTime)
        const result = await getAll(rangelat, rangelong)
        const output = ["lat,long,time"]
        for (let [location, time] of result) {
            output.push(`${location},${time}`)
        }
        fs.writeFileSync(`./ubercorrect/${prefix}${startTime.toLocaleString().replace(/:| /g, "-")}.csv`, output.join('\n'))
        console.log(i, 'th grab done')
        i += 1
    }
}

run()
    // getAll(rangelat, rangelong)