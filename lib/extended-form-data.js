// https://html.spec.whatwg.org/multipage/form-elements.html#textarea-line-break-normalisation-transformation
/**
 * @param {string} value Form text.
 * @returns {string} Text with CRLF line breaks.
 */
function normalizeLineFeeds(value) {
  return value.replace(/\r?\n|\r/g, '\r\n');
}

/**
 * @param {string} str Header parameter.
 * @returns {string} Escaped quotes and newlines.
 */
const escape = (str) =>
  str.replace(/\n/g, '%0A').replace(/\r/g, '%0D').replace(/"/g, '%22');

/** FormData with an explicit multipart payload for worker upload APIs. */
class ExtendedFormData extends FormData {
  /**
   * Iterates entries in insertion order, including duplicate names.
   * @param {(value: FormDataEntryValue, name: string, form: FormData) => void} callback Entry visitor.
   * @param {unknown} [thisArg] Receiver supplied to the visitor.
   * @returns {void}
   */
  forEach(callback, thisArg) {
    for (const [name, value] of this) {
      callback.call(thisArg, value, name, this);
    }
  }

  /**
   * Normalizes text line endings and retains file contents as binary chunks.
   * @returns {{contentType: string, chunks: BlobPart[]}} Multipart header and body parts.
   */
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

  /** @returns {Blob} Multipart body with its boundary in the MIME type. */
  toBlob() {
    const { contentType, chunks } = this.toPayload();

    return new Blob(chunks, {
      type: contentType
    });
  }
}

export { ExtendedFormData };
