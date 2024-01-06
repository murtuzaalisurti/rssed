import feedlist from "../../data/feedlist"

export const fetchFeeds = async (request: Record<string, any>) => {
    const feedId = request.feedId;

    try {

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
        if(error instanceof Error) {
            throw Error (
                JSON.stringify({
                    method: request.method,
                    message: error.message,
                    status: 500,
                })
            )
        } else {
            throw new Error (
                JSON.stringify({
                    method: request.method,
                    message: "Someting went wrong",
                    status: 500,
                })
            )
        }
    }
}