const fs = require('fs')
const path = "./mon/"

function tidyup(group) {
    const filelist = fs.readdirSync(group)
    let i = 1
    for (let filename of filelist) {
        const result = [["lat", "long", "time"]]
        if (!filename.endsWith("txt")) continue
        console.log('parsing', filename)
        const data = fs.readFileSync(group + filename).toString()
        data.split('\n').map(line => line.split("\t")).forEach(([location, time]) => {
            const estimate = parseInt(time, 10)
            if (!estimate) return
            const [lat, long] = location.split(',')
            result.push([lat, long, estimate])
        })
        const output = result.map(line => line.join(',')).join('\n') + "\n"
        fs.writeFileSync(group + i + ".csv", output)
        i += 1
    }
    return true
}

tidyup(path)