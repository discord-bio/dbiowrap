import { Socket } from './socket';
import { ClientOptions } from 'ws';
import { Collection } from '../collection';
import { HEARTBEAT_INTERVAL, KNOWN_PACKETS, SocketEvents } from './constants';
import { Client, ClientEvents } from '../client';
import { snakeToCamelCase } from '../util';
import { Profile } from './types';
import { Details } from '../rest/types';
import * as GatewayEvents from './gatewayevents';

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
    public sockets: Collection<string, Socket> = new Collection<string, Socket>()

    constructor (client: Client, options: SocketManagerOptions = {}) {
      this.client = client;
      this._autoReconnect = options.autoReconnect || AUTO_RECONNECT_DEFAULT;
      this._connectionTimeout = options.connectionTimeout || CONNECTION_TIMEOUT_DEFAULT;
      this._webSocketOptions = options.webSocketOptions;
      if (options.subscribe) {
        options.subscribe.forEach((subscription) => {
          this._setSocket(subscription);
        });
      }
      if (this.sockets.size > 0) {
        this._heartbeatInterval = <NodeJS.Timer> <unknown> setInterval(() => this.heartbeat(), HEARTBEAT_INTERVAL);
      }
    }

    private _clientEmit<T>(socket: Socket, event: string, data: T): void {
      this.client.emit(event, {
        id: socket.subscribedTo,
        ...data
      });
    }

    private async heartbeat (timeout: number = 1000): Promise<void> {
      for (const key of this.sockets.keys()) {
        const socket = this.sockets.get(key);
        await socket?.ping();
      }
    }

    /**
     * @ignore
     */
    private _setSocket (id: string) {
      const socket = new Socket(this, id, {
        autoReconnect: this._autoReconnect,
        connectionTimeout: this._connectionTimeout,
        webSocketOptions: this._webSocketOptions
      });
      this.sockets.set(id, socket);
      socket.on(SocketEvents.RAW, (data) => {
        this.onMessage(socket, data);
      });
    }

    public subscribe (id: string) {
      this._setSocket(id);
      if (!this._heartbeatInterval) this._heartbeatInterval = <NodeJS.Timer> <unknown> setInterval(() => this.heartbeat(), HEARTBEAT_INTERVAL);
    }

    public unsubscribe (id: string) {
      const socket = this.sockets.get(id);
      if (!socket) throw new Error('No socket is subscribed to this ID');
      socket.close();
      if (this.sockets.size === 0 && this._heartbeatInterval) clearInterval(this._heartbeatInterval);
    }

    public unsubscribeAll () {
      this.sockets.map((socket, key) => {
        socket.close();
        this.sockets.delete(key);
      });
      if (this._heartbeatInterval) clearInterval(this._heartbeatInterval);
    }

    private onMessage (socket: Socket, data: [string, any]) {
      const eventName: string = data[0];
      const eventData: any = data[1];

      if (!KNOWN_PACKETS.includes(eventName)) {
        return this.client.emit(ClientEvents.UNKNOWN, {
          event: eventName,
          data: eventData
        });
      }

      const emitName = snakeToCamelCase(eventName.toLowerCase());

      switch (emitName) {
        case 'profileUpdate': {

          // event does not return a discord user, only discord.bio user so discord user must be fetched from cache

          const oldProfile = this.client.userProfiles?.get(socket.subscribedTo)?.payload || null;
          const currentProfile: Profile.Profile = eventData;

          const newUser: Details.User = {
              details: new Details.Details(currentProfile.settings),
              userConnections: currentProfile.userConnections,
              discordConnections: currentProfile.discordConnections 
          }

          const newProfile: Details.Payload = {
              user: newUser,
              discord: oldProfile?.discord || null
          }

          this._clientEmit<GatewayEvents.ProfileUpdate>(socket, eventName, {
            id: socket.subscribedTo,
            newProfile,
            oldProfile
          });

          const cachedProfile = this.client.userProfiles?.get(socket.subscribedTo);

          if(!cachedProfile) {
            this.client.userProfiles?.set(socket.subscribedTo, {
              payload: {
                user: newUser,
                discord: null
              }
            })
          } else {
            cachedProfile.payload.user = newUser;
          }

          break;
        } // case
      } // switch
    } // onMessage
}
