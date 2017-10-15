const https = require('https')
const access_token="1968137176762204|0a1d5fe69c71d238a579be032a19fae7"

function getPlacesEvent(placeid,placename){
    return new Promise((yes,ops)=>{
        https.get(`https://graph.facebook.com/${placeid}/events?access_token=${access_token}`,(res)=>{
            console.log('Got Events of '+placename)
            chunks = []
            res.on('data',chunk=>chunks.push(chunk.toString())).on('error',ops)
            res.on('end',()=>yes(JSON.parse(chunks.join(''))))
        }).on('error',ops)
    })
}
getPlacesEvent(6169515998,"UofT").then(events=>console.log(events))
// todo:
// get places
// deal with .next pagination