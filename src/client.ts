import { RestClientOptions, RestClient } from './rest/restclient';
import { SocketManager, SocketManagerOptions } from './gateway/socketmanager';

import { Collection, CollectionOptions } from './collection';
import { Details } from './rest/types';
import { EventEmitter } from 'events';
import * as GatewayEvents from './gateway/gatewayevents';

export enum ClientEvents {
    BANNER_UPDATE = 'bannerUpdate',
    METRICS = 'metrics',
    PRESENCE = 'presence',
    PROFILE_UPDATE = 'profileUpdate',
    READY = 'ready',
    SUBSCRIBE = 'subscribe',
    TOTAL_VIEWING = 'totalViewing',
    UNKNOWN = 'unknown',
    UNSUBSCRIBE = 'unsubscribe'
}

export interface ClientOptions {
    cache?: boolean | {
        presences?: boolean | CollectionOptions<string, GatewayEvents.Presence>
        userProfiles?: boolean | CollectionOptions<string, Details.Payload>
    },
    rest?: boolean | RestClientOptions
    ws?: boolean | SocketManagerOptions
}

// have to use string literals for these types
// because autofill of events doesn't work
// when only the enum is used :(
export declare interface Client {
    on(event: ClientEvents.BANNER_UPDATE | 'bannerUpdate', listener: (data: GatewayEvents.BannerUpdate) => void): this;
    on(event: ClientEvents.METRICS | 'metrics', listener: (data: GatewayEvents.Metrics) => void): this;
    on(event: ClientEvents.PRESENCE | 'presence', listener: (data: GatewayEvents.Presence) => void): this;
    on(event: ClientEvents.PROFILE_UPDATE | 'profileUpdate', listener: (data: GatewayEvents.ProfileUpdate) => void): this;
    on(event: ClientEvents.TOTAL_VIEWING | 'totalViewing', listener: (data: GatewayEvents.TotalViewing) => void): this;
    on(event: ClientEvents.UNKNOWN | 'unknown', listener: (data: GatewayEvents.Unknown) => void): this;
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
     * The socket manager that manages all websockets recieving data from subscribed profiles, if enabled.
     */
    public socketManager: SocketManager | null;

    /**
     * The cache of presences recieved from the gateway, if enabled.
     */
    public presences: Collection<string, GatewayEvents.Presence> | null

    /**
     * The cache of recently fetched user profiles, if enabled.
     */
    public userProfiles: Collection<string, Details.Response> | null

    constructor (options: ClientOptions = {}) {
      super();
      if (options.ws !== false) {
        const wsOptions = typeof options.ws !== 'boolean' ? options.ws : {};
        this.socketManager = new SocketManager(this, wsOptions);
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
        this.presences = null;
      } else {
        let userProfileOptions: null | {} = {};
        let presenceOptions: null | {} = {};
        if (options.cache !== true) {
          if (typeof options.cache?.presences === 'object') {
            presenceOptions = options.cache?.presences;
          } else if (options.cache?.presences === false) {
            presenceOptions = null;
          }

          if (typeof options.cache?.userProfiles === 'object') {
            userProfileOptions = options.cache?.userProfiles;
          } else if (options.cache?.userProfiles === false) {
            userProfileOptions = null;
          }
        }
        this.presences = presenceOptions ? new Collection<string, GatewayEvents.Presence>(presenceOptions) : null;
        this.userProfiles = userProfileOptions ? new Collection<string, Details.Response>(userProfileOptions) : null;
      }
    }
}
