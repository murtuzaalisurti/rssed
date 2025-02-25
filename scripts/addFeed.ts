import fs from 'fs'
import { v7 } from 'uuid';
import prompts, { type PromptObject } from 'prompts'
import { logger } from '../src/lib/logger.ts'
import { validateFeeds } from '../src/lib/api/fetchFeeds.ts'
import { tryCatch } from '../src/lib/utils/try-catch.ts';

interface Feed {
    id: string
    url: string
}

const [_, __, ...args] = process.argv;

const readFeedList = () => {
    const feedlist: Feed[] = JSON.parse(
        fs.readFileSync(new URL("../src/data/feedlist.json", import.meta.url)) as unknown as string
    );
    return feedlist;
}

const writeUpdatedFeedList = (updatedFeedList: Feed[], urls: string[]) => {
    logger.start(`Writing ${urls.length} feed(s) to feedlist.json...`)

    fs.writeFileSync(
        "./src/data/feedlist.json",
        JSON.stringify(
            updatedFeedList,
            null,
            2
        ),
        {
            encoding: 'utf8'
        }
    )
}

const updatedFeeds = (feeds: Feed[], urls: string[]) =>
    feeds.concat(urls.map(url => ({ id: v7(), url })));

const validatingFeeds = (urls: string[]) => {
    logger.start(`Validating ${urls.length} feed(s)...`)
    const feedList = readFeedList()
    const updatedFeedList = updatedFeeds(feedList, urls)

    validateFeeds(updatedFeedList)

    logger.success(`Validated ${urls.length} feed(s), ready to be added to feedlist.json`)

    return updatedFeedList
}

async function ask() {
    const askPrompts: PromptObject<string>[] = [
        {
            type: "list",
            name: "url",
            message: "Feed URL(s): ",
            initial: '',
            separator: ','
        }
    ]
    const onCancel = () => { throw Error("Cancelled..") }
    return await prompts(askPrompts, { onCancel })
}


async function run() {
    const { url: urls } = await ask()

    const updatedFeedList = validatingFeeds(urls)
    
    if (!args.find(arg => arg === "dry")) {
        writeUpdatedFeedList(updatedFeedList, urls)
    }

    return urls
}

tryCatch<string[]>(run())
    .then(({ data, error }) => {
        if (error) {
            return logger.error(error.message)
        }

        logger.success(`Added feed(s): \n\t- ${data.join("\n\t- ")}`)
    })
