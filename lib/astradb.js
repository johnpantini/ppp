import ppp from '../ppp.js';
import { maybeFetchError } from './ppp-errors.js';

export async function fetchAllAstraDocuments({ url, dbToken, errorMessage }) {
  const fetchWithPageState = async (pageState) => {
    const response = await ppp.fetch(
      pageState ? url + `&page-state=${pageState}` : url,
      {
        headers: {
          'X-Cassandra-Token': dbToken
        }
      }
    );

    await maybeFetchError(response, errorMessage);

    return await response.json();
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

export async function checkAstraDbCredentials({ dbUrl, dbToken, dbKeyspace }) {
  return ppp.fetch(
    new URL(
      `/api/rest/v2/namespaces/${dbKeyspace}/collections`,
      dbUrl
    ).toString(),
    {
      headers: {
        'X-Cassandra-Token': dbToken
      }
    }
  );
}
