import { ClientOptions } from 'ws';

import { Socket } from './socket';
import { Collection } from '../collection';
import {
  HEARTBEAT_INTERVAL,
  GatewayEventNames,
  SocketEvents,
  BANNER_URL,
  BANNER_URL_PARAM
} from './constants';
import { Client } from '../client';
import { snakeToCamelCase } from '../util';
import { Profile, SubscribeOptions } from './types';
import { Details } from '../rest/types';
import * as GatewayEvents from './gatewayevents';
import { IDiscordUser } from '../structures/discorduser';

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
        options.subscribe.forEach(async (subscription) => {
          await this._setSocket(subscription);
        });
      }
      if (this.sockets.size > 0) {
        this._heartbeatInterval = <NodeJS.Timer> <unknown> setInterval(() => this._heartbeat(), HEARTBEAT_INTERVAL);
      }
    }

    /**
     * @ignore
     */
    private _clientEmit<T> (socket: Socket, event: string, data: T): void {
      this.client.emit(event, {
        id: socket.subscribedTo,
        ...data
      });
    }

    /**
     * @ignore
     */
    private async _heartbeat (): Promise<void> {
      for (const key of this.sockets.keys()) {
        const socket = this.sockets.get(key);
        await socket?.ping();
      }
    }

    /**
     * @ignore
     */
    private async _setSocket (id: string, options: SubscribeOptions = {}) {
      const socket = new Socket(this, id, {
        autoReconnect: this._autoReconnect,
        connectionTimeout: this._connectionTimeout,
        webSocketOptions: this._webSocketOptions,
        webHookOptions: options.webhook
      });
      this.sockets.set(id, socket);
      await socket.connect();
      socket.on(SocketEvents.RAW, (data) => {
        this._onMessage(socket, data);
      });
      return socket;
    }

    public async getSocketPings (): Promise<number[] | null> {
      if (this.sockets.size === 0) return null;
      return new Promise((resolve) => {
        const pings: number[] = [];
        let index = 0;
        this.sockets.forEach(async (socket) => {
          const ping = await socket.ping();
          pings.push(ping);
          index++;
          if (index === this.sockets.size) resolve(pings);
        });
      });
    }

    public async pingAvg (): Promise<number | null> {
      const pings = await this.getSocketPings();
      if (!pings) return null;
      return pings?.reduce((a, b) => a + b) / pings?.length;
    }

    public async subscribe (id: string, options: SubscribeOptions = {}) {
      const socket = await this._setSocket(id, options);
      if (!this._heartbeatInterval) this._heartbeatInterval = <NodeJS.Timer> <unknown> setInterval(() => this._heartbeat(), HEARTBEAT_INTERVAL);
      return socket;
    }

    public async unsubscribe (id: string) {
      const socket = this.sockets.get(id);
      if (!socket) throw new Error('No socket is subscribed to this ID');
      await socket.close();
      if (this.sockets.size === 0 && this._heartbeatInterval) clearInterval(this._heartbeatInterval);
    }

    public async unsubscribeAll () {
      this.sockets.map(async (socket, key) => {
        await socket.close();
        this.sockets.delete(key);
      });
      if (this._heartbeatInterval) clearInterval(this._heartbeatInterval);
    }

    /**
     * @ignore
     */
    private _onMessage (socket: Socket, data: [string, any]) {
      const eventName: string = data[0];
      const eventData: any = data[1];

      const emitName = snakeToCamelCase(eventName.toLowerCase());

      switch (eventName) {
        case GatewayEventNames.BANNER_UPDATE: {
          const userHasBanner: boolean = eventData;
          let bannerUrl: string | null = null;

          if (userHasBanner) bannerUrl = BANNER_URL.replace(BANNER_URL_PARAM, socket.subscribedTo);

          this._clientEmit<GatewayEvents.BannerUpdate>(socket, emitName, {
            id: socket.subscribedTo,
            url: bannerUrl
          });

          const cachedProfile = this.client.userProfiles?.get(socket.subscribedTo);

          if (cachedProfile) {
            cachedProfile.payload.user.details.banner = bannerUrl;
            this.client.userProfiles?.set(socket.subscribedTo, {
              ...cachedProfile
            });
          }

          break;
        }

        case GatewayEventNames.PRESENCE: {
          this._clientEmit<GatewayEvents.Presence>(socket, emitName, {
            id: socket.subscribedTo,
            ...eventData
          });

          this.client.presences?.set(socket.subscribedTo, eventData);

          break;
        }

        case GatewayEventNames.PROFILE_UPDATE: {

          const oldProfile = this.client.userProfiles?.get(socket.subscribedTo)?.payload || null;
          const currentProfile: Profile.Profile = eventData;

          const newUser: Details.User = {
            details: new Details.Details(currentProfile.user.details),
            userConnections: currentProfile.user.userConnections,
            discordConnections: currentProfile.user.discordConnections
          };

          const newProfile: Details.Payload = {
            user: newUser,
            discord: new IDiscordUser(currentProfile.discord)
          };

          this._clientEmit<GatewayEvents.ProfileUpdate>(socket, emitName, {
            id: socket.subscribedTo,
            newProfile,
            oldProfile
          });

          if (socket.webHookOptions) {
            this.client.rest?.executeWebhook(socket.webHookOptions.id, socket.webHookOptions.token, {
              content: 'test',
              username: 'ferris',
              avatar_url: 'https://cdn.discordapp.com/avatars/708680386980479036/797bcff8a356d210123bc606801ab4db.png'
            });
          }

          const cachedProfile = this.client.userProfiles?.get(socket.subscribedTo);

          if (!cachedProfile) {
            this.client.userProfiles?.set(socket.subscribedTo, {
              payload: {
                user: newUser,
                discord: null
              }
            });
          } else {
            cachedProfile.payload.user = newUser;
          }

          break;
        }

        case GatewayEventNames.TOTAL_VIEWING: {
          this._clientEmit<GatewayEvents.TotalViewing>(socket, emitName, {
            id: socket.subscribedTo,
            count: eventData
          });

          break;
        }

        default: {
          this._clientEmit<GatewayEvents.Unknown>(socket, eventName, {
            id: socket.subscribedTo,
            event: eventName,
            data: eventData
          });

          break;
        }
      } // switch
    } // onMessage
}
