# dbiowrap
A wrapper for the discord.bio REST and WebSocket API.

[Documentation](https://jacherr.github.io/dbiowrap)

## Install
`npm i dbiowrap`

## Examples
> Internally Discord User objects are stored differently than they were received from the API, which is why you may see "weird" data when inspecting these objects, (e.g. by using `console.log`). However, getters are present that let you use these objects normally, so even though `user._id` stores the User ID as a BigInt, `user.id` still returns the User ID as a string
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
