export enum ContentTypes {
    JSON = 'application/json'
}

export enum RatelimitLimits {
    REQUEST_LIMIT_PER_INTERVAL = 100, // 100 requests
    RATELIMIT_INTERVAL = 60000 // 1 minute
}

export enum StatusCodes {
    SUCCESS = 200,
    RATELIMIT = 429
}

export enum HeaderNames {
    RATELIMIT_RESET = 'x-ratelimit-reset',
    RATELIMIT_REMAINING = 'x-ratelimit-remaining',
    RATELIMIT_LIMIT = 'x-ratelimit-limit',
    CONTENT_TYPE = 'content-type',
    USER_AGENT = 'user-agent'
}

export enum HttpRequestTypes {
    POST = 'POST',
    GET = 'GET'
}
