import { Client } from '../src/client';

const client = new Client();

(async () => {
  await client.subscribe('233667448887312385');
  client.on('profileUpdate', (data) => {
    console.log(`User ${data.newProfile.discord?.username || data.id} updated their profile`);
  });
  client.on('bannerUpdate', (data) => {
    console.log(`User ${data.id} updated their banner to: ${data.url}`);
  });
})();
