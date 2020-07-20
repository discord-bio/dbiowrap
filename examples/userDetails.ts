// @ts-ignore
import { Client } from '../src/client';

const c = new Client();

(async () => {
  const user = await c.rest?.fetchUserDetails('h');
  console.log(user);
})();
