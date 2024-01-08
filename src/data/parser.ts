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

export const allFeeds = async (list: { id: string, url: string }[]) => {

    if (!feeds.time) {
        for (const site of list) {
            console.time(`time for feed: ${site.url}`)
            try {
                const feed = {
                    ...await ParseRSS(site.url),
                    id: site.id
                }
                feeds.items.push(feed)
            } catch (error) {
                console.error({
                    feed: {
                        id: site.id,
                        url: site.url,
                    },
                    error
                })
            }
            console.timeEnd(`time for feed: ${site.url}`)
        }
        feeds.time = dayjs().toISOString()
    } else {
        console.log(`cache time: ${dayjs(dayjs().toISOString()).diff(dayjs(feeds.time), 'milliseconds')}`)

        if (dayjs(dayjs().toISOString()).diff(dayjs(feeds.time)) > 120000) {
            for (const site of list) {
                console.time(`time for feed: ${site.url}`)
                try {
                    const feed = {
                        ...await ParseRSS(site.url),
                        id: site.id
                    }
                    feeds.items.push(feed)
                } catch (error) {
                    console.error({
                        feed: {
                            id: site.id,
                            url: site.url,
                        },
                        error
                    })
                }
                console.timeEnd(`time for feed: ${site.url}`)
            }
            feeds.time = dayjs().toISOString()
        }
    }

    return feeds.items
}

