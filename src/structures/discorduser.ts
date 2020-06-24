export interface IUserOptions {
    id: string,
    username: string,
    discriminator: string,
    public_flags: number,
    avatar: string
}

/**
 * Represents a discord user.
 */
export class IDiscordUser {
    private _id!: BigInt;
    private _avatar!: BigInt;
    private animated!: boolean;
    private tag: string;
    public public_flags: number;

    constructor (data: IUserOptions) {
      this.id = data.id;
      this.tag = `${data.username}#${data.discriminator}`;
      this.avatar = data.avatar;
      this.public_flags = data.public_flags;
    }

    get id () {
      return this._id.toString();
    }

    set id (value) {
      this._id = BigInt(value);
    }

    get avatar () {
      return (this.animated ? 'a_' : '') + this._avatar.toString(16);
    }

    set avatar (value) {
      this.animated = value.startsWith('a_');
      this._avatar = BigInt(`0x${this.animated ? value.substr(2) : value}`);
    }

    get username () {
      return this.tag.substr(0, this.tag.lastIndexOf('#'));
    }

    get discriminator () {
      return this.tag.substr(this.tag.lastIndexOf('#') + 1);
    }
}