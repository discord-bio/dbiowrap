/* global WebSocket */

import { SocketManager } from './socketmanager';

import WebSocket, { ClientOptions } from 'ws';
import { BASE_URL, SocketEvents, SUCCESS_CLOSE_CODE, OUTBOUND_MESSAGE_CODE, VIEWING_PROFILE_D, OpCodes, Packet, CONNECT_ARGS } from './constants';
import { EventEmitter } from 'events';

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
  on(event: SocketEvents.RAW, listener: (data: [string, any]) => void): this;
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

      this.connect(options.webSocketOptions);
    }

    public close () {
      this.socket.close(SUCCESS_CLOSE_CODE, 'WebSocket connection closed by client');
    }

    public connect (options?: ClientOptions) {
      this.socket = new WebSocket(`wss://${BASE_URL}/?EIO=${CONNECT_ARGS.engineIoVersion}&transport=${CONNECT_ARGS.transport}`, {
        ...options,
        perMessageDeflate: false,
        headers: {
          Connection: 'upgrade'
        }
      });
      this._initEvents();
    }

    /**
     * @ignore
     */
    private _initEvents () {
      this.socket.on(SocketEvents.CLOSE, this.onClose.bind(this));
      this.socket.on(SocketEvents.ERROR, this.onError.bind(this));
      this.socket.on(SocketEvents.MESSAGE, this.onMessage.bind(this));
      this.socket.on(SocketEvents.OPEN, this.onOpen.bind(this));
    }

    /**
     * @ignore
     */
    private _parsePacket (data: string): [string, any] | null {
      let event;

      // This code identifies where the packet status code ends and the json starts since socket.io sends data weirdly

      let jsonStartIndex = 0;
      let jsonStarted = false;

      data.split('').forEach(char => {
        if (!isNaN(parseInt(char)) && !jsonStarted) jsonStartIndex++;
        else jsonStarted = true;
      });

      data = data.slice(jsonStartIndex);

      if (!data) return null; // some packets are just numbers (usually 40), idk why yet

      try {
        event = JSON.parse(data);
      } catch (e) {
        throw new Error(`Invalid JSON returned from socket subscribed to ID: ${this.subscribedTo}`);
      }

      if (!Array.isArray(event)) return null; // All conventional packets are sent as ["EVENT_NAME", DATA], only on connection does this not apply (?)

      const eventName: string = event[0];
      const eventData: any = event[1];

      return [eventName, eventData];
    }

    public ping (): Promise<number> {
      const start = Date.now();
      return new Promise((resolve, reject) => {
        this.socket.send(OpCodes.PING, (err?: Error) => {
          if (err) reject(err);
          resolve(Date.now() - start);
        });
      });
    }

    private onClose (code: number, reason: string) {
      this.emit(SocketEvents.CLOSE, code, reason);
      if (this.autoReconnect && code !== SUCCESS_CLOSE_CODE) this.connect(this.options.webSocketOptions);
    }

    private onError (err: Error) {
      console.error(err.message);
    }

    private onMessage (data: WebSocket.Data) {
      if (typeof data !== 'string') return; // shouldnt happen
      const event = this._parsePacket(data);
      if (!event) return; // not a valid packet to emit as a conventional event
      this.emit(SocketEvents.RAW, event);
    }

    private onOpen () {
      this.socket.send(`${OUTBOUND_MESSAGE_CODE}["${VIEWING_PROFILE_D}", "${this.subscribedTo}"]`);
      this.emit(SocketEvents.OPEN);
    }
}
