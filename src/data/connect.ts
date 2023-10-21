import postgres from 'postgres'
const { DB, DB_HOST, DB_USERNAME, DB_PASSWORD } = import.meta.env

export const connectDatabase = () => {
    return postgres("postgres://username:password@host/database?sslmode=require", {
        database: DB,
        host: DB_HOST,
        username: DB_USERNAME,
        password: DB_PASSWORD
    })
}