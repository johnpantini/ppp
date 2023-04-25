// https://html.spec.whatwg.org/multipage/form-elements.html#textarea-line-break-normalisation-transformation
function normalizeLineFeeds(value) {
  return value.replace(/\r?\n|\r/g, '\r\n');
}

const escape = (str) =>
  str.replace(/\n/g, '%0A').replace(/\r/g, '%0D').replace(/"/g, '%22');

class ExtendedFormData extends FormData {
  forEach(callback, thisArg) {
    for (const [name, value] of this) {
      callback.call(thisArg, value, name, this);
    }
  }

  toPayload() {
    const boundary = '----ppp-formdata-' + Date.now(),
      chunks = [],
      p = `--${boundary}\r\nContent-Disposition: form-data; name="`;

    this.forEach((value, name) =>
      typeof value == 'string'
        ? chunks.push(
            p +
              escape(normalizeLineFeeds(name)) +
              `"\r\n\r\n${normalizeLineFeeds(value)}\r\n`
          )
        : chunks.push(
            p +
              escape(normalizeLineFeeds(name)) +
              `"; filename="${escape(value.name)}"\r\nContent-Type: ${
                value.type || 'application/octet-stream'
              }\r\n\r\n`,
            value,
            `\r\n`
          )
    );
    chunks.push(`--${boundary}--`);

    return {
      contentType: 'multipart/form-data; boundary=' + boundary,
      chunks
    };
  }

  toBlob() {
    const { contentType, chunks } = this.toPayload();

    return new Blob(chunks, {
      type: contentType
    });
  }
}

export { ExtendedFormData };
