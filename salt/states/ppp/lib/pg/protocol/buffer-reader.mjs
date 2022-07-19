export class BufferReader {
  constructor(buffer) {
    this.offset = 0;
    this.buffer = buffer;
  }

  get length() {
    return this.buffer.length;
  }

  readUInt8() {
    this._checkReadable(1);

    const v = this.buffer.readUInt8(this.offset);

    this.offset++;

    return v;
  }

  readUInt16BE() {
    this._checkReadable(2);

    const v = this.buffer.readUInt16BE(this.offset);

    this.offset += 2;

    return v;
  }

  readInt16BE() {
    this._checkReadable(2);

    const v = this.buffer.readInt16BE(this.offset);

    this.offset += 2;

    return v;
  }

  readUInt32BE() {
    this._checkReadable(4);

    const v = this.buffer.readUInt32BE(this.offset);

    this.offset += 4;

    return v;
  }

  readInt32BE() {
    this._checkReadable(4);

    const v = this.buffer.readInt32BE(this.offset);

    this.offset += 4;

    return v;
  }

  readCString(encoding) {
    const idx = this.buffer.indexOf(0, this.offset);
    const v = this.buffer.toString(encoding, this.offset, idx);

    this.offset = idx + 1;

    return v;
  }

  readLString(len, encoding) {
    if (len < 0) return null;

    this._checkReadable(len);

    const v = this.buffer.toString(encoding, this.offset, this.offset + len);

    this.offset += len;

    return v;
  }

  readBuffer(len) {
    if (len) this._checkReadable(len);

    const end = len !== undefined ? this.offset + len : this.length;
    const buf = this.buffer.slice(this.offset, end);

    this.offset = end;

    return buf;
  }

  moveBy(n) {
    return this.moveTo(this.offset + n);
  }

  moveTo(pos) {
    if (pos >= this.length) throw new Error('EOF in buffer detected.');

    this.offset = pos;

    return this;
  }

  _checkReadable(size) {
    if (this.offset + size - 1 >= this.length)
      throw new Error('EOF in buffer detected.');
  }
}
