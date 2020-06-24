export interface IUserOptions {
    id: string,
    username: string,
    discriminator: string,
    public_flags: number,
    avatar: string
}

class IUser {
    private _id!: BigInt;
    private _avatar!: BigInt;
    private animated!: boolean;
    private tag: string;
    public public_flags: number;

    constructor(data: IUserOptions) {
        this.id = data.id;
        this.tag = `${data.username}#${data.discriminator}`;
        this.avatar = data.avatar;
        this.public_flags = data.public_flags;
    }

    get id() {
        return this._id.toString();
    }

    set id(value) {
        this._id = BigInt(value);
    }

    get avatar() {
        return (this.animated ? 'a_' : '') + this._avatar.toString(16);
    }

    set avatar(value) {
        this.animated = value.startsWith('a_');
        this._avatar = BigInt(`0x${this.animated ? value.substr(2) : value}`);
    }

    get username() {
        return this.tag.substr(0, this.tag.lastIndexOf('#'));
    }

    get discriminator() {
        return this.tag.substr(this.tag.lastIndexOf('#') + 1);
    }
}

export namespace Details {
    export interface Response {
        payload: Payload;
    }

    export interface Payload {
        user: User;
        discord: Discord;
    }

    export class Discord extends IUser {}

    export interface User {
        details: Details;
        discordConnections: DiscordConnection[];
        userConnections: UserConnections;
    }

    export interface Details {
        slug: string;
        user_id: string;
        flags: number;
        verified: boolean;
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

    export class DiscordUser extends IUser {}

    export interface User {
        slug: string;
        verified: boolean;
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
