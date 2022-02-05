export class Tmpl {
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

  async render(ctx, str, data) {
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
        `,_result='` +
        str.replace(this.regex, (s, p1, p2, p3, p4, p5) => {
          if (p1) {
            // whitespace, quote and backspace in HTML context
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
            // interpolation: {%=prop%}, or unescaped: {%#prop%}
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
      ? f(ctx, data, this)
      : function (data) {
          return f(ctx, data, this);
        };
  }
}
