export class DocumentNotFoundError extends Error {
  constructor({ documentId} = {}) {
    super('Запись не найдена');

    this.name = this.constructor.name;
    this.documentId = documentId;
  }
}
