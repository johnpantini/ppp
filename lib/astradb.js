import ppp from '../ppp.js';
import { maybeFetchError } from './ppp-errors.js';

export async function fetchAllAstraDocuments({ url, dbToken, errorMessage }) {
  const fetchWithPageState = async (pageState) => {
    const request = await fetch(
      new URL('fetch', ppp.keyVault.getKey('service-machine-url')).toString(),
      {
        cache: 'no-cache',
        method: 'POST',
        body: JSON.stringify({
          method: 'GET',
          url: pageState ? url + `&page-state=${pageState}` : url,
          headers: {
            'X-Cassandra-Token': dbToken
          }
        })
      }
    );

    await maybeFetchError(request, errorMessage);

    return await request.json();
  };

  const result = {};

  let data = await fetchWithPageState();

  Object.assign(result, data.data ?? {});

  while (data.pageState) {
    data = await fetchWithPageState(data.pageState);

    Object.assign(result, data.data ?? {});
  }

  return result;
}

export async function checkAstraDbCredentials({
  dbUrl,
  dbToken,
  dbKeyspace,
  serviceMachineUrl
}) {
  return fetch(new URL('fetch', serviceMachineUrl).toString(), {
    cache: 'no-cache',
    method: 'POST',
    body: JSON.stringify({
      method: 'GET',
      url: new URL(
        `/api/rest/v2/namespaces/${dbKeyspace}/collections`,
        dbUrl
      ).toString(),
      headers: {
        'X-Cassandra-Token': dbToken
      }
    })
  });
}
