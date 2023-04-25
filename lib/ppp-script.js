export function parsePPPScript(script = '') {
  try {
    const blocksReg =
      /\B(\/\/ ==PPPScript==\r?\n([\S\s]*?)\r?\n\/\/ ==\/PPPScript==)([\S\s]*)/;
    const blocks = script.match(blocksReg);

    if (!blocks) {
      return null;
    }

    const metas = blocks[2];
    const content = blocks[3];
    const meta = {};
    const metaArray = metas.split('\n');

    metaArray.forEach(function (m) {
      const parts = m.match(/@([\w-]+)\s+(.+)/);

      if (parts) {
        meta[parts[1]] = meta[parts[1]] || [];
        meta[parts[1]].push(parts[2]);
      }
    });

    return {
      meta,
      content
    };
  } catch (e) {
    console.error(e);

    return null;
  }
}
