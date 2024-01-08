## How to contribute?

- If you have a RSS feed suggestion which can be added in this blogroll, feel free to create a new issue by selecting the [`Add new feed` template](https://github.com/murtuzaalisurti/rssed/issues/new?assignees=&labels=&projects=&template=add-a-new-feed.md&title=%5BFEED%5D%3A+) and then adding the details as mentioned in that template.
- Once that's reviewed, you can raise a PR by adding the details in `/src/data/feedlist.ts`. Just add a new object at the end with a random uuid, and the RSS feed url.
- You can generate a random uuid by running and logging `crypto.randomUUID()` in browser console.
