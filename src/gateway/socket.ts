/* global WebSocket */

import { SocketManager } from './socketmanager';

import WebSocket, { ClientOptions } from 'ws';
import { BASE_URL } from '../routes';
import { EventEmitter } from 'events';

export interface SocketOptions {
  autoReconnect: boolean
  connectionTimeout: number
  webSocketOptions?: ClientOptions
}

export declare interface Socket {
  on(event: 'close', listener: (code: number, reason: string) => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
  on(event: 'raw', listener: (data: WebSocket.Data) => void): this;
  on(event: 'open', listener: () => void): this;
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
      this.socket.on('close', (code, reason) => {
        this.emit('close', code, reason);
        if (autoReconnect) this.connect(autoReconnect, options);
      });

      this.socket.on('error', (err) => this.emit('error', err));
      this.socket.on('message', (data) => {
        this.emit('raw', data);
      });
      this.socket.on('open', () => this.emit('open'));
    }
}
