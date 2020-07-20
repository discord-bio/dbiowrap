# dbiowrap
The official wrapper for the discord.bio REST and WebSocket APIs.

[Documentation](https://dbiowrap.jacher.io/)

## Install
`npm i dbiowrap`

## Examples
> Internally Discord User objects are stored differently than they were received from the API, which is why you may see "weird" data when inspecting these objects, (e.g. by using `console.log`). However, getters are present that let you use these objects normally, so even though `user._id` stores the User ID as a BigInt, `user.id` still returns the User ID as a string

Example implementations can be found in the `examples` folder.

## Contributing
To contribute, open a PR with your requested changes.
