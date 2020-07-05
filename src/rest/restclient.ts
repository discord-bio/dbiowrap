import fetch, { Request, Response as NodeFetchResponse, Headers } from 'node-fetch';

import { RatelimitHeaders, Details, TopLikes } from './types';
import { DiscordBioError, RatelimitError } from './errors';
import { BASE_URL, VERSION, Endpoints, PARAM_INDICATOR } from './routes';
import { Bucket } from './bucket';
import { StatusCodes, HeaderNames } from './constants';
import { Client } from '../client';

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
     * Constructs a fully-qualified path from the base URL, version, and endpoint/parameters. This function is internal and should not be used in end-user code.
     */
    private constructPath (endpoint: string, params?: {[key: string]: string}): string {
      let path = `${BASE_URL}${VERSION}${endpoint}`;
      if (params) {
        Object.keys(params).forEach(param => {
          path = path.replace(`${PARAM_INDICATOR}${param}`, params[param]);
        });
      }
      return path;
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
          discord: new Details.Discord(res.payload.discord)
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
        payload: res.payload.map(x => ({
          ...x,
          discord: new TopLikes.DiscordUser(x.discord)
        }))
      }));
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
     * Updates the stored ratelimit headers. This function is internal and should not be used in end-user code.
     */
    private updateRatelimitHeaders (headers: Headers) {
      const ratelimitHeaders = [HeaderNames.RATELIMIT_RESET, HeaderNames.RATELIMIT_REMAINING, HeaderNames.RATELIMIT_RESET];
      for (const headerName of ratelimitHeaders) {
        const headerValue = headers.get(headerName);
        if (headerValue) this.ratelimitHeaders[headerName] = parseInt(headerValue);
      }
    }
}
