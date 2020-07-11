import { Details } from '../rest/types';

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
        settings: Settings;
        connections: Connection[];
    }

    export interface Connection {
        type: string;
        name: string;
        url: string;
        icon: string;
    }

    export interface Settings {
        slug: string;
        user_id: string;
        flags: number;
        verified: boolean;
        premium_type: number;
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
}

export function gatewayProfileToCachedProfile (gatewayprofile: Profile.Profile): Details.Response | void {

}
