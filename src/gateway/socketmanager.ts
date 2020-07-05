import { Socket } from './socket';
import { ClientOptions } from 'ws';
import { Collection } from '../collection';

export const AUTO_RECONNECT_DEFAULT = true;
export const CONNECTION_TIMEOUT_DEFAULT = 10000;

export interface SocketManagerOptions {
    autoReconnect?: boolean
    connectionTimeout?: number
    subscribe?: string[]
    webSocketOptions?: ClientOptions
}

export class SocketManager {
    private _autoReconnect: boolean
    private _connectionTimeout: number
    private _webSocketOptions?: ClientOptions
    public sockets: Collection<string, Socket> = new Collection<string, Socket>()

    constructor (options: SocketManagerOptions = {}) {
      this._autoReconnect = options.autoReconnect || AUTO_RECONNECT_DEFAULT;
      this._connectionTimeout = options.connectionTimeout || CONNECTION_TIMEOUT_DEFAULT;
      this._webSocketOptions = options.webSocketOptions;
      if (options.subscribe) {
        options.subscribe.forEach((subscription) => {
          this.sockets.set(subscription, new Socket(this, subscription, {
            autoReconnect: this._autoReconnect,
            connectionTimeout: this._connectionTimeout,
            webSocketOptions: this._webSocketOptions
          }));
        });
      }
    }

    public closeAll() {
      this.sockets.map((socket) => {
        socket.close();
      })
    }

    public openAll() {
      this.sockets.map((socket) => {
        socket.connect(this._autoReconnect, this._webSocketOptions)
      })
    }
    
    public subscribe(id: string) {
      this.sockets.set(id, new Socket(this, id, {
        autoReconnect: this._autoReconnect,
        connectionTimeout: this._connectionTimeout,
        webSocketOptions: this._webSocketOptions
      }))
    }

    public unsubscribe(id: string) {
      const socket = this.sockets.get(id);
      if(!socket) throw new Error('No socket is subscribed to this ID');
      socket.close();
    }

    public unsubscribeAll() {
      this.sockets.map((socket, key) => {
        socket.close();
        this.sockets.delete(key);
      })
    }
}
