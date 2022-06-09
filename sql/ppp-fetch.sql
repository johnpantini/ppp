drop function if exists ppp_fetch(url text, options json);
create or replace function ppp_fetch(url text, options json default '{}')
returns json as
$$
  let headersPairs = [];
  const headers = options.headers || {};

  for (const h of Object.keys(headers)) {
    headersPairs.push(`http_header('${h}','${headers[h]}')`);
  }

  const headersString = `array[${headersPairs.join(',')}]::http_header[]`;
  let contentType = headers['content-type'] || headers['Content-Type'] || 'null';

  if (contentType !== 'null')
    contentType = `'${contentType}'`;

  let body = options.body || 'null';

  if (body !== 'null')
    body = `'${JSON.stringify(body)}'`;

  const request = plv8.execute(`select http(('${options.method || "GET"}', '${url}', ${headersString}, ${contentType}, ${body})::http_request);`)[0].http;

  return {
    responseText: request.content,
	  headers: request.headers,
	  status: request.status
  }
$$ language plv8;
