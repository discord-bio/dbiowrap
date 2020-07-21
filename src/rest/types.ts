// ESLint can't find BigInt for some reason
/* global BigInt */

import { HeaderNames } from './constants';

import { IDiscordUser } from '../structures/discorduser';
import { IUserDetails } from '../structures/userdetails';

export namespace Details {
    export interface Response {
        payload: Payload;
    }

    export interface Payload {
        user: User;
        discord: Discord | null;
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
        github: string | null;
        website: string | null;
        instagram: string | null;
        snapchat: string | null;
        linkedin: string | null;
    }
}

export namespace TopLikes {
    export interface Response {
        payload: Payload;
    }

    export interface Payload {
        pageTotal: number,
        users: ReturnUser[]
    }

    export interface ReturnUser {
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
        description: string | null;
    }
}

export namespace DiscordEmbed {

export interface Footer {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  }

  export interface Image {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  }

  export interface Thumbnail {
    url?: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  }

  export interface Video {
    url?: string;
    height?: number;
    width?: number;
  }

  export interface Provider {
    name?: string;
    url?: string;
  }

  export interface Author {
    name?: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  }

  export interface Field {
    name: string;
    value: string;
    inline?: boolean;
  }

  export interface Embed {
    title?: string;
    type?: string;
    description?: string;
    url?: string;
    timestamp?: string;
    color?: number;
    footer?: Footer;
    image?: Image;
    thumbnail?: Thumbnail;
    video?: Video;
    provider?: Provider;
    author?: Author;
    fields?: Field[];
  }
}

export interface WebhookOptions {
    content?: string;
    username: string;
    avatar_url: string;
    tts?: boolean;
    file?: Buffer;
    embed?: DiscordEmbed.Embed;
}

export interface Version {
    version: string
}

export interface RatelimitHeaders {
    [HeaderNames.RATELIMIT_RESET]: number | null,
    [HeaderNames.RATELIMIT_REMAINING]: number | null,
    [HeaderNames.RATELIMIT_LIMIT]: number | null
}
