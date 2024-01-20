import feedlist from "../../data/feedlist.json"

const hasDuplicate = (list: Record<string, any>[], prop: string): boolean => {
    let uniqueSet = new Set()
    return list.some((obj) => uniqueSet.size === uniqueSet.add(obj[prop]).size)
}

const getDuplicate = (list: Record<string, any>[], prop: string): string[] => {
    return [
        ...new Set(list.map(fl => fl[prop]).filter((f, i, arr) => arr.indexOf(f) !== i))
    ]
}

const validateFeeds = (feedlist: { id: string, url: string }[]) => {
    const hasDuplicateIDs = hasDuplicate(feedlist, "id")
    const hasDuplicateURLs = hasDuplicate(feedlist, "url")

    if (hasDuplicateIDs || hasDuplicateURLs) {
        let duplicateIds = getDuplicate(feedlist, "id")
        let duplicateURLs = getDuplicate(feedlist, "url")
        throw new Error(JSON.stringify({
            message: `Found duplicate records in the feed list!`,
            duplicateIds,
            duplicateURLs
        }, null, 2))
    }
}

export const fetchFeeds = async (request: Record<string, any>) => {

    try {
        validateFeeds(feedlist);
        const feedId = request.feedId;

        const result = feedId ? (
            [feedlist.find((feed) => feed.id === feedId)]
        ) : (
            feedlist
        )

        return (
            JSON.stringify({
                message: "Success",
                status: 200,
                method: request.method,
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