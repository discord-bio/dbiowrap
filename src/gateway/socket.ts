/* global WebSocket */

import { SocketManager } from './socketmanager';

import WebSocket, { ClientOptions } from 'ws';
import { BASE_URL, SocketEvents, SUCCESS_CLOSE_CODE, OUTBOUND_MESSAGE_CODE, VIEWING_PROFILE_D, OpCodes, Packet, CONNECT_ARGS, PONG_MESSAGE_CODE } from './constants';
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
  on(event: SocketEvents.CLOSE | 'close', listener: (code: number, reason: string) => void): this;
  on(event: SocketEvents.ERROR | 'error', listener: (err: Error) => void): this;
  on(event: SocketEvents.RAW | 'raw', listener: (data: [string, any]) => void): this;
  on(event: SocketEvents.OPEN | 'open', listener: () => void): this;
  on(event: string, listener: Function): this;
}

export class Socket extends EventEmitter {
    readonly pings: Map<string, PingData> = new Map<string, PingData>()
    public manager: SocketManager
    public socket!: WebSocket
    public subscribedTo: string
    public autoReconnect: boolean
    public options: SocketOptions

    /**
     * @ignore
     */
    private _closeResolve?: Function

    /**
    * @ignore
    */
    private _pong?: {
      start: number,
      resolve: Function
    }
    
    constructor (manager: SocketManager, subscribe: string, options: SocketOptions) {
      super();
      this.manager = manager;
      this.subscribedTo = subscribe;
      this.autoReconnect = options.autoReconnect;
      this.options = options;
    }

    public close (): Promise<void> {
      if (this.socket.CLOSED) throw new Error('Socket is already closed');
      return new Promise((resolve) => {
        this.socket.close(SUCCESS_CLOSE_CODE, 'WebSocket connection closed by client');
        this._closeResolve = resolve;
      });
    }

    public connect (): Promise<Socket> {
      if (this.socket?.OPEN) throw new Error('Socket is already open');
      return new Promise((resolve) => {
        this.socket = new WebSocket(`wss://${BASE_URL}/?EIO=${CONNECT_ARGS.engineIoVersion}&transport=${CONNECT_ARGS.transport}`, {
          ...this.options.webSocketOptions,
          perMessageDeflate: false,
          headers: {
            Connection: 'upgrade'
          }
        });
        this._initEvents(resolve);
      });
    }

    /**
     * @ignore
     */
    private _initEvents (openResolve: Function) {
      this.socket.on(SocketEvents.CLOSE, this._onClose.bind(this));
      this.socket.on(SocketEvents.ERROR, this._onError.bind(this));
      this.socket.on(SocketEvents.MESSAGE, this._onMessage.bind(this));
      this.socket.on(SocketEvents.OPEN, this._onOpen.bind(this, openResolve));
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

    /**
     * Returns the latency of this socket to the discord.bio socket.io server.
     */
    public ping (): Promise<number> {
      if(this._pong !== undefined) throw new Error('This socket is already pinging');
      return new Promise((resolve, reject) => {
        this.socket.send(OpCodes.PING, (err?: Error) => {
          if (err) reject(err);
          this._pong = {
            start: Date.now(),
            resolve
          }
        });
      });
    }

    /**
     * @ignore
     */
    private _onClose (code: number, reason: string) {
      if (this._closeResolve) this._closeResolve();
      this.emit(SocketEvents.CLOSE, code, reason);
      if (this.autoReconnect && code !== SUCCESS_CLOSE_CODE) this.connect();
    }

    /**
     * @ignore
     */
    private _onError (err: Error) {
      if (this.manager.client.listeners(SocketEvents.ERROR).length > 0) this.emit(SocketEvents.ERROR, Error);
      throw err; // unhandled error event
    }

    /**
     * @ignore
     */
    private _onMessage (data: WebSocket.Data) {
      if (typeof data !== 'string') return; // shouldnt happen
      if(data === PONG_MESSAGE_CODE && this._pong) {
        this._pong.resolve(Date.now() - this._pong.start);
        this._pong = undefined;
        return;
      }
      const event = this._parsePacket(data);
      if (!event) return; // not a valid packet to emit as a conventional event
      this.emit(SocketEvents.RAW, event);
    }

    /**
     * @ignore
     */
    private _onOpen (resolve: Function) {
      resolve(this);
      this.socket.send(`${OUTBOUND_MESSAGE_CODE}["${VIEWING_PROFILE_D}", "${this.subscribedTo}"]`);
    }
}
