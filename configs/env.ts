type LogLevels = 'all' | 'mark' | 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'off'

interface EnvConfigType {
    NODE_ENV: 'development' | 'production' | 'test'
    SERVER_NAME: string
    PORT: string
    LOG_LEVEL?: LogLevels
    TRACE_LOG_LEVEL?: LogLevels
    DEV_LOG_LEVEL?: LogLevels
    AUDIT_LOG_LEVEL?: LogLevels
    DB_URL: string
    // ...
}
const developConfig: EnvConfigType = {
    NODE_ENV: 'development',
    SERVER_NAME: 'cemeta server',
    PORT: '3003',
    LOG_LEVEL: 'all',
    TRACE_LOG_LEVEL: 'all',
    DEV_LOG_LEVEL: 'all',
    AUDIT_LOG_LEVEL: 'all',
    DB_URL: ''
    // ...
};

export const getENV = <K extends keyof EnvConfigType>(env: K): EnvConfigType[K] => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return process.env[env] || developConfig[env];
};
