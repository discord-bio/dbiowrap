export const BASE_URL = 'api.discord.bio';
export const PARAM_INDICATOR = ':';
export const PROTOCOL = 'https://';

export enum Endpoints {
    DETAILS = '/user/details/:input',
    TOP_LIKES = '/user/top'
}

export const DISCORD_VERSION = 6;
export const DISCORD_BASE_URL = `discord.com/api/v${DISCORD_VERSION}`;

export const Params = Object.freeze({
  WEBHOOK: {
    id: ':webhookId',
    token: ':token'
  }
});

export const DiscordEndpoints = Object.freeze({
  EXECUTE_WEBHOOK: `/webhooks/${Params.WEBHOOK.id}/${Params.WEBHOOK.token}`
});
