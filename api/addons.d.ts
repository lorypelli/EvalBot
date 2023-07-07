export interface Runtimes {
    language: string,
    version: number,
    aliases: string[]
}
export interface PackageSize {
    name: string,
    version: string,
    publish: {
        pretty: string
    }
    install: {
        pretty: string
    }
}
export interface PackageName {
    package: {
        name: string
    }
}
export interface Result {
    run: {
        output: string,
        code: string
    }
}
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PASSWORD: string,
            TOKEN: string,
            PUBLIC_KEY: string,
            ID: string,
            TOPGG: string,
            DBL: string
        }
    }
}