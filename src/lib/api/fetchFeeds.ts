import FeedList from "../../data/feedlist.json" assert { type: 'json' }

const hasDuplicate = (list: Record<string, any>[], prop: string): boolean => {
    let uniqueSet = new Set()
    return list.some((obj) => uniqueSet.size === uniqueSet.add(obj[prop]).size)
}

const getDuplicate = (list: Record<string, any>[], prop: string): string[] => {
    return [
        ...new Set(list.map(fl => fl[prop]).filter((f, i, arr) => arr.indexOf(f) !== i))
    ]
}

export const validateFeeds = (feedlist: { id: string, url: string }[]) => {
    /**
     * ? feedlist having hostname extracted from the url for duplication check
     */
    const feedListWithOnlyHostname = feedlist.map(feed => ({
        id: feed.id,
        url: `${new URL(feed.url).hostname}${new URL(feed.url).pathname}`
    }))
    const hasDuplicateIDs = hasDuplicate(feedListWithOnlyHostname, "id")
    const hasDuplicateURLs = hasDuplicate(feedListWithOnlyHostname, "url")

    if (hasDuplicateIDs || hasDuplicateURLs) {
        let duplicateIds = getDuplicate(feedListWithOnlyHostname, "id")
        let duplicateURLs = getDuplicate(feedListWithOnlyHostname, "url")
        throw new Error(JSON.stringify({
            message: `Found duplicate records in the feed list!`,
            duplicateIds,
            duplicateURLs
        }, null, 2))
    }
}

export const fetchFeeds = async (feedId?: string) => {
    try {
        validateFeeds(FeedList);

        const result = feedId ? (
            [FeedList.find((feed) => feed.id === feedId)]
        ) : (
            FeedList
        );

        return (
            JSON.stringify({
                message: "Success",
                status: 200,
                data: result
            })
        )
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message, { cause: error })
        } else {
            throw new Error("Something went wrong!", { cause: error })
        }
    }
}