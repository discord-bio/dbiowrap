export enum UserDetailsFlags {
    VERIFIED = 1 << 0,
    PREMIUM = 1 << 1,
    STAFF = 1 << 2 
}

export interface IUserDetailsOptions {
    slug: string;
    user_id: string;
    verified: boolean;
    created_at: string | null;
    description: string | null;
    location: string | null;
    gender: number | null;
    birthday: string | null;
    email: string | null;
    occupation: string | null;
    banner: string | null;
    premium: boolean;
    staff: boolean;
    likes: number;
}

/**
 * Represents the details of a discord.bio user.
 */
export class IUserDetails {
    public slug: string;
    private _id: BigInt;
    private _flags: number = 0;
    private _createdAt: number | null; // unix
    public description: string | null;
    public location: string | null;
    public gender: number | null;
    private _birthday: number | null; //unix
    public email: string | null;
    public occupation: string | null;
    public banner: string | null;
    public likes: number;

    constructor(options: IUserDetailsOptions) {
        this.slug = options.slug;
        this._id = BigInt(options.user_id);
        if(options.verified) this._flags |= UserDetailsFlags.VERIFIED;
        if(options.premium) this._flags |= UserDetailsFlags.PREMIUM;
        if(options.staff) this._flags |= UserDetailsFlags.STAFF;
        this._createdAt = options.created_at ? new Date(options.created_at).getTime() : null
        this.description = options.description;
        this.location = options.location;
        this.gender = options.gender;
        this._birthday = options.birthday ? new Date(options.birthday).getTime() : null
        this.email = options.email;
        this.occupation = options.occupation;
        this.banner = options.banner;
        this.likes = options.likes;
    }

    get birthday() {
        if(this._birthday) {
            return new Date(this._birthday).toISOString();
        } else {
            return null;
        }
    }

    get created_at () {
        if(this._createdAt) {
            return new Date(this._createdAt).toISOString();
        } else {
            return null;
        }
    }

    get user_id() {
        return this._id.toString();
    }

    get id() {
        return this.user_id;
    }

    get premium () {
        return (this._flags & 1 << UserDetailsFlags.PREMIUM) !== 0
    }

    get staff () {
        return (this._flags & 1 << UserDetailsFlags.STAFF) !== 0
    }

    get verified () {
        return (this._flags & 1 << UserDetailsFlags.VERIFIED) !== 0
    }
}