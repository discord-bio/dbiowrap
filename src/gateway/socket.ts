/* global WebSocket */

import { SocketManager } from './socketmanager';

import WebSocket, { ClientOptions } from 'ws';
import { BASE_URL } from '../routes';
import { EventEmitter } from 'events';
import { SocketEvents } from './constants';

export interface SocketOptions {
  autoReconnect: boolean
  connectionTimeout: number
  webSocketOptions?: ClientOptions
}

export declare interface Socket {
  on(event: SocketEvents.CLOSE, listener: (code: number, reason: string) => void): this;
  on(event: SocketEvents.ERROR, listener: (err: Error) => void): this;
  on(event: SocketEvents.RAW, listener: (data: WebSocket.Data) => void): this;
  on(event: SocketEvents.OPEN, listener: () => void): this;
  on(event: string, listener: Function): this;
}

export class Socket extends EventEmitter {
    private manager: SocketManager
    private socket!: WebSocket
    public subscribedTo: string

    constructor (manager: SocketManager, subscribe: string, options: SocketOptions) {
      super();
      this.manager = manager;
      this.subscribedTo = subscribe;

      this.connect(options.autoReconnect, options.webSocketOptions);
    }

    public connect (autoReconnect: boolean, options?: ClientOptions) {
      this.socket = new WebSocket(BASE_URL, {
        ...options,
        headers: {} // TBD
      });
      this.initEvents(autoReconnect, options);
    }

    private initEvents (autoReconnect: boolean, options?: ClientOptions) {
      this.socket.on(SocketEvents.CLOSE, (code, reason) => {
        this.emit(SocketEvents.CLOSE, code, reason);
        if (autoReconnect) this.connect(autoReconnect, options);
      });

      this.socket.on(SocketEvents.ERROR, (err) => this.emit(SocketEvents.ERROR, err));
      this.socket.on(SocketEvents.MESSAGE, (data) => {
        this.emit(SocketEvents.RAW, data);
      });
      this.socket.on(SocketEvents.OPEN, () => this.emit(SocketEvents.OPEN));
    }
}
