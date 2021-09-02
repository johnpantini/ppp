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

function removeDecorators(source) {
  const decorators = [];
  const lines = source.split(/\n/gi);
  let result = '';
  let currentClass = '';

  lines.forEach((l, i) => {
    const line = l.trim();

    if (/class\s+/.test(line)) {
      currentClass = line.split(/class /)[1].split(/\s/)[0];
    }

    if (line.startsWith('@') && !/^@keyframes/.test(line) && !/=/.test(line)) {
      const nextLine = lines[i + 1]?.trim();

      if (/class\s+/.test(nextLine)) {
        // Class decorator
        currentClass = nextLine.split(/class /)[1].split(/\s/)[0];

        decorators.push({
          d: line.substr(1),
          c: currentClass,
          t: 'class'
        });
      } else {
        // Member decorator
        const t = /\)\s+{/.test(nextLine) ? 'method' : 'prop';

        decorators.unshift({
          d: line.substr(1),
          c: currentClass,
          t,
          l: nextLine
        });

        t === 'prop' && (lines[i + 1] = '');
      }
    } else result += l + '\n';
  });

  if (decorators.length) {
    result =
      'const __decorate = function (decorators, target, key, desc) {\n' +
      '  let c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;\n' +
      '  for (let i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;\n' +
      '  return c > 3 && r && Object.defineProperty(target, key, r), r;\n' +
      '};\n' +
      result;

    decorators.forEach(({ d, c, t, l }) => {
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
    });
  }

  return result;
}

console.log(removeDecorators(source));
