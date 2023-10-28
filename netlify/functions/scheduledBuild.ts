import fetch from "node-fetch";
import { schedule } from "@netlify/functions";

const BUILD_HOOK = process.env.BUILD_HOOK as unknown as URL

/**
 * ? every day at 00:00
 */
export const handler = schedule('0 0 * * *', async () => {
    const res = await fetch(BUILD_HOOK, {
        method: "POST"
    })
    const data = await res.json()
    console.log(data)

    return {
        statusCode: 200
    }
})