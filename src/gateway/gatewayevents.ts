import { Activity } from './types';
import { Details } from '../rest/types';

export interface BaseEvent {
    id: string
}

export interface BannerUpdate extends BaseEvent {
    url: string | null
}

export interface Metrics extends BaseEvent {

}

export interface Presence extends BaseEvent {
    name: string
    type: string
    url?: string
    createdTimestamp: number
    timestamps?: Activity.Timestamp
    applicationID?: string | null
    details?: string
    state?: string
    emoji?: Activity.Emoji
    party?: Activity.Party
    assets?: Activity.Assets
    flags?: number
}

export interface ProfileUpdate extends BaseEvent {
    oldProfile: Details.Payload | null
    newProfile: Details.Payload
}

export interface Unknown extends BaseEvent {
    event: string,
    data: any
}

export interface TotalViewing extends BaseEvent {
    count: number
}
