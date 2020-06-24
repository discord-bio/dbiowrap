// ESLint can't find BigInt for some reason
/* global BigInt */

import { HeaderNames } from './constants';

import { IDiscordUser } from './structures/discorduser'
import { IUserDetails } from './structures/userdetails'

export namespace Details {
    export interface Response {
        payload: Payload;
    }

    export interface Payload {
        user: User;
        discord: Discord;
    }

    export class Discord extends IDiscordUser {}

    export interface User {
        details: Details;
        discordConnections: DiscordConnection[];
        userConnections: UserConnections;
    }

    export class Details extends IUserDetails {}

    export interface DiscordConnection {
        connection_type: string;
        name: string;
        url: string;
        icon: string;
    }

    export interface UserConnections {
        github: string;
        website: string;
        instagram: string;
    }
}

export namespace TopLikes {
    export interface Response {
        payload: Payload[];
    }

    export interface Payload {
        discord: DiscordUser;
        user: User;
    }

    export class DiscordUser extends IDiscordUser {}

    export interface User {
        slug: string;
        verified: boolean;
        staff: boolean;
        premium: boolean;
        likes: number;
        description: null | string;
    }
}

export interface RatelimitHeaders {
    [HeaderNames.RATELIMIT_RESET]: number | null,
    [HeaderNames.RATELIMIT_REMAINING]: number | null,
    [HeaderNames.RATELIMIT_LIMIT]: number | null
}
