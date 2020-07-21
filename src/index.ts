import * as RestClient from './rest/restclient';
import * as Errors from './rest/errors';
import * as Routes from './rest/routes';
import * as Types from './rest/types';
import * as Collection from './collection';
import * as RestConstants from './rest/constants';
import * as Bucket from './rest/bucket';
import * as User from './structures/discorduser';
import * as Socket from './gateway/socket';
import * as SocketManager from './gateway/socketmanager';
import * as GatewayConstants from './gateway/constants';
import * as GatewayEvents from './gateway/gatewayevents';
import * as Client from './client';

export {
  Bucket,
  Client,
  Collection,
  Errors,
  GatewayConstants,
  GatewayEvents,
  RestClient,
  RestConstants,
  Routes,
  Socket,
  SocketManager,
  Types,
  User
};
