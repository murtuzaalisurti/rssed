import Parser from "rss-parser";

export const ParseRSS = async (url: string) => {
    return await new Parser().parseURL(url)
}

export const allFeeds = async (list: { id: string, url: string }[]) => {
    return Promise.all(
        list.map(async (site) => {
            return await ParseRSS(site.url)
        })
    )
}