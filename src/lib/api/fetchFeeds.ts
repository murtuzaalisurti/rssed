import FeedList from "../../data/feedlist.json" with { type: 'json' }

/**
 * @explain
 * It takes in the list `{ id: string, url: string }[]` array and then
 * creates a new Set object instance, iterates over the list,
 * compares the current size of the Set with the size after adding a new element.
 * 
 * If the element is a duplicate, the Set won't add it to itself and the size won't change,
 * so, the previous size and the new size after adding that element will remain same.
 * The condition would then be true and we would come to know if there is a duplicate or not
 * using the `some` method in javascript.
 * @param list - An array of { id, url }
 * @param prop - Property to be checked - either `id` or `url`
 * @returns { boolean } true/false depending on whether the list contains some dupes or not.
 */
const hasDuplicate = (list: Record<string, any>[], prop: string): boolean => {
    let uniqueSet = new Set()
    return list.some((obj) => uniqueSet.size === uniqueSet.add(obj[prop]).size)
}

/**
 * @explain
 * It takes in the list `{ id: string, url: string }[]` array and then
 * maps it to an array containing just the passed property `(example: id => { id: string }[])` and then
 * finds the duplicate element by comparing the index of the curr element with the index of the first occurrence of that element,
 * if the index of the first occurence of the element is different than the index of the current element, then
 * it means the element has existed before in the array
 * 
 * For example: in the array `[3,12,9]` if you add 12 again, then the first occurence index will be 1 and not 3
 * a filter is used to do this comparision as we want to get all duplicate values
 * there can be multiple duplicate values returned from the filter
 * for example, `[33,33,67,23]` => all of these are duplicate values returned by the filter
 * we can pass it into a Set to just get the `"unique duplicate"` values.
 * 
 * @param list - An array of { id, url }
 * @param prop - Property to be checked - either `id` or `url`
 * @returns An array containing *unique duplicate* values
 */
const getDuplicate = (list: Record<string, any>[], prop: string): string[] => {
    return [
        ...new Set(list.map(fl => fl[prop]).filter((f, i, arr) => arr.indexOf(f) !== i))
    ]
}

export const validateFeeds = (feedlist: { id: string, url: string }[]) => {
    /**
     * ? feedlist having hostname extracted from the url for duplication check
     */
    const feedListWithOnlyHostname = feedlist.map(feed => {
        const hostname = new URL(feed.url).hostname;
        const pathname = new URL(feed.url).pathname;
        const parsedHostname = hostname.replace(/^www\./, '');

        return {
            id: feed.id,
            url: `${parsedHostname}${pathname}`
        }
    });

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

export const getFeedList = async (feedId?: string) => {
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