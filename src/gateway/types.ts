export namespace Activity {

    export interface Timestamp {
        start?: number;
        end?: number;
    }

    export interface Emoji {
        name: string;
        id?: string;
        animated?: boolean;
    }

    export interface Party {
        id?: string;
        size?: number[];
    }

    export interface Assets {
        large_image?: string;
        large_text?: string;
        small_image?: string;
        small_text?: string;
    }

    export interface Secrets {
        join?: string;
        spectate?: string;
        match?: string;
    }
}

export namespace Profile {
    export interface Profile {
        user: User,
        discord: Discord
    }

    export interface User {
        details: Details
        discordConnections: DiscordConnection[]
        userConnections: UserConnections;
    }

    export interface UserConnections {
        github: string | null;
        website: string | null;
        instagram: string | null;
        snapchat: string | null;
        linkedin: string | null;
    }

    export interface Discord {
        id: string;
        username: string;
        avatar: string;
        discriminator: string;
        public_flags: number
    }

    export interface DiscordConnection {
        connection_type: string;
        name: string;
        url: string;
        icon: string;
    }

    export interface Details {
        slug: string;
        user_id: string;
        flags: number;
        verified: boolean;
        premium_type: number;
        created_at: string;
        description: string;
        location: string;
        gender: number;
        birthday: string;
        email: string;
        occupation: string;
        banner: string;
        premium: boolean;
        staff: boolean;
        likes: number;
    }
}

export interface SubscribeOptions {
    webhook?: WebhookOptions
}

export interface WebhookOptions {
    token: string;
    id: string;
}
