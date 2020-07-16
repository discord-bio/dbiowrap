export const BASE_URL = 'api.discord.bio/bio_ws';

export enum SocketEvents {
    CLOSE = 'close',
    ERROR = 'error',
    MESSAGE = 'message',
    OPEN = 'open',
    RAW = 'raw'
}

export const BANNER_URL_PARAM = ':uid';
export const BANNER_URL = `https://s3.eu-west-2.amazonaws.com/discord.bio/banners/${BANNER_URL_PARAM}`;

export const SUCCESS_CLOSE_CODE = 1000;

export const OUTBOUND_MESSAGE_CODE = '42';
export const PONG_MESSAGE_CODE = '3';

export const VIEWING_PROFILE_D = 'VIEWING';

export const HEARTBEAT_INTERVAL = 25000;

export enum OpCodes {
    PING = 2
}

export type Packet = [string, any]

export const CONNECT_ARGS = {
  transport: 'websocket',
  engineIoVersion: '3'
};

export enum GatewayEventNames {
  PRESENCE = 'PRESENCE',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  TOTAL_VIEWING = 'TOTAL_VIEWING',
  VIEWING = 'VIEWING',
  BANNER_UPDATE = 'BANNER_UPDATE',
  SUBSCRIBE = 'SUBSCRIBE',
  UNSUBSCRIBE = 'UNSUBSCRIBE',
  METRICS = 'METRICS'
};
