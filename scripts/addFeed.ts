import fs from 'fs'
import { randomUUID } from 'crypto';
import prompts, { type PromptObject } from 'prompts'
import { logger } from '../src/lib/logger.ts';

const feedlist: { id: string, url: string }[] = JSON.parse(
    fs.readFileSync(new URL("../src/data/feedlist.json", import.meta.url)) as unknown as string
);

const updatedFeeds = (feeds: { id: string, url: string }[], url: string) => {
    return [
        ...feeds,
        {
            id: randomUUID(),
            url
        }
    ]
}

async function ask() {
    const askPrompts: PromptObject<string>[] = [
        {
            type: "text",
            name: "url",
            message: "Feed URL: ",
        }
    ]
    const onCancel = () => { throw Error("Cancelled..") }
    return await prompts(askPrompts, { onCancel })
}

const { url } = await ask();

fs.writeFileSync(
    "./src/data/feedlist.json",
    JSON.stringify(
        updatedFeeds(feedlist, url),
        null,
        2
    ),
    {
        encoding: 'utf8'
    }
)

logger.success(`Added feed "${url}"`)