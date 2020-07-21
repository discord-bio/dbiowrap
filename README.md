# dbiowrap
The official wrapper for the discord.bio REST and WebSocket APIs.

[![NPM](https://nodei.co/npm/dbiowrap.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/dbiowrap/)

This wrapper is completely modular, with REST, WebSocket and caching features all able to be controlled and enabled/disabled independantly.

If you have any queries please first refer to the [documentation](https://dbiowrap.jacher.io/). <br>
If your problem cannot be solved there, you can join the official discord.bio [discord server](https://discord.gg/6GYkQTR) and ask there.

## Install
`npm i dbiowrap`

## Examples
> Internally Discord User objects are stored differently than they were received from the API, which is why you may see "weird" data when inspecting these objects, (e.g. by using `console.log`). However, getters are present that let you use these objects normally, so even though `user._id` stores the User ID as a BigInt, `user.id` still returns the User ID as a string

Example implementations can be found in the `examples` folder.

## Contributing
To contribute, open a PR with your requested changes.
