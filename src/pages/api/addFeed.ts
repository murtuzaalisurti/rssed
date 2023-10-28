import type { APIRoute } from "astro"
import { connectDatabase } from "../../data/connect"
import { SQL_QUERY_BASE_PATH } from "../../lib/constants"
import { PostgresError } from "postgres"

export const POST: APIRoute = async ({ request }) => {
    const body = await request.json()
    const feedUrl = body.url
    const client = connectDatabase()

    try {
        const queryResult = await client.file(`${SQL_QUERY_BASE_PATH}/insertFeed.sql`, [`${feedUrl}`])
        await client.end()

        return new Response(
            JSON.stringify({
                message: "Created",
                method: request.method,
                data: queryResult
            }),
            {
                status: 201
            }
        )

    } catch (error) {
        await client.end()
        // if (error instanceof PostgresError) {
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
        //             status: 409,
        //         }
        //     )
        // } else if (error instanceof Error) {
        //     return new Response(
        //         JSON.stringify({
        //             method: request.method,
        //             message: error.message
        //         }),
        //         {
        //             status: 409,
        //         }
        //     )
        // } else {
        //     return new Response(
        //         JSON.stringify({
        //             method: request.method,
        //             message: "Someting went wrong"
        //         }), {
        //             status: 500
        //         }
        //     )
        // }
        return new Response(
            JSON.stringify({
                method: request.method,
                message: "Someting went wrong",
                error
            }), {
                status: 500
            }
        )
    }
}