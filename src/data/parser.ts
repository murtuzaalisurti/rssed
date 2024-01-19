import Parser, { type Output } from "rss-parser";
import dayjs from "dayjs";
import { logger } from "../lib/logger";
import { colors } from "consola/utils";

type feedItem = Output<{ [key: string]: any }> & { id: string };

const feeds: {
    time: string | null
    items: feedItem[]
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
            let feed: feedItem;
            if (!feeds.items.some(i => i.id === site.id)) {
                feed = {
                    ...await ParseRSS(site.url),
                    id: site.id
                }
            } else {
                feed = feeds.items.find(i => i.id === site.id) as feedItem
                console.warn(`\nfeed already exists ✅`)
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

    const fetchedFeedsLog = `Fetched ${feeds.items.length} feeds successfully out of ${list.length} feeds!`
    logger.ready(`${feeds.items.length === list.length ? colors.green(fetchedFeedsLog) : colors.yellow(fetchedFeedsLog)}`)

    const failedToFetchFeeds = list.filter(f => !feeds.items.map(i => i.id).includes(f.id))
    failedToFetchFeeds.length > 0 && logger.warn(`${colors.yellow(`Failed feeds\n`)}${JSON.stringify(failedToFetchFeeds, null, 2)}`)
}

export const allFeeds = async (list: { id: string, url: string }[]) => {

    if (!feeds.time) {
        await parseAndStoreFeeds(list)
        feeds.time = dayjs().toISOString()
    } else {
        logger.info(`${colors.yellow(`cache time exhausted: ${parseFloat(dayjs(dayjs().toISOString()).diff(dayjs(feeds.time), 'm', true).toString()).toFixed(2)} min`)}`)

        if (dayjs(dayjs().toISOString()).diff(dayjs(feeds.time), 'millisecond') > cacheTime) {
            logger.warn(`cache time: ${colors.yellow(`${parseFloat(dayjs(dayjs().toISOString()).diff(dayjs(feeds.time), 'm', true).toString()).toFixed(2)} min`)} exceeded ${colors.blue(parseFloat((cacheTime / 60000).toString()).toFixed(2))} min, ${colors.green('re-fetching feeds...')}`)
            feeds.items.length = 0
            await parseAndStoreFeeds(list)
            feeds.time = dayjs().toISOString()
        }
    }

    return feeds.items
}

