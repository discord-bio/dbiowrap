import { RestClientOptions, RestClient } from './rest/restclient';
import { SocketManager, SocketManagerOptions } from './gateway/socketmanager';

import { Collection, CollectionOptions } from './collection';
import { Details } from './rest/types';
import { EventEmitter } from 'events';
import * as GatewayEvents from './gateway/gatewayevents';

export enum ClientEvents {
    METRICS = 'metrics',
    PROFILE_UPDATE = 'profileUpdate',
    SUBSCRIBE = 'subscribe',
    UNSUBSCRIBE = 'unsubscribe'
}

export interface ClientOptions {
    cache?: boolean | {
        userProfiles?: boolean | CollectionOptions<string, Details.Payload>,
    },
    rest?: boolean | RestClientOptions,
    ws?: boolean | SocketManagerOptions
}

export declare interface Client {
    on(event: ClientEvents.METRICS, listener: (data: GatewayEvents.Metrics) => void): this;
    on(event: ClientEvents.PROFILE_UPDATE, listener: (data: GatewayEvents.ProfileUpdate) => void): this;
    on(event: ClientEvents.SUBSCRIBE, listener: (data: GatewayEvents.Subscribe) => void): this;
    on(event: ClientEvents.UNSUBSCRIBE, listener: (data: GatewayEvents.Unsubscribe) => void): this;
    on(event: string, listener: Function): this;
}

/**
 * The base client that should be instantiated when this wrapper is used.
 */
export class Client extends EventEmitter {
    /**
     * The rest client responsible for handling REST requests.
     */
    public rest: RestClient | null;

    /**
     * The socket manager that manages all websockets recieving data from subscribed profiles.
     */
    public socketManager: SocketManager | null;

    /**
     * The cache of recently fetched user profiles.
     */
    public userProfiles: Collection<string, Details.Response> | null

    constructor (options: ClientOptions = {}) {
      super();
      if (options.ws !== false) {
        const wsOptions = typeof options.ws !== 'boolean' ? options.ws : {};
        this.socketManager = new SocketManager(wsOptions);
      } else {
        this.socketManager = null;
      }

      if (options.rest !== false) {
        const restOptions = typeof options.rest !== 'boolean' ? options.rest : {};
        this.rest = new RestClient(this, restOptions);
      } else {
        this.rest = null;
      }

      if (options.cache === false) {
        this.userProfiles = null;
      } else {
        let userProfileOptions = {};
        if (options.cache !== true && typeof options.cache?.userProfiles === 'object') {
          userProfileOptions = options.cache?.userProfiles;
        }
        this.userProfiles = new Collection<string, Details.Response>(userProfileOptions);
      }
    }
}
