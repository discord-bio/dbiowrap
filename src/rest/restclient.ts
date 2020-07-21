import fetch, { Request, Response as NodeFetchResponse, Headers } from 'node-fetch';
import { arch, platform } from 'os';

import { RatelimitHeaders, Details, TopLikes, Version, WebhookOptions } from './types';
import { DiscordBioError, RatelimitError } from './errors';
import { BASE_URL, Endpoints, PARAM_INDICATOR, PROTOCOL, DISCORD_BASE_URL, DiscordEndpoints, Params } from './routes';
import { Bucket } from './bucket';
import { StatusCodes, HeaderNames, HttpRequestTypes } from './constants';
import { Client } from '../client';
import { version } from '../../package.json';
import { head } from 'superagent';

export interface RestClientOptions {

}

/**
 * The main REST client for interfacing with discord.bio via REST.
 */
export class RestClient {
    /**
     * The ratelimit bucket that helps prevent ratelimits. Not implemented yet
     */
    public bucket: Bucket = new Bucket();

    /**
     * The base client associated with this REST client.
     */
    public client: Client

    /**
     * The content-type to use when executing any Discord webhooks.
     */
    readonly contentType = `dbiowrap ${version} (${platform()} ${arch()})`

    /**
     * The most recently recieved ratelimit headers, if any.
     */
    public ratelimitHeaders: RatelimitHeaders = {
      [HeaderNames.RATELIMIT_RESET]: null,
      [HeaderNames.RATELIMIT_REMAINING]: null,
      [HeaderNames.RATELIMIT_LIMIT]: null
    }

    constructor (client: Client, options: RestClientOptions = {}) {
      this.client = client;
    }

    /**
     * @ignore
     */
    private constructPath (endpoint: string, params?: {[key: string]: string}): string {
      let path = `${BASE_URL}${endpoint}`;
      if (params) {
        Object.keys(params).forEach(param => {
          path = path.replace(`${PARAM_INDICATOR}${param}`, params[param]);
        });
      }
      return `${PROTOCOL}${path}`;
    }

    /**
     * Executes a Discord webhook.
     * @param id the webhook ID to use
     * @param token the webhook token to use
     * @param option the webhook options
     */
    public executeWebhook (id: string, token: string, options: WebhookOptions) {
      return fetch(`${PROTOCOL}${DISCORD_BASE_URL}${DiscordEndpoints.EXECUTE_WEBHOOK.replace(Params.WEBHOOK.id, id).replace(Params.WEBHOOK.token, token)}`, {
        headers: {
          [HeaderNames.CONTENT_TYPE]: this.contentType
        },
        method: HttpRequestTypes.POST,
        body: JSON.stringify(options)
      }).then(res => res.json());
    }

    /**
     * Fetches a user from discord.bio.
     * @param searchQuery The user ID or slug to search for
     */
    public async fetchUserDetails (searchQuery: string): Promise<Details.Response> {
      if (this.client.userProfiles?.get(searchQuery)) {
        return <Details.Response> this.client.userProfiles.get(searchQuery);
      }
      const path = this.constructPath(Endpoints.DETAILS, {
        [Endpoints.DETAILS.split(PARAM_INDICATOR)[1]]: searchQuery
      });

      const res: Details.Response = await this.request<Details.Response>(path).then((res: Details.Response) => ({
        payload: {
          user: {
            ...res.payload.user,
            details: new Details.Details(res.payload.user.details)
          },
          discord: res.payload.discord ? new Details.Discord(res.payload.discord) : null
        }
      }));

      if (this.client.userProfiles) this.client.userProfiles.set(searchQuery, res);
      return res;
    }

    /**
     * Fetches the top liked users on discord.bio.
     */
    public async fetchTopUsers (): Promise<TopLikes.Response> {
      const path = this.constructPath(Endpoints.TOP_LIKES);
      return this.request<TopLikes.Response>(path).then((res: TopLikes.Response) => ({
        payload: {
          ...res.payload,
          users: res.payload.users.map(x => ({
            ...x,
            discord: new TopLikes.DiscordUser(x.discord)
          }))
        }
      }));
    }

    public async fetchVersion (): Promise<string> {
      return this.request<Version>(this.constructPath('')).then(res => res.version);
    }

    /**
     * Sends a request to a specified path and return the response as json. This function updates the stored ratelimit headers. This function is internal and should not be used in end-user code.
     * @param path The path to send the request to
     */
    private async request<T> (path: string): Promise<T> {
      const request = new Request(path);
      const response = await fetch(request);
      this.updateRatelimitHeaders(response.headers);
      let json: any = await response.text();
      try {
        json = JSON.parse(json);
      } catch (e) {}
      if (![StatusCodes.SUCCESS, StatusCodes.RATELIMIT].includes(response.status)) {
        const throwValue = json.message || json;
        throw new DiscordBioError(throwValue, request, response);
      } else if (response.status === StatusCodes.RATELIMIT) {
        const throwValue = json.message || json;
        throw new RatelimitError(throwValue, request, response);
      }
      return json;
    }

    /**
     * @ignore
     */
    private updateRatelimitHeaders (headers: Headers) {
      const ratelimitHeaders = [HeaderNames.RATELIMIT_RESET, HeaderNames.RATELIMIT_REMAINING, HeaderNames.RATELIMIT_RESET];
      for (const headerName of ratelimitHeaders) {
        const headerValue = headers.get(headerName);
        // @ts-ignore
        if (headerValue && (headerName in this.ratelimitHeaders)) this.ratelimitHeaders[headerName] = parseInt(headerValue);
      }
    }
}
