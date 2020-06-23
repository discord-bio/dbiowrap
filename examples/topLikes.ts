// @ts-ignore
import { Client } from 'dbiowrap';

const c = new Client.Client();

(async () => {
  const user = await c.fetchUserDetails('h');
  console.log(user);
})();
