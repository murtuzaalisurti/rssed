import { connectDatabase } from "../../data/connect"
import { SQL_QUERY_BASE_PATH } from "../../lib/constants"

export const fetchFeeds = async (request: Record<string, any>) => {
    const client = connectDatabase()
    const queryParams = new URLSearchParams(request.url.split("?")[1])
    const feedId = queryParams.get('id');
    const file = feedId ? `getSingleFeed` : `getListOfFeeds`

    try {
        const queryResult = feedId 
            ? await client.file<[{ id: string, url: string }]>(`${SQL_QUERY_BASE_PATH}/${file}.sql`, [`${feedId}`]) 
            : await client.file<[{ id: string, url: string }]>(`${SQL_QUERY_BASE_PATH}/${file}.sql`);
    
        await client.end();
        
        return (
            JSON.stringify({
                message: "Success",
                status: 200,
                method: request.method,
                data: queryResult
            })
        )
    } catch (error) {
        await client.end()

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