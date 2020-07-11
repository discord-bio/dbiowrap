export enum SocketEvents {
    CLOSE = 'close',
    ERROR = 'error',
    MESSAGE = 'message',
    OPEN = 'open',
    RAW = 'raw',
}

export const SUCCESS_CLOSE_CODE = 1000;

export const OUTBOUND_MESSAGE_CODE = 42;

export const VIEWING_PROFILE_D = 'VIEWING';

export const HEARTBEAT_INTERVAL  = 25000;

export enum OpCodes {
    PING = 2
}

export type Packet = [string, any]

export const KNOWN_PACKETS = [
    "PRESENCE",
    "PROFILE_UPDATE",
    "TOTAL_VIEWING",
    "VIEWING",
    "BANNER_UPDATE",
    "SUBSCRIBE",
    "UNSUBSCRIBE",
    "METRICS"
]