export enum SocketEvents {
    CLOSE = 'close',
    ERROR = 'error',
    MESSAGE = 'message',
    OPEN = 'open',
    RAW = 'raw'
}

export enum SocketManagerEvents {
    METRICS = 'metrics',
    PROFILE_UPDATE = 'profileUpdate',
    SUBSCRIBE = 'subscribe',
    UNSUBSCRIBE = 'unsubscribe'
}