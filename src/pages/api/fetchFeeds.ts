import type { APIRoute } from "astro"
import { connectDatabase } from "../../data/connect"
import { SQL_QUERY_BASE_PATH } from "../../lib/constants"
import path from "path"
// import { PostgresError } from "postgres"

export const GET: APIRoute = async ({ request }) => {
    const client = connectDatabase()
    const queryParams = new URLSearchParams(request.url.split("?")[1])
    const feedId = queryParams.get('id');
    const file = feedId ? `getSingleFeed` : `getListOfFeeds`

    try {
        const queryResult = feedId 
            ? await client.file<[{ id: string, url: string }]>(`${SQL_QUERY_BASE_PATH}/${file}.sql`, [`${feedId}`]) 
            : await client.file<[{ id: string, url: string }]>(`${path.resolve(process.cwd(), '../../../src/data/sql')}/${file}.sql`);
    
        await client.end();
        
        return new Response(
            JSON.stringify({
                message: "Success",
                status: 200,
                method: request.method,
                data: queryResult
            })
        )
    } catch (error) {
        await client.end()

        // if(error instanceof PostgresError) {
        //     return new Response(
        //         JSON.stringify({
        //             method: request.method,
        //             code: error.code,
        //             cause: error.cause,
        //             message: error.message,
        //             hint: error.hint,
        //             where: error.where,
        //             query: error.query
        //         }),
        //         {
        //             status: 400,
        //         }
        //     )

            
        // } else if(error instanceof Error) {
        //     return new Response(
        //         JSON.stringify({
        //             method: request.method,
        //             message: error.message
        //         }),
        //         {
        //             status: 500,
        //         }
        //     )
        // } else {
        //     return new Response(
        //         JSON.stringify({
        //             method: request.method,
        //             message: "Someting went wrong"
        //         }),
        //         {
        //             status: 500,
        //         }
        //     )
        // }

        return new Response(
            JSON.stringify({
                method: request.method,
                message: "Someting went wrong",
                error
            }),
            {
                status: 500,
            }
        )
    }
}