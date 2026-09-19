import ppp from '../ppp.js';

export async function checkAstraDbCredentials({ dbUrl, dbToken, dbKeyspace }) {
  return ppp.fetch(new URL(`/api/json/v1/${dbKeyspace}`, dbUrl).toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Token: dbToken
    },
    body: JSON.stringify({ findCollections: {} })
  });
}
