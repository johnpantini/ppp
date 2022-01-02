export class DatabaseError extends Error {
  constructor(msg) {
    super(msg.message);
    Object.assign(this, {
      ...msg,
      line: undefined,
      file: undefined,
      routine: undefined
    });

    if (msg.position) this.position = parseInt(msg.position, 10) || undefined;
  }
}
