import postgres from 'postgres'
const { DB, DB_HOST, DB_USERNAME, DB_PASSWORD } = import.meta.env

const connectDatabase = () => {
    return postgres("postgres://username:password@host/database?sslmode=require", {
        database: DB,
        host: DB_HOST,
        username: DB_USERNAME,
        password: DB_PASSWORD
    })
}

export const fetchData = async () => {
    try {
        const client = connectDatabase()

        /**
         * TODO: OR const query = await client<[{ id: string, url: string }]>`select * from freed.feed_list;`
         */
        const queryResult = await client.file<[{ id: string, url: string }]>('./src/data/sql/getListOfFeeds.sql')
        return queryResult
    } catch (err) {
        console.log(err)
    }
}
