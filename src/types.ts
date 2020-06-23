export namespace Details {
    export interface Response {
        payload: Payload;
    }

    export interface Payload {
        user: User;
        discord: Discord;
    }

    export interface Discord {
        id: string;
        username: string;
        avatar: string;
        discriminator: string;
        public_flags: number;
    }

    export interface User {
        details: Details;
        discordConnections: DiscordConnection[];
        userConnections: UserConnections;
    }

    export interface Details {
        slug: string;
        user_id: string;
        flags: number;
        verified: number;
        created_at: Date;
        description: string;
        location: string;
        gender: number;
        birthday: Date;
        email: string;
        occupation: string;
        banner: string;
        premium: boolean;
        staff: boolean;
        likes: number;
    }

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

    export interface DiscordUser {
        id: string;
        username: string;
        discriminator: string;
        avatar: string;
    }

    export interface User {
        slug: string;
        verified: number;
        staff: boolean;
        premium: boolean;
        likes: number;
        description: null | string;
    }
}

export enum HeaderNames {
    RATELIMIT_RESET = 'x-ratelimit-reset',
    RATELIMIT_REMAINING = 'x-ratelimit-remaining',
    RATELIMIT_LIMIT = 'x-ratelimit-limit'
}

export interface RatelimitHeaders {
    [HeaderNames.RATELIMIT_RESET]: number | null,
    [HeaderNames.RATELIMIT_REMAINING]: number | null,
    [HeaderNames.RATELIMIT_LIMIT]: number | null
}

export enum StatusCodes {
    SUCCESS = 200,
    RATELIMIT = 429
}
