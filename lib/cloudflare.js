import { ExtendedFormData } from './extended-form-data.js';

export function toMimeType(type) {
  switch (type) {
    case 'esm':
      return 'application/javascript+module';
    case 'commonjs':
      return 'application/javascript';
    case 'compiled-wasm':
      return 'application/wasm';
    case 'buffer':
      return 'application/octet-stream';
    case 'text':
      return 'text/plain';
    default:
      throw new TypeError('Unsupported module: ' + type);
  }
}

/**
 * https://github.com/cloudflare/workers-sdk/blob/main/packages/wrangler/src/create-worker-upload-form.ts
 * Creates a `FormData` upload from a `CfWorkerInit`.
 */
export function createWorkerUploadForm(worker) {
  const formData = new ExtendedFormData();
  const {
    main,
    bindings,
    migrations,
    usage_model,
    compatibility_date,
    compatibility_flags,
    keepVars,
    logpush
  } = worker;

  let { modules } = worker;

  const metadataBindings = [];

  Object.entries(bindings.vars || {})?.forEach(([key, value]) => {
    if (typeof value === 'string') {
      metadataBindings.push({ name: key, type: 'plain_text', text: value });
    } else {
      metadataBindings.push({ name: key, type: 'json', json: value });
    }
  });

  bindings.kv_namespaces?.forEach(({ id, binding }) => {
    metadataBindings.push({
      name: binding,
      type: 'kv_namespace',
      namespace_id: id
    });
  });

  bindings.send_email?.forEach(
    ({ name, destination_address, allowed_destination_addresses }) => {
      metadataBindings.push({
        name: name,
        type: 'send_email',
        destination_address,
        allowed_destination_addresses
      });
    }
  );

  bindings.durable_objects?.bindings.forEach(
    ({ name, class_name, script_name, environment }) => {
      metadataBindings.push({
        name,
        type: 'durable_object_namespace',
        class_name: class_name,
        ...(script_name && { script_name }),
        ...(environment && { environment })
      });
    }
  );

  bindings.queues?.forEach(({ binding, queue_name }) => {
    metadataBindings.push({
      type: 'queue',
      name: binding,
      queue_name
    });
  });

  bindings.r2_buckets?.forEach(({ binding, bucket_name }) => {
    metadataBindings.push({
      name: binding,
      type: 'r2_bucket',
      bucket_name
    });
  });

  bindings.d1_databases?.forEach(
    ({ binding, database_id, database_internal_env }) => {
      metadataBindings.push({
        name: binding,
        type: 'd1',
        id: database_id,
        internalEnv: database_internal_env
      });
    }
  );

  bindings.services?.forEach(({ binding, service, environment }) => {
    metadataBindings.push({
      name: binding,
      type: 'service',
      service,
      ...(environment && { environment })
    });
  });

  bindings.analytics_engine_datasets?.forEach(({ binding, dataset }) => {
    metadataBindings.push({
      name: binding,
      type: 'analytics_engine',
      dataset
    });
  });

  bindings.dispatch_namespaces?.forEach(({ binding, namespace }) => {
    metadataBindings.push({
      name: binding,
      type: 'dispatch_namespace',
      namespace
    });
  });

  bindings.mtls_certificates?.forEach(({ binding, certificate_id }) => {
    metadataBindings.push({
      name: binding,
      type: 'mtls_certificate',
      certificate_id
    });
  });

  bindings.logfwdr?.bindings.forEach(({ name, destination }) => {
    metadataBindings.push({
      name: name,
      type: 'logfwdr',
      destination
    });
  });

  if (main.type === 'commonjs') {
    // This is a service-worker format worker.
    for (const module of Object.values([...(modules || [])])) {
      if (module.name === '__STATIC_CONTENT_MANIFEST') {
        // Add the manifest to the form data.
        formData.set(
          module.name,
          new File([module.content], module.name, {
            type: 'text/plain'
          })
        );
        // And then remove it from the modules collection
        modules = modules?.filter((m) => m !== module);
      } else if (
        module.type === 'compiled-wasm' ||
        module.type === 'text' ||
        module.type === 'buffer'
      ) {
        // Convert all wasm/text/data modules into `wasm_module`/`text_blob`/`data_blob` bindings.
        // The "name" of the module is a file path. We use it
        // to instead be a "part" of the body, and a reference
        // that we can use inside our source. This identifier has to be a valid
        // JS identifier, so we replace all non alphanumeric characters
        // with an underscore.
        const name = module.name.replace(/[^a-zA-Z0-9_$]/g, '_');

        metadataBindings.push({
          name,
          type:
            module.type === 'compiled-wasm'
              ? 'wasm_module'
              : module.type === 'text'
              ? 'text_blob'
              : 'data_blob',
          part: name
        });

        // Add the module to the form data.
        formData.set(
          name,
          new File([module.content], module.name, {
            type:
              module.type === 'compiled-wasm'
                ? 'application/wasm'
                : module.type === 'text'
                ? 'text/plain'
                : 'application/octet-stream'
          })
        );
        // And then remove it from the modules collection
        modules = modules?.filter((m) => m !== module);
      }
    }
  }

  if (bindings.unsafe?.bindings) {
    // @ts-expect-error unsafe bindings don't need to match a specific type here
    metadataBindings.push(...bindings.unsafe.bindings);
  }

  const metadata = {
    ...(main.type !== 'commonjs'
      ? { main_module: main.name }
      : { body_part: main.name }),
    bindings: metadataBindings,
    ...(compatibility_date && { compatibility_date }),
    ...(compatibility_flags && { compatibility_flags }),
    ...(usage_model && { usage_model }),
    ...(migrations && { migrations }),
    capnp_schema: bindings.logfwdr?.schema,
    ...(keepVars && { keep_bindings: ['plain_text', 'json'] }),
    ...(logpush !== undefined && { logpush })
  };

  if (bindings.unsafe?.metadata !== undefined) {
    for (const key of Object.keys(bindings.unsafe.metadata)) {
      metadata[key] = bindings.unsafe.metadata[key];
    }
  }

  formData.set('metadata', JSON.stringify(metadata));

  if (main.type === 'commonjs' && modules && modules.length > 0) {
    throw new TypeError(
      "More than one module can only be specified when type = 'esm'"
    );
  }

  for (const module of [main].concat(modules || [])) {
    formData.set(
      module.name,
      new File([module.content], module.name, {
        type: toMimeType(module.type ?? main.type ?? 'esm')
      })
    );
  }

  return formData;
}
