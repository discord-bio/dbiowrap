import * as RestClient from './src/rest/restclient';
import * as Errors from './src/rest/errors';
import * as Routes from './src/rest/routes';
import * as Types from './src/rest/types';
import * as Collection from './src/collection';
import * as RestConstants from './src/rest/constants';
import * as Bucket from './src/rest/bucket';
import * as User from './src/structures/discorduser';
import * as Socket from './src/gateway/socket';
import * as SocketManager from './src/gateway/socketmanager';
import * as GatewayConstants from './src/gateway/constants';
import * as GatewayEvents from './src/gateway/gatewayevents';
import * as Client from './src/client'

export {
  RestClient,
  Errors,
  Routes,
  Types,
  Collection,
  RestConstants,
  Bucket,
  User,
  Socket,
  SocketManager,
  GatewayConstants,
  GatewayEvents,
  Client
};
