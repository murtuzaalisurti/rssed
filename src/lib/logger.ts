import { createConsola } from "consola";

const loggerInstance = () => {
    const consola = createConsola({
        // @ts-ignore
        fancy: true,
        formatOptions: {
            colors: true,
            date: true
        }
    })
    consola.wrapConsole()
    return consola
}

export const logger = loggerInstance()
