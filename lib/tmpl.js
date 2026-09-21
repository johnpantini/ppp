/** Async templates for trusted PPP scripts; expressions execute as JavaScript. */
export class Tmpl {
  /**
   * @param {RegExp} [regex] Optional replacement tokenizer for template syntax.
   * @param {string} [arg='payload'] Identifier used to access template data.
   */
  constructor(regex, arg = 'payload') {
    this.regex =
      regex ||
      /([\s'\\])(?!(?:[^[]|\[(?!%))*%])|(?:\[%(=|#)([\s\S]+?)%])|(\[%)|(%])/g;
    this.arg = arg;
    this.encMap = {
      '<': '&lt;',
      '>': '&gt;',
      '&': '&amp;',
      '"': '&quot;',
      [`'`]: '&#39;'
    };
    this.helper =
      `,print=function(s,e){_result+=e?(!s?'':s):_encode(s);}` +
      `,json=function(data = {}){return JSON.stringify(data);}`;
    this.encReg = /[<>&"'\x00]/g;
  }

  /**
   * Evaluates [% code %], escapes [%= value %], and inserts [%# value %] as-is.
   * Templates can await promises and access ctx or this as their context.
   * @param {object} ctx Receiver available to template code.
   * @param {string} str Trusted template source; never accept untrusted code.
   * @param {unknown} [data={}] Payload, or a falsy value to return a reusable renderer.
   * @returns {Promise<string | ((data: unknown) => Promise<string>)>} Rendered output or renderer.
   * @throws {Error} Syntax and evaluation errors propagate to the caller.
   */
  async render(ctx, str, data = {}) {
    this.encode = (s) => {
      return (!s ? '' : '' + s).replace(
        this.encReg,
        (c) => this.encMap[c] || ''
      );
    };

    const AsyncFunction = Object.getPrototypeOf(
      async function () {}
    ).constructor;

    const f = new AsyncFunction(
      'ctx,' + this.arg + ',T',
      'const _encode=T.encode' +
        this.helper +
        `;let _result='` +
        str.replace(this.regex, (s, p1, p2, p3, p4, p5) => {
          if (p1) {
            // Whitespace, quote and backspace in HTML context.
            return (
              {
                '\n': '\\n',
                '\r': '\\r',
                '\t': '\\t',
                ' ': ' '
              }[p1] || '\\' + p1
            );
          }

          if (p2) {
            // Interpolation: [%=prop%], or unescaped: [%#prop%]
            if (p2 === '=') {
              return `'+_encode(` + (p3 ?? '') + `)+'`;
            }

            return `'+(` + (p3 ?? '') + `)+'`;
          }

          if (p4) {
            // evaluation start tag: {%
            return `';`;
          }

          if (p5) {
            // evaluation end tag: %}
            return `_result+='`;
          }
        }) +
        `';return _result;`
    );

    return data
      ? f.call(ctx, ctx, data, this)
      : (data) => {
          return f.call(ctx, ctx, data, this);
        };
  }
}
