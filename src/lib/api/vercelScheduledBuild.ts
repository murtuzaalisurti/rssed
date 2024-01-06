import fetch from "node-fetch";

export default async function handler(req: any, res: any) {
    try {
        const hookres = await fetch(process.env.VERCEL_BUILD_HOOK as string, {
            method: 'POST'
        })

        const data = await hookres.json()

        res.status(200).end(JSON.stringify({
            response: data
        }))
    } catch (error) {
        res.status(500).end(JSON.stringify({
            error
        }))
    }
}