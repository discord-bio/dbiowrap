import { Socket } from './socket';
import { EventEmitter } from 'events';
import * as GatewayEvents from './gatewayevents';
import { ClientOptions } from 'ws';
import { SocketManagerEvents } from './constants';

export const AUTO_RECONNECT_DEFAULT = true;
export const CONNECTION_TIMEOUT_DEFAULT = 10000;

export interface SocketManagerOptions {
    autoReconnect?: boolean
    connectionTimeout?: number
    subscribe?: string[]
    webSocketOptions?: ClientOptions
}

export declare interface SocketManager {
  on(event: SocketManagerEvents.METRICS, listener: (data: GatewayEvents.Metrics) => void): this;
  on(event: SocketManagerEvents.PROFILE_UPDATE, listener: (data: GatewayEvents.ProfileUpdate) => void): this;
  on(event: SocketManagerEvents.SUBSCRIBE, listener: (data: GatewayEvents.Subscribe) => void): this;
  on(event: SocketManagerEvents.UNSUBSCRIBE, listener: (data: GatewayEvents.Unsubscribe) => void): this;
  on(event: string, listener: Function): this;
}

export class SocketManager extends EventEmitter {
    private _autoReconnect: boolean
    private _connectionTimeout: number
    public sockets: Map<string, Socket> = new Map<string, Socket>()
    constructor (options: SocketManagerOptions = {}) {
      super();
      this._autoReconnect = options.autoReconnect || AUTO_RECONNECT_DEFAULT;
      this._connectionTimeout = options.connectionTimeout || CONNECTION_TIMEOUT_DEFAULT;
      if (options.subscribe) {
        options.subscribe.forEach((subscription) => {
          this.sockets.set(subscription, new Socket(this, subscription, {
            autoReconnect: this._autoReconnect,
            connectionTimeout: this._connectionTimeout,
            webSocketOptions: options.webSocketOptions
          }));
        });
      }
    }
}
