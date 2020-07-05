/* global WebSocket */

import { SocketManager } from './socketmanager';

import WebSocket, { ClientOptions } from 'ws';
import { BASE_URL } from '../rest/routes';
import { EventEmitter } from 'events';
import { SocketEvents, SUCCESS_CLOSE_CODE } from './constants';

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

    public close() {
      this.socket.close(SUCCESS_CLOSE_CODE, 'WebSocket connection closed by client');
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
        if (autoReconnect && code !== SUCCESS_CLOSE_CODE) this.connect(autoReconnect, options);
      });

      this.socket.on(SocketEvents.ERROR, (err) => this.emit(SocketEvents.ERROR, err));
      
      this.socket.on(SocketEvents.MESSAGE, (data) => {
        let event;
        if(typeof data !== 'string') throw new Error(`Non-JSON data returned from socket subscribed to ID: ${this.subscribedTo}`)
        try {
          event = JSON.parse(data);
        } catch(e) {
          throw new Error(`Invalid JSON returned from socket subscribed to ID: ${this.subscribedTo}`)
        }
        this.emit(SocketEvents.RAW, event);
      });

      this.socket.on(SocketEvents.OPEN, () => this.emit(SocketEvents.OPEN));
    }
}
