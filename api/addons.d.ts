
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
export interface AuthResult {
    token_type: string,
    access_token: string,
    expires_in: number,
    refresh_token: string,
    scope: string
}
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            CLIENT_SECRET: string,
            PASSWORD: string,
            TOKEN: string,
            PUBLIC_KEY: string,
            ID: string,
            TOPGG: string,
            DBL: string
        }
    }
}