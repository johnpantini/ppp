class Base62Str {
  constructor(alphabet) {
    this.alphabet = alphabet;
    this.lookup = this.createLookupTable();
  }

  static getBytes(str) {
    const bytes = [];

    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);

      bytes.push(char & 0xff);
    }

    return bytes;
  }

  static getString(arr) {
    return String.fromCharCode.apply(this, arr);
  }

  /**
   * Creates a {@link Base62Str} instance. Defaults to the GMP-style character set.
   *
   * @return a {@link Base62Str} instance.
   */
  static createInstance() {
    return this.createInstanceWithGmpCharacterSet();
  }

  /**
   * Creates a {@link Base62Str} instance using the GMP-style character set.
   *
   * @return a {@link Base62Str} instance.
   */
  static createInstanceWithGmpCharacterSet() {
    return new Base62Str(Base62Str.CharacterSets.GMP);
  }

  /**
   * Uses the elements of a byte array as indices to a dictionary and returns the corresponding values
   * in form of a byte array.
   */
  static translate(indices, dictionary) {
    const translation = [];

    for (const indicesi of indices) {
      translation.push(dictionary[indicesi]);
    }

    return translation;
  }

  /**
   * Converts a byte array from a source base to a target base using the alphabet.
   */
  static convert(message, sourceBase, targetBase) {
    const out = [];
    let source = message;

    while (source.length > 0) {
      const quotient = [];
      let remainder = 0;

      for (const sourcei of source) {
        const accumulator = (sourcei & 0xff) + remainder * sourceBase;
        const digit = (accumulator - (accumulator % targetBase)) / targetBase;

        remainder = accumulator % targetBase;

        if (quotient.length > 0 || digit > 0) {
          quotient.push(digit);
        }
      }

      out.push(remainder);
      source = quotient;
    }

    for (let i = 0; i < message.length - 1 && message[i] === 0; i++) {
      out.push(0);
    }

    return out.reverse();
  }

  /**
   * Encodes a sequence of bytes in Base62 encoding.
   *
   * @param message a byte sequence.
   * @return a sequence of Base62-encoded bytes.
   */
  encode(message) {
    const indices = Base62Str.convert(
      message,
      Base62Str.STANDARD_BASE,
      Base62Str.TARGET_BASE
    );

    return Base62Str.translate(indices, this.alphabet);
  }

  /**
   * Decodes a sequence of Base62-encoded bytes.
   *
   * @param encoded a sequence of Base62-encoded bytes.
   * @return a byte sequence.
   */
  decode(encoded) {
    const prepared = Base62Str.translate(encoded, this.lookup);

    return Base62Str.convert(
      prepared,
      Base62Str.TARGET_BASE,
      Base62Str.STANDARD_BASE
    );
  }

  encodeStr(input) {
    return Base62Str.getString(this.encode(Base62Str.getBytes(input)));
  }

  decodeStr(input) {
    return Base62Str.getString(this.decode(Base62Str.getBytes(input)));
  }

  /**
   * Creates the lookup table from character to index of character in character set.
   */
  createLookupTable() {
    const lookup = new Array(256);

    for (let i = 0; i < 256; i++) {
      lookup[this.alphabet[i]] = i & 0xff;
    }

    return lookup;
  }
}

Base62Str.CharacterSets = {
  GMP: [
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 65, 66, 67, 68, 69, 70, 71, 72, 73,
    74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98,
    99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113,
    114, 115, 116, 117, 118, 119, 120, 121, 122
  ]
};

Base62Str.STANDARD_BASE = 256;
Base62Str.TARGET_BASE = 62;

export { Base62Str };
