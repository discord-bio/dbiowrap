const Client = require('dbiowrap').Client;

const c = new Client.Client();

(async () => {
  const user = await c.fetchUserDetails('h');
  console.log(user);
})();
