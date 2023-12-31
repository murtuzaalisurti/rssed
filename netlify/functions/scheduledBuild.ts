import fetch from "node-fetch";
import { schedule } from "@netlify/functions";

const BUILD_HOOK = process.env.BUILD_HOOK as unknown as URL

/**
 * ? every day at 00:00
 */
export const handler = schedule('0 0 * * *', async () => {
    try {
        const res = await fetch(BUILD_HOOK, {
            method: "POST"
        })

        console.log(res)
        return {
            statusCode: 200
        }
    } catch (error) {
        console.log(error)

        return {
            statusCode: 500
        }
    }

})