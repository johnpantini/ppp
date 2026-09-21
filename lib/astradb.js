import ppp from '../ppp.js';

/**
 * Checks credentials by requesting the keyspace's collection list.
 * @param {object} options Astra database connection settings.
 * @param {string} options.dbUrl Database origin.
 * @param {string} options.dbToken Database access token.
 * @param {string} options.dbKeyspace Keyspace to inspect.
 * @returns {Promise<Response>} Raw response; caller decides how to report failure.
 */
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
