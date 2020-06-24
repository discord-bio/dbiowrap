import { RatelimitLimits, HeaderNames } from './constants';

import fetch, { Request as NodeFetchRequest } from 'node-fetch';
import { Client } from './client';

export interface BucketEntry {
    request: NodeFetchRequest,
    resolve: any,
    reject: any
}

// todo
export class Bucket {

}
