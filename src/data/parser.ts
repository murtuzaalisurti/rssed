import Parser, { type Output } from "rss-parser";
import dayjs from "dayjs";
import { logger } from "../lib/logger";
import { colors } from "consola/utils";

let feeds: {
    time: string | null
    items: (Output<{ [key: string]: any }> & { id: string })[]
} = {
    time: null,
    items: []
};

const cacheTime = 1800000 // in milliseconds

export const ParseRSS = async (url: string) => {
    return await new Parser({
        timeout: 120000
    }).parseURL(url)
}

const parseAndStoreFeeds = async (list: { id: string, url: string }[]) => {
    logger.start("Fetching feeds...\n")

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
            logger.error({
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
        feed && (
            !feeds.items.some(i => i.id === feed.id) && feeds.items.push(feed)
        )
    }
    logger.success(`${colors.green('Fetched feeds successfully')}! ${colors.italic('Although there might be some feeds which resulted in an error.')}\n`)
}

export const allFeeds = async (list: { id: string, url: string }[]) => {

    if (!feeds.time) {
        await parseAndStoreFeeds(list)
        feeds.time = dayjs().toISOString()
    } else {
        if (dayjs(dayjs().toISOString()).diff(dayjs(feeds.time)) > cacheTime) {
            logger.warn(`cache time: ${colors.yellow(`${dayjs(dayjs().toISOString()).diff(dayjs(feeds.time), 'milliseconds')} ms`)} exceeded ${colors.blue(cacheTime)} ms (30 min), ${colors.green('re-fetching feeds...')}`)
            await parseAndStoreFeeds(list)
        }
    }

    return feeds.items
}

