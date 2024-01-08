import Parser, { type Output } from "rss-parser";
import dayjs from "dayjs";

let feeds: {
    time: string | null
    items: (Output<{ [key: string]: any }> & { id: string })[]
} = {
    time: null,
    items: []
};

export const ParseRSS = async (url: string) => {
    return await new Parser({
        timeout: 120000
    }).parseURL(url)
}

const parseAndStoreFeeds = async (list: { id: string, url: string }[]) => {

    const feedPromises = list.map(async (site) => {
        console.time(`time for feed: ${site.url}`)
    
        try {
            const feed = {
                ...await ParseRSS(site.url),
                id: site.id
            }
            console.timeEnd(`time for feed: ${site.url}`)
            return feed
        } catch (error) {
            console.error({
                feed: {
                    id: site.id,
                    url: site.url,
                },
                error
            })
            console.timeEnd(`time for feed: ${site.url}`)
        }
    })

    Promise.allSettled(feedPromises)

    for await (const feed of feedPromises) {
        feed && feeds.items.push(feed)
    }
}

export const allFeeds = async (list: { id: string, url: string }[]) => {

    if (!feeds.time) {
        await parseAndStoreFeeds(list)
        feeds.time = dayjs().toISOString()
    } else {
        console.log(`cache time: ${dayjs(dayjs().toISOString()).diff(dayjs(feeds.time), 'milliseconds')} ms`)

        if (dayjs(dayjs().toISOString()).diff(dayjs(feeds.time)) > 120000) {
            await parseAndStoreFeeds(list)
        }
    }

    return feeds.items
}

