# dbiowrap
A wrapper for the discord.bio REST API.

## Install
`npm i dbiowrap`

## Examples

### TypeScript

```ts
import { Client } from 'dbiowrap/lib/src/client';

const c = new Client();

(async () => {
  const user = await c.fetchUserDetails('h');
  console.log(user);
})();
```


### JavaScript

```js
const Client = require('dbiowrap').Client;

const c = new Client.Client();

(async () => {
  const user = await c.fetchUserDetails('h');
  console.log(user);
})();
```

## Contributing
To contribute, open a PR with your requested changes.
