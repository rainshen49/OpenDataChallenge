// README: read a list of event id's and get its attendance data, indexed by time
const https = require('https')
const fs = require('fs')
const ids = fs.readFileSync('100events.txt').toString().split('\n')
const access_token = "1968137176762204|0a1d5fe69c71d238a579be032a19fae7"
const gcp = "AIzaSyBxmtplp3T8rlTsWj1Oyr-Quz7uDzGQ23U"

const cityhall = [43.6534, -79.3841]

async function main() {
    const results = ["name,lat,long,start_time,end_time,attending_count,type,id"]
    const data = await Promise.all(ids.slice(0, 100).map(async id => {
        try {
            const response = await getEventDetail(id, ["name", "place", "start_time", "end_time", "attending_count", "declined_count", "interested_count", "maybe_count", "noreply_count", "type"])
            const { name, place, start_time, end_time, attending_count, type } = response
            let latitude = "", longitude = ""
            if ('location' in place) {
                latitude = place.location.latitude
                longitude = place.location.longitude
            } else if ('name' in place) {
                const { lat, lng } = await addresstoLatLng(place.name)
                latitude = lat
                longitude = lng
            }
            return [`"${name}"`, latitude, longitude, start_time, end_time, attending_count, type, id].join(',')
        } catch (e) {
            console.error(id, e)
            return "Error"
        }
    }))
    results.push(...data)
    fs.writeFileSync('./100events.csv', results.join('\n'))
}

async function getEventDetail(id, fields = []) {
    console.log('getting details for', id)
    const result = await
        callSingleAPI(`https://graph.facebook.com/${id}?${fields.length > 0 ? `fields=${fields.join(',')}&` : ""}access_token=${access_token}`)
    return result
}

function callSingleAPI(endpoint) {
    // console.log(endpoint)
    return new Promise((yes, ops) => {
        https.get(endpoint, (res) => {
            const chunks = []
            res.on('data', chunk => chunks.push(chunk.toString())).on('error', ops)
            res.on('end', () => {
                const result = JSON.parse(chunks.join(''))
                yes(result)
            })
        }).on('error', ops)
    })
}

function addresstoLatLng(add) {
    return new Promise((yes, ops) => {
        https.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${add}&key=${gcp}`, (res) => {
            const chunks = []
            res.on('data', chunk => chunks.push(chunk.toString())).on('error', ops)
            res.on('end', () => {
                const result = JSON.parse(chunks.join(''))
                console.log(result.results)
                const { lat, lng } = result.results[0].geometry.location
                yes({ lat, lng })
            })
        }).on('error', ops)
    })
}

main()