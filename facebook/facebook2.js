// will be an in browser crawler
// in this view
// https://www.facebook.com/events/discovery/?suggestion_token=%7B%22city%22%3A%22default_110941395597405%22%2C%22time%22%3A%22this_week%22%7D&acontext=%7B%22ref%22%3A2%2C%22ref_dashboard_filter%22%3A%22upcoming%22%2C%22source%22%3A2%2C%22source_dashboard_filter%22%3A%22discovery%22%2C%22action_history%22%3A%22[%7B%5C%22surface%5C%22%3A%5C%22dashboard%5C%22%2C%5C%22mechanism%5C%22%3A%5C%22main_list%5C%22%2C%5C%22extra_data%5C%22%3A%7B%5C%22dashboard_filter%5C%22%3A%5C%22upcoming%5C%22%7D%7D%2C%7B%5C%22surface%5C%22%3A%5C%22discover_filter_list%5C%22%2C%5C%22mechanism%5C%22%3A%5C%22surface%5C%22%2C%5C%22extra_data%5C%22%3A%7B%5C%22dashboard_filter%5C%22%3A%5C%22discovery%5C%22%7D%7D]%22%2C%22has_source%22%3Atrue%7D

const selector = `._7ty`
const $$ = document.querySelectorAll.bind(document)

function getIDs(anchors) {
    // only call when we have enough data
    return anchors.map(anchor => {
        let href = anchor.href
        href = href.slice(href.indexOf("events") + 7)
        href = href.slice(0, href.indexOf("/"))
        return href
    })
}

function getEnoughData(max, selector) {
    console.log('checking')
    const anchors = $$(selector)
    if (anchors.length < max) {
        window.scrollBy(0, 10000)
        // ideally we'd use a mutation observer, but here polling is much more readable
        setTimeout(() => getEnoughData(max, selector), 1000)
    } else {
        const ids = getIDs(Array.from(anchors))
        Download(generateList(ids), max + "events.txt")
    }
}
// usage, pass in the correct selector and the desired number of events as an argument

function generateList(ids) {
    const txt = "data:text/plain;charset=utf-8," + ids.join('\n')
    return encodeURI(txt)
}

function Download(url, filename) {
    const a = document.createElement('a')
    a.setAttribute('href', url)
    a.setAttribute('download', filename)
    a.click()
}

getEnoughData(100, selector)