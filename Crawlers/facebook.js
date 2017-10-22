const https = require('https')
const access_token = "1968137176762204|0a1d5fe69c71d238a579be032a19fae7"

/* Pipeline
for a center point, get all places within a radius
for each place, get all of its events
for each event, get all of its attendance info
*/

const cityhall = [43.6534, -79.3841]
function getPlaces(center = cityhall, radius) {
    // graph.facebook.com/search?type=place&center=43.6534,-79.3841&distance=100
    return callAPI(`https://graph.facebook.com/search?type=place&center=${center.join(',')}&distance=${radius}&access_token=${access_token}`)
    // response shape: {data:[{name,id}]}
}

function getPlaceEvents(placeid) {
    return callAPI(`https://graph.facebook.com/${placeid}/events?since=1503036071&access_token=${access_token}`)
    // response shape
}

async function getEventDetail(id, name, info, fields = ["attending", "declined", "interested"]) {
    console.log('getting details for',name)
    const result = { id, name, ...info }
    for (let field of fields) {
        result[field] = await callAPI(`https://graph.facebook.com/${id}/${field}?access_token=${access_token}`)
    }
    return result
}

function summaryAttendance(ev) {
    // ev has shape {attending, declined, interested}
    const result = {}
    console.log('what they got insinde\n \n', JSON.stringify(ev, null, 2))
    for (let key in ev) {
        if (key === "id" || key == "name") {
            result[key] = ev[key]
        } else {
            result[key] = ev[key].data.length
        }
    }
    return result
}

// getPlaceEvents(919551874798333, "Hack the 6ix").then(events=>{
// getPlaceEvents(1850099505219120, "Toronto tango club").then(events => {
//     // console.log(JSON.stringify(events,null,2))
//     if ('next' in events.paging) console.log("more omitted")
//     return extractEventsInfo(events)
// }).then(info => {
//     // console.log(JSON.stringify(info,null,2))
//     return Promise.all(info.map(({ id, name }) => getEventDetail(id, name)))
// }).then(events => {
//     // console.log("\nevents are\n")    
//     // console.log(JSON.stringify(events,null,2))
//     return events.map(summaryAttendance)
// }).then(summary => {
//     console.log("\nsummary\n")
//     console.log(JSON.stringify(summary, null, 2))
// })
//     .catch(err => console.error(err))
//     .then(ev => console.log(ev))
// getEventInfo(447462245272587,"Thacks",["attending","declined","interested"])
// .then(ev=>console.log(JSON.stringify(ev,null,2)))
// todo:
// get places
// deal with .next pagination
function flatten(list) {
    // flatten a list by one level
    const result = []
    // console.log(list)
    list.forEach(items => {
        result.push(...items)
    })
    return result
}

function callAPI(endpoint, prev = []) {
    // console.log('--------------- API -----------------\n', endpoint)
    return new Promise((yes, ops) => {
        https.get(endpoint, (res) => {
            const chunks = []
            res.on('data', chunk => chunks.push(chunk.toString())).on('error', ops)
            res.on('end', () => {
                const result = JSON.parse(chunks.join(''))
                // console.log('response', result)
                prev.push(...result.data)
                if ('paging' in result && 'next' in result.paging) {
                    callAPI(result.paging.next, prev).then(yes).catch(ops)
                } else {
                    // base case, reaching the end
                    yes(prev)
                }
            })
        }).on('error', ops)
    })
}
async function main() {
    const places = (await getPlaces(cityhall, 15))
    console.log("got places\n", places)
    const events = flatten(await Promise.all(places.map(({ id }) => getPlaceEvents(id))))
    console.log("got events\n", events)
    // need to filter events
    
    const eventsSummary = await Promise.all(events.map(({ name, id, start_time, end_time, place }) => getEventDetail(id, name, { start_time, end_time, place })))
    console.log(eventsSummary)
}

main()