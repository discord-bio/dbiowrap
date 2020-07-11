import { Socket } from './socket';
import { ClientOptions } from 'ws';
import { Collection } from '../collection';
import { HEARTBEAT_INTERVAL, KNOWN_PACKETS, SocketEvents } from './constants';
import { Client, ClientEvents } from '../client';
import { snakeToCamelCase } from '../util';

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
    private _heartbeatInterval: NodeJS.Timer | null = null;
    public client: Client;
    public sockets: Collection<string, Socket> = new Collection<string, Socket>({
      interval: {
        interval: Infinity
      }
    })

    constructor (client: Client, options: SocketManagerOptions = {}) {
      this.client = client;
      this._autoReconnect = options.autoReconnect || AUTO_RECONNECT_DEFAULT;
      this._connectionTimeout = options.connectionTimeout || CONNECTION_TIMEOUT_DEFAULT;
      this._webSocketOptions = options.webSocketOptions;
      if (options.subscribe) {
        options.subscribe.forEach((subscription) => {
          const socket = new Socket(this, subscription, {
            autoReconnect: this._autoReconnect,
            connectionTimeout: this._connectionTimeout,
            webSocketOptions: this._webSocketOptions
          });
          this.sockets.set(subscription, socket);
          socket.on(SocketEvents.RAW, (data) => {
            this.onMessage(socket, data);
          })
        });
      }
      if(this.sockets.size > 0) {
        this._heartbeatInterval = <NodeJS.Timer> <unknown> setInterval(() => this.heartbeat(), HEARTBEAT_INTERVAL)
      }
    }

    private async heartbeat (timeout: number = 1000): Promise<void> {
      for (const key of this.sockets.keys()) {
        const socket = this.sockets.get(key);
        await socket?.ping();
      }
    }

    public subscribe (id: string) {
      this.sockets.set(id, new Socket(this, id, {
        autoReconnect: this._autoReconnect,
        connectionTimeout: this._connectionTimeout,
        webSocketOptions: this._webSocketOptions
      }));
      if(!this._heartbeatInterval) this._heartbeatInterval = <NodeJS.Timer> <unknown> setInterval(() => this.heartbeat(), HEARTBEAT_INTERVAL);
    }

    public unsubscribe (id: string) {
      const socket = this.sockets.get(id);
      if (!socket) throw new Error('No socket is subscribed to this ID');
      socket.close();
      if(this.sockets.size === 0 && this._heartbeatInterval) clearInterval(this._heartbeatInterval);
    }

    public unsubscribeAll () {
      this.sockets.map((socket, key) => {
        socket.close();
        this.sockets.delete(key);
      });
      if(this._heartbeatInterval) clearInterval(this._heartbeatInterval);
    }

    private onMessage(socket: Socket, data: [string, any]) {

      const eventName: string = data[0];
      const eventData: any = data[1];

      if(!KNOWN_PACKETS.includes(eventName)) {
        return this.client.emit(ClientEvents.UNKNOWN, {
          event: eventName,
          data: eventData
        })
      }

      this.client.emit(snakeToCamelCase(eventName.toLowerCase()), {
        id: socket.subscribedTo,
        ...eventData
      })
    }
}
