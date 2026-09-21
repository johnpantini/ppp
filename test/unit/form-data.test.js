import { expect, spyOn, test } from 'bun:test';
import { ExtendedFormData } from '../../lib/extended-form-data.js';
import { createWorkerUploadForm, toMimeType } from '../../lib/cloudflare.js';

test('multipart normalizes line endings and escapes disposition parameters', async () => {
  spyOn(Date, 'now').mockReturnValue(42);
  const form = new ExtendedFormData();

  form.append('a"\nb', 'one\rtwo\nthree\r\nfour');
  form.append('file', new File([new Uint8Array([0, 255])], 'x".bin'));
  const payload = form.toPayload();

  expect(payload.contentType).toBe(
    'multipart/form-data; boundary=----ppp-formdata-42'
  );
  expect(payload.chunks[0]).toContain(
    'name="a%22%0D%0Ab"\r\n\r\none\r\ntwo\r\nthree\r\nfour\r\n'
  );
  expect(payload.chunks[1]).toContain(
    'filename="x%22.bin"\r\nContent-Type: application/octet-stream'
  );
  expect(new Uint8Array(await payload.chunks[2].arrayBuffer())).toEqual(
    new Uint8Array([0, 255])
  );
  expect(payload.chunks.at(-1)).toBe('------ppp-formdata-42--');
  expect(form.toBlob().type).toBe(payload.contentType);
});

test('multipart round trips through the platform parser, including duplicate names', async () => {
  const form = new ExtendedFormData();

  form.append('item', 'one');
  form.append('item', 'two');
  form.append('file', new File(['hello'], 'hello.txt', { type: 'text/plain' }));
  const parsed = await new Response(form.toBlob()).formData();
  expect(parsed.getAll('item')).toEqual(['one', 'two']);
  expect(await parsed.get('file').text()).toBe('hello');
  const seen = [];
  form.forEach(function (value, key, parent) {
    expect(this).toBe(seen);
    expect(parent).toBe(form);
    this.push(key);
  }, seen);
  expect(seen).toEqual(['item', 'item', 'file']);
});

test.each([
  ['esm', 'application/javascript+module'],
  ['commonjs', 'application/javascript'],
  ['compiled-wasm', 'application/wasm'],
  ['buffer', 'application/octet-stream'],
  ['text', 'text/plain']
])('maps worker module type %s to its MIME type', (type, mime) => {
  expect(toMimeType(type)).toBe(mime);
});

test('unsupported worker module types fail explicitly', () => {
  expect(() => toMimeType('invalid')).toThrow(TypeError);
});

test('ES modules package bindings and deployment metadata without mutating input', async () => {
  const worker = {
    main: { name: 'index.js', type: 'esm', content: 'export default {}' },
    modules: [{ name: 'helper.js', content: 'export const n = 1' }],
    bindings: {
      vars: { TEXT: 'hello', JSON: { value: 1 } },
      kv_namespaces: [{ id: 'kv', binding: 'KV' }],
      durable_objects: {
        bindings: [
          {
            name: 'OBJECT',
            class_name: 'Counter',
            script_name: 'worker',
            environment: 'prod'
          }
        ]
      },
      queues: [{ binding: 'Q', queue_name: 'jobs' }],
      r2_buckets: [{ binding: 'R2', bucket_name: 'files' }],
      d1_databases: [
        { binding: 'DB', database_id: 'db', database_internal_env: 'prod' }
      ],
      services: [{ binding: 'SVC', service: 'api' }],
      analytics_engine_datasets: [{ binding: 'AE', dataset: 'visits' }],
      dispatch_namespaces: [{ binding: 'NS', namespace: 'namespace' }],
      mtls_certificates: [{ binding: 'CERT', certificate_id: 'cert' }],
      send_email: [{ name: 'EMAIL', destination_address: 'test@example.test' }],
      logfwdr: {
        schema: 'schema',
        bindings: [{ name: 'LOG', destination: 'logs' }]
      },
      unsafe: {
        bindings: [{ name: 'RAW', type: 'custom' }],
        metadata: { custom: true }
      }
    },
    compatibility_date: '2025-01-01',
    compatibility_flags: ['nodejs_compat'],
    migrations: { new_tag: 'v1' },
    keepVars: true,
    logpush: false,
    usage_model: 'bundled'
  };
  const before = structuredClone(worker);
  const form = createWorkerUploadForm(worker);
  const metadata = JSON.parse(form.get('metadata'));

  expect(metadata).toMatchObject({
    main_module: 'index.js',
    compatibility_date: '2025-01-01',
    compatibility_flags: ['nodejs_compat'],
    migrations: { new_tag: 'v1' },
    keep_bindings: ['plain_text', 'json'],
    logpush: false,
    usage_model: 'bundled',
    capnp_schema: 'schema',
    custom: true
  });
  expect(metadata.bindings).toEqual([
    { name: 'TEXT', type: 'plain_text', text: 'hello' },
    { name: 'JSON', type: 'json', json: { value: 1 } },
    { name: 'KV', type: 'kv_namespace', namespace_id: 'kv' },
    {
      name: 'EMAIL',
      type: 'send_email',
      destination_address: 'test@example.test'
    },
    {
      name: 'OBJECT',
      type: 'durable_object_namespace',
      class_name: 'Counter',
      script_name: 'worker',
      environment: 'prod'
    },
    { name: 'Q', type: 'queue', queue_name: 'jobs' },
    { name: 'R2', type: 'r2_bucket', bucket_name: 'files' },
    { name: 'DB', type: 'd1', id: 'db', internalEnv: 'prod' },
    { name: 'SVC', type: 'service', service: 'api' },
    { name: 'AE', type: 'analytics_engine', dataset: 'visits' },
    { name: 'NS', type: 'dispatch_namespace', namespace: 'namespace' },
    { name: 'CERT', type: 'mtls_certificate', certificate_id: 'cert' },
    { name: 'LOG', type: 'logfwdr', destination: 'logs' },
    { name: 'RAW', type: 'custom' }
  ]);
  expect(await form.get('helper.js').text()).toBe('export const n = 1');
  expect(worker).toEqual(before);
});

test('classic workers convert data modules to bindings and reject extra code modules', () => {
  const worker = {
    main: { name: 'worker.js', type: 'commonjs', content: '' },
    bindings: {},
    modules: [
      { name: '__STATIC_CONTENT_MANIFEST', type: 'text', content: '{}' },
      { name: 'data/file.txt', type: 'text', content: 'hello' },
      { name: 'data.bin', type: 'buffer', content: 'data' },
      { name: 'code.wasm', type: 'compiled-wasm', content: new Uint8Array([0]) }
    ]
  };
  const form = createWorkerUploadForm(worker);
  const metadata = JSON.parse(form.get('metadata'));

  expect(metadata.body_part).toBe('worker.js');
  expect(metadata.bindings).toEqual([
    { name: 'data_file_txt', type: 'text_blob', part: 'data_file_txt' },
    { name: 'data_bin', type: 'data_blob', part: 'data_bin' },
    { name: 'code_wasm', type: 'wasm_module', part: 'code_wasm' }
  ]);
  expect(form.has('__STATIC_CONTENT_MANIFEST')).toBe(true);
  expect(worker.modules.length).toBe(4);
  expect(() =>
    createWorkerUploadForm({
      ...worker,
      modules: [{ name: 'extra.js', type: 'esm', content: '' }]
    })
  ).toThrow('More than one module');
});
