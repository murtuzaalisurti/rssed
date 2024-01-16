import feedlist from "../../data/feedlist.json"

const hasDuplicate = (list: Record<string, any>[], prop: string): boolean => {
    let uniqueSet = new Set()
    return list.some((obj) => uniqueSet.size === uniqueSet.add(obj[prop]).size)
}

const validateFeeds = (feedlist: { id: string, url: string }[]) => {
    const hasDuplicateIDs = hasDuplicate(feedlist, "id")
    const hasDuplicateURLs = hasDuplicate(feedlist, "url")

    if (hasDuplicateIDs || hasDuplicateURLs) {
        throw new Error("Found duplicate records in the feed list!")
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