const source = `function createPPPElement(BaseType) {
  return class extends BaseType {
    constructor() {
      super();

      Controller.forCustomElement(this);
    }
  }
}
class CompilationContext {
  addFactory(factory) {
    factory.targetIndex = this.targetIndex;

    this.behaviorFactories.push(factory);
  }
}

function attr() {
  return 0;
}

function element() {
}

function method() {
}

@dec1({prop: 'value'})
class One extends Object {
  // Non invocation:
  // - @attr
  // Invocation with or w/o opts:
  // - @attr()
  // - @attr({...opts})
  @attr
  a;
  @attr
  b;

  constructor() {
    super();

    this.f = 42;
  }

  @method()
  m1() {}

  @method2()
  m2() {
  }
}

const f = () => {};
@dec2
class Two extends Object {
  @attr
  c;

  @attr
  d;

  m2() {}
}
var a;
let b;
@dec3()
class Three extends Object {
  @attr
  e;

  @attr
  f;

  // Stacked decorators.
  @observable
  @attr({ mode: 'boolean' })
  k;

  @method()
  @method2()
  m5() {}

  m3() {}
}
export default class Four extends Object {
  @attr
  g;

  @attr
  h;

  constructor(args) {
    super(args);

    this.field = '1';

    this.m4();
  }

  m4() {}

  @attr
  j;
}
f();
class BaseProgress extends FoundationElement {
  /**
   * The value of the progress
   * @public
   * @remarks
   * HTML Attribute: value
   */
  @attr({ converter: nullableNumberConverter })
  value;

  /**
   * The minimum value
   * @public
   * @remarks
   * HTML Attribute: min
   */
  @attr({ converter: nullableNumberConverter })
  min;

  /**
   * The maximum value
   * @public
   * @remarks
   * HTML Attribute: max
   */
  @attr({ converter: nullableNumberConverter })
  max;

  /**
   * Indicates the progress is paused
   * @public
   * @remarks
   * HTML Attribute: paused
   */
  @attr({ mode: 'boolean' })
  paused;
}`;

// noinspection DuplicatedCode
// noinspection DuplicatedCode
const DECORATE_HELPER =
  'const __decorate = function (decorators, target, key, desc) {\n' +
  '  let c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;\n' +
  '  for (let i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;\n' +
  '  return c > 3 && r && Object.defineProperty(target, key, r), r;\n' +
  '};\n';

// Only lines containing one of these can be affected, every other line is
// copied verbatim, so the source is never split into lines.
const DECORATOR_CANDIDATE = /@|class|export default/g;

function isDecoratorLine(line) {
  return line.startsWith('@') && !/^@keyframes/.test(line) && !/=/.test(line);
}

function placeDecorators(decorators = []) {
  let result = '';

  for (const { d, c, t, l } of decorators) {
    if (t === 'class') {
      result += `${c} = __decorate([${d}], ${c});\n`;
    } else if (t === 'method') {
      result += `__decorate([${d}], ${c}.prototype, '${l
        .split(/\(/i)[0]
        .trim()}', null);\n`;
    } else if (t === 'prop') {
      result += `__decorate([${d}], ${c}.prototype, '${l
        .split(/=/i)[0]
        .replace(/;/, '')
        .trim()}', void 0);\n`;
    }
  }

  return result;
}

function removeDecorators(source) {
  const decorators = [];
  const chunks = [];
  const length = source.length;
  let currentClass = '';
  let hasDefaultExport = false;
  // Start of the pending run of unmodified source.
  let runStart = 0;
  // Start of the line processed last, a line is handled once.
  let lastLineStart = -1;
  // True when the trailing newline has already been emitted (or dropped).
  let trailingNewlineDone = false;
  let match;

  DECORATOR_CANDIDATE.lastIndex = 0;

  while ((match = DECORATOR_CANDIDATE.exec(source)) !== null) {
    const lineStart = source.lastIndexOf('\n', match.index) + 1;

    if (lineStart === lastLineStart) {
      continue;
    }

    lastLineStart = lineStart;

    let lineEnd = source.indexOf('\n', match.index);

    if (lineEnd === -1) lineEnd = length;

    // Continue scanning from the next line.
    DECORATOR_CANDIDATE.lastIndex = lineEnd + 1;

    const line = source.slice(lineStart, lineEnd).trim();

    if (/class\s+/.test(line)) {
      currentClass = line.split(/class /)[1].split(/\s/)[0];
    }

    if (isDecoratorLine(line)) {
      // Collect the whole stack of decorators, the target follows them.
      const stack = [line.substring(1)];
      let stackEnd = lineEnd;
      let target;
      let targetEnd = -1;

      while (stackEnd < length) {
        targetEnd = source.indexOf('\n', stackEnd + 1);

        if (targetEnd === -1) targetEnd = length;

        target = source.slice(stackEnd + 1, targetEnd).trim();

        if (!isDecoratorLine(target)) {
          break;
        }

        stack.push(target.substring(1));
        stackEnd = targetEnd;
        target = void 0;
        targetEnd = -1;
      }

      const d = stack.join(', ');

      if (/class\s+/.test(target)) {
        currentClass = target.split(/class /)[1].split(/\s/)[0];

        decorators.push({ d, c: currentClass, t: 'class' });
      } else {
        const t = /\)\s+{/.test(target) ? 'method' : 'prop';

        decorators.unshift({ d, c: currentClass, t, l: target });

        if (t === 'prop' && targetEnd !== -1) {
          // Decorator lines are dropped, the property line is replaced by
          // an empty one and is not inspected any further.
          chunks.push(source.slice(runStart, lineStart), '\n');
          runStart = targetEnd + 1;
          lastLineStart = stackEnd + 1;
          DECORATOR_CANDIDATE.lastIndex = targetEnd + 1;
          trailingNewlineDone = targetEnd === length;

          continue;
        }
      }

      // Decorator lines are dropped.
      chunks.push(source.slice(runStart, lineStart));
      runStart = stackEnd + 1;
      lastLineStart = stackEnd + 1;
      DECORATOR_CANDIDATE.lastIndex = stackEnd + 1;
      trailingNewlineDone = stackEnd === length;
    } else if (/(^export default)|(\/\/ export default)/.test(line)) {
      hasDefaultExport = true;

      chunks.push(
        source.slice(runStart, lineStart),
        placeDecorators(decorators)
      );
      runStart = lineStart;
    }
  }

  if (runStart < length) chunks.push(source.slice(runStart));

  // Every line is emitted with a newline, so the output ends with one.
  if (!trailingNewlineDone) chunks.push('\n');

  let result = chunks.join('');

  if (decorators.length) {
    result = DECORATE_HELPER + result;

    if (!hasDefaultExport) {
      result += placeDecorators(decorators);
    }
  }

  return result;
}

console.log(removeDecorators(source));
