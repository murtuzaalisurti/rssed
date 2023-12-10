import Parser from "rss-parser";

export const ParseRSS = async (url: string) => {
    return await new Parser({
        timeout: 120000
    }).parseURL(url)
}

export const allFeeds = async (list: { id: string, url: string }[]) => {
    const feeds = [];

    for (const site of list) {
        try {
            const feed = {
                ...await ParseRSS(site.url),
                id: site.id
            }
            feeds.push(feed)
        } catch (error) {
            console.error(error)
        }
    }

    return feeds
}

