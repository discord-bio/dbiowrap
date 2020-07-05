import { RatelimitLimits, HeaderNames } from './constants';

import fetch, { Request as NodeFetchRequest } from 'node-fetch';
import { RestClient } from './restclient';

export interface BucketEntry {
    request: NodeFetchRequest,
    resolve: any,
    reject: any
}

// todo
export class Bucket {

}
