import { RATELIMIT_INTERVAL, REQUEST_LIMIT_PER_INTERVAL } from './constants';

import fetch, { Request as NodeFetchRequest } from 'node-fetch';
import { Client } from './client';
import { HeaderNames } from './types';

export interface BucketEntry {
    request: NodeFetchRequest,
    resolve: any,
    reject: any
}

// todo
export class Bucket {

}
