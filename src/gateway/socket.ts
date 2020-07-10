/* global WebSocket */

import { SocketManager } from './socketmanager';

import WebSocket, { ClientOptions } from 'ws';
import { BASE_URL } from '../rest/routes';
import { EventEmitter } from 'events';
import { SocketEvents, SUCCESS_CLOSE_CODE, OUTBOUND_MESSAGE_CODE, VIEWING_PROFILE_D} from './constants';

export interface SocketOptions {
  autoReconnect: boolean
  connectionTimeout: number
  webSocketOptions?: ClientOptions
}

interface PingData {
  resolve: Function
  reject: Function
}

export declare interface Socket {
  on(event: SocketEvents.CLOSE, listener: (code: number, reason: string) => void): this;
  on(event: SocketEvents.ERROR, listener: (err: Error) => void): this;
  on(event: SocketEvents.RAW, listener: (data: WebSocket.Data) => void): this;
  on(event: SocketEvents.OPEN, listener: () => void): this;
  on(event: string, listener: Function): this;
}

export class Socket extends EventEmitter {
    readonly pings: Map<string, PingData> = new Map<string, PingData>()
    private readonly _manager: SocketManager
    public socket!: WebSocket
    public subscribedTo: string
    private autoReconnect: boolean
    private options: SocketOptions

    constructor (manager: SocketManager, subscribe: string, options: SocketOptions) {
      super();
      this._manager = manager;
      this.subscribedTo = subscribe;
      this.autoReconnect = options.autoReconnect;
      this.options = options;

      this.connect(options.autoReconnect, options.webSocketOptions);
    }

    public close () {
      this.socket.close(SUCCESS_CLOSE_CODE, 'WebSocket connection closed by client');
    }

    public connect (autoReconnect: boolean, options?: ClientOptions) {
      this.socket = new WebSocket(`wss://${BASE_URL}bio_ws/?EIO=3&transport=websocket`, {
        ...options,
        perMessageDeflate: false,
        headers: {
          Connection: 'upgrade'
        }
      });
      this.initEvents(autoReconnect, options);
    }

    private initEvents (autoReconnect: boolean, options?: ClientOptions) {
      this.socket.on(SocketEvents.CLOSE, this.onClose.bind(this))
      this.socket.on(SocketEvents.ERROR, this.onError.bind(this));
      this.socket.on(SocketEvents.MESSAGE, this.onMessage.bind(this));
      this.socket.on(SocketEvents.OPEN, this.onOpen.bind(this));
    }

    public ping (timeout: number = 1000): Promise<number> {
      const nonce = `${Date.now()}.${Math.random().toString(36)}`;
      let timer: NodeJS.Timeout;
      return new Promise((resolve, reject) => {
        if (timeout) {
          timer = setTimeout(() => {
            this.pings.delete(nonce);
            reject(new Error(`Pong took longer than ${timeout}ms`));
          }, timeout);
        }

        const now = Date.now();
        // eslint-disable-next-line promise/param-names
        new Promise((res, rej) => {
          this.pings.set(nonce, { resolve: res, reject: rej });
          this.socket.ping(JSON.stringify({ nonce }));
        }).then(() => {
          clearTimeout(timer);
          resolve(Math.round(Date.now() - now));
        });
      });
    }

    private onClose(code: number, reason: string) {
      this.emit(SocketEvents.CLOSE, code, reason);
      if (this.autoReconnect && code !== SUCCESS_CLOSE_CODE) this.connect(this.autoReconnect, this.options.webSocketOptions);
    }

    private onError(err: Error) {
      console.error(err.message);
    }

    private onMessage(data: WebSocket.Data) {
      let event;
      if (typeof data !== 'string') throw new Error(`Non-JSON data returned from socket subscribed to ID: ${this.subscribedTo}`);

      // This code identifies where the packet status code ends and the json starts since socket.io sends data weirdly

      let jsonStartIndex = 0;
      let jsonStarted = false;

      data.split('').forEach(char => {
        if(!isNaN(parseInt(char)) && !jsonStarted) jsonStartIndex++;
        else jsonStarted = true;
      })

      data = data.slice(jsonStartIndex);

      if(!data) return;   // some packets are just numbers (usually 40), idk why yet

      try {
        event = JSON.parse(data);
      } catch (e) {
        console.log(data);
        throw new Error(`Invalid JSON returned from socket subscribed to ID: ${this.subscribedTo}`);
      }
      this.emit(SocketEvents.RAW, event);
    }

    private onOpen() {
      this.socket.send(`${OUTBOUND_MESSAGE_CODE}["${VIEWING_PROFILE_D}", "${this.subscribedTo}"]`);
      this.emit(SocketEvents.OPEN);
    }
}
