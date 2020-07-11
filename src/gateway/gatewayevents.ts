import{ Activity } from './types';

export interface BaseEvent {
    id: string
}

export interface Metrics extends BaseEvent {

}

export interface Presence extends BaseEvent {
    name: string;
    type: string;
    url?: string;
    createdTimestamp: number;
    timestamps?: Activity.Timestamp;
    applicationID?: string | null;
    details?: string;
    state?: string;
    emoji?: Activity.Emoji;
    party?: Activity.Party;
    assets?: Activity.Assets;
    flags?: number;
}

export interface ProfileUpdate extends BaseEvent {

}

export interface Subscribe extends BaseEvent {

}

export interface Unknown extends BaseEvent {
    event: string,
    data: any
}

export interface Unsubscribe extends BaseEvent {

}

export interface TotalViewing extends BaseEvent {
    totalViewing: number
}