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