function parseXml(data, options = {}) {
  function trimZeros(numStr) {
    if (numStr && numStr.indexOf('.') !== -1) {
      numStr = numStr.replace(/0+$/, '');

      if (numStr === '.') numStr = '0';
      else if (numStr[0] === '.') numStr = '0' + numStr;
      else if (numStr[numStr.length - 1] === '.')
        numStr = numStr.substr(0, numStr.length - 1);

      return numStr;
    }

    return numStr;
  }

  const consider = {
    hex: true,
    leadingZeros: true,
    decimalPoint: '.',
    eNotation: true
  };

  const hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
  const numRegex =
    /^([\-\+])?(0*)(\.[0-9]+([eE]\-?[0-9]+)?|[0-9]+(\.[0-9]+([eE]\-?[0-9]+)?)?)$/;

  function toNumber(str, options = {}) {
    options = Object.assign({}, consider, options);

    if (!str || typeof str !== 'string') return str;

    let trimmedStr = str.trim();

    if (options.skipLike !== undefined && options.skipLike.test(trimmedStr))
      return str;
    else if (options.hex && hexRegex.test(trimmedStr)) {
      return Number.parseInt(trimmedStr, 16);
    } else {
      const match = numRegex.exec(trimmedStr);

      if (match) {
        const sign = match[1];
        const leadingZeros = match[2];
        let numTrimmedByZeros = trimZeros(match[3]);

        const eNotation = match[4] || match[6];

        if (
          !options.leadingZeros &&
          leadingZeros.length > 0 &&
          sign &&
          trimmedStr[2] !== '.'
        )
          return str;
        else if (
          !options.leadingZeros &&
          leadingZeros.length > 0 &&
          !sign &&
          trimmedStr[1] !== '.'
        )
          return str;
        else {
          const num = Number(trimmedStr);
          const numStr = '' + num;

          if (numStr.search(/[eE]/) !== -1) {
            if (options.eNotation) return num;
            else return str;
          } else if (eNotation) {
            if (options.eNotation) return num;
            else return str;
          } else if (trimmedStr.indexOf('.') !== -1) {
            if (numStr === '0' && numTrimmedByZeros === '') return num;
            else if (numStr === numTrimmedByZeros) return num;
            else if (sign && numStr === '-' + numTrimmedByZeros) return num;
            else return str;
          }

          if (leadingZeros) {
            if (numTrimmedByZeros === numStr) return num;
            else if (sign + numTrimmedByZeros === numStr) return num;
            else return str;
          }

          if (trimmedStr === numStr) return num;
          else if (trimmedStr === sign + numStr) return num;

          return str;
        }
      } else {
        return str;
      }
    }
  }

  function readDocType(xmlData, i) {
    const entities = {};

    if (
      xmlData[i + 3] === 'O' &&
      xmlData[i + 4] === 'C' &&
      xmlData[i + 5] === 'T' &&
      xmlData[i + 6] === 'Y' &&
      xmlData[i + 7] === 'P' &&
      xmlData[i + 8] === 'E'
    ) {
      i = i + 9;

      let angleBracketsCount = 1;
      let hasBody = false,
        entity = false,
        comment = false;
      let exp = '';

      for (; i < xmlData.length; i++) {
        if (xmlData[i] === '<') {
          if (
            hasBody &&
            xmlData[i + 1] === '!' &&
            xmlData[i + 2] === 'E' &&
            xmlData[i + 3] === 'N' &&
            xmlData[i + 4] === 'T' &&
            xmlData[i + 5] === 'I' &&
            xmlData[i + 6] === 'T' &&
            xmlData[i + 7] === 'Y'
          ) {
            i += 7;
            entity = true;
          } else if (
            hasBody &&
            xmlData[i + 1] === '!' &&
            xmlData[i + 2] === 'E' &&
            xmlData[i + 3] === 'L' &&
            xmlData[i + 4] === 'E' &&
            xmlData[i + 5] === 'M' &&
            xmlData[i + 6] === 'E' &&
            xmlData[i + 7] === 'N' &&
            xmlData[i + 8] === 'T'
          ) {
            i += 8;
          } else if (
            xmlData[i + 1] === '!' &&
            xmlData[i + 2] === '-' &&
            xmlData[i + 3] === '-'
          ) {
            comment = true;
          } else {
            throw new Error('Invalid DOCTYPE');
          }

          angleBracketsCount++;
          exp = '';
        } else if (xmlData[i] === '>') {
          if (comment) {
            if (xmlData[i - 1] === '-' && xmlData[i - 2] === '-') {
              comment = false;
            } else {
              throw new Error(`Invalid XML comment in DOCTYPE`);
            }
          } else if (entity) {
            parseEntityExp(exp, entities);
            entity = false;
          }

          angleBracketsCount--;

          if (angleBracketsCount === 0) {
            break;
          }
        } else if (xmlData[i] === '[') {
          hasBody = true;
        } else {
          exp += xmlData[i];
        }
      }

      if (angleBracketsCount !== 0) {
        throw new Error(`Unclosed DOCTYPE`);
      }
    } else {
      throw new Error(`Invalid Tag instead of DOCTYPE`);
    }

    return { entities, i };
  }

  const entityRegex = RegExp('^\\s([a-zA-z0-9]+)[ \t]([\'"])([^&]+)\\2');

  function parseEntityExp(exp, entities) {
    const match = entityRegex.exec(exp);

    if (match) {
      entities[match[1]] = {
        regx: RegExp(`&${match[1]};`, 'g'),
        val: match[3]
      };
    }
  }

  class XmlNode {
    constructor(tagname) {
      this.tagname = tagname;
      this.child = [];
      this[':@'] = {};
    }

    add(key, val) {
      this.child.push({ [key]: val });
    }

    addChild(node) {
      if (node[':@'] && Object.keys(node[':@']).length > 0) {
        this.child.push({ [node.tagname]: node.child, [':@']: node[':@'] });
      } else {
        this.child.push({ [node.tagname]: node.child });
      }
    }
  }

  const getAllMatches = function (string, regex) {
    const matches = [];
    let match = regex.exec(string);

    while (match) {
      const allmatches = [];

      allmatches.startIndex = regex.lastIndex - match[0].length;

      const len = match.length;

      for (let index = 0; index < len; index++) {
        allmatches.push(match[index]);
      }

      matches.push(allmatches);
      match = regex.exec(string);
    }

    return matches;
  };

  isExist = function (v) {
    return typeof v !== 'undefined';
  };

  class OrderedObjParser {
    constructor(options) {
      this.options = options;
      this.currentNode = null;
      this.tagsNodeStack = [];
      this.docTypeEntities = {};
      this.lastEntities = {
        amp: { regex: /&(amp|#38|#x26);/g, val: '&' },
        apos: { regex: /&(apos|#39|#x27);/g, val: "'" },
        gt: { regex: /&(gt|#62|#x3E);/g, val: '>' },
        lt: { regex: /&(lt|#60|#x3C);/g, val: '<' },
        quot: { regex: /&(quot|#34|#x22);/g, val: '"' }
      };
      this.htmlEntities = {
        space: { regex: /&(nbsp|#160);/g, val: ' ' },
        lt: { regex: /&(lt|#60);/g, val: '<' },
        gt: { regex: /&(gt|#62);/g, val: '>' },
        amp: { regex: /&(amp|#38);/g, val: '&' },
        quot: { regex: /&(quot|#34);/g, val: '"' },
        apos: { regex: /&(apos|#39);/g, val: "'" },
        cent: { regex: /&(cent|#162);/g, val: '¢' },
        pound: { regex: /&(pound|#163);/g, val: '£' },
        yen: { regex: /&(yen|#165);/g, val: '¥' },
        euro: { regex: /&(euro|#8364);/g, val: '€' },
        copyright: { regex: /&(copy|#169);/g, val: '©' },
        reg: { regex: /&(reg|#174);/g, val: '®' },
        inr: { regex: /&(inr|#8377);/g, val: '₹' }
      };
      this.addExternalEntities = addExternalEntities;
      this.parseXml = parseXml;
      this.parseTextData = parseTextData;
      this.resolveNameSpace = resolveNameSpace;
      this.buildAttributesMap = buildAttributesMap;
      this.isItStopNode = isItStopNode;
      this.replaceEntitiesValue = replaceEntitiesValue;
      this.readStopNodeData = readStopNodeData;
      this.saveTextToParentTag = saveTextToParentTag;
    }
  }

  function addExternalEntities(externalEntities) {
    const entKeys = Object.keys(externalEntities);

    for (let i = 0; i < entKeys.length; i++) {
      const ent = entKeys[i];

      this.lastEntities[ent] = {
        regex: new RegExp('&' + ent + ';', 'g'),
        val: externalEntities[ent]
      };
    }
  }

  function parseTextData(
    val,
    tagName,
    jPath,
    dontTrim,
    hasAttributes,
    isLeafNode,
    escapeEntities
  ) {
    if (val !== undefined) {
      if (this.options.trimValues && !dontTrim) {
        val = val.trim();
      }

      if (val.length > 0) {
        if (!escapeEntities) val = this.replaceEntitiesValue(val);

        const newval = this.options.tagValueProcessor(
          tagName,
          val,
          jPath,
          hasAttributes,
          isLeafNode
        );

        if (newval === null || newval === undefined) {
          return val;
        } else if (typeof newval !== typeof val || newval !== val) {
          return newval;
        } else if (this.options.trimValues) {
          return parseValue(
            val,
            this.options.parseTagValue,
            this.options.numberParseOptions
          );
        } else {
          const trimmedVal = val.trim();

          if (trimmedVal === val) {
            return parseValue(
              val,
              this.options.parseTagValue,
              this.options.numberParseOptions
            );
          } else {
            return val;
          }
        }
      }
    }
  }

  function resolveNameSpace(tagname) {
    if (this.options.removeNSPrefix) {
      const tags = tagname.split(':');
      const prefix = tagname.charAt(0) === '/' ? '/' : '';

      if (tags[0] === 'xmlns') {
        return '';
      }

      if (tags.length === 2) {
        tagname = prefix + tags[1];
      }
    }

    return tagname;
  }

  const attrsRegx = new RegExp(
    '([^\\s=]+)\\s*(=\\s*([\'"])([\\s\\S]*?)\\3)?',
    'gm'
  );

  function buildAttributesMap(attrStr, jPath) {
    if (!this.options.ignoreAttributes && typeof attrStr === 'string') {
      const matches = getAllMatches(attrStr, attrsRegx);
      const len = matches.length;
      const attrs = {};

      for (let i = 0; i < len; i++) {
        const attrName = this.resolveNameSpace(matches[i][1]);
        let oldVal = matches[i][4];
        const aName = this.options.attributeNamePrefix + attrName;

        if (attrName.length) {
          if (oldVal !== undefined) {
            if (this.options.trimValues) {
              oldVal = oldVal.trim();
            }

            oldVal = this.replaceEntitiesValue(oldVal);

            const newVal = this.options.attributeValueProcessor(
              attrName,
              oldVal,
              jPath
            );

            if (newVal === null || newVal === undefined) {
              attrs[aName] = oldVal;
            } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
              attrs[aName] = newVal;
            } else {
              attrs[aName] = parseValue(
                oldVal,
                this.options.parseAttributeValue,
                this.options.numberParseOptions
              );
            }
          } else if (this.options.allowBooleanAttributes) {
            attrs[aName] = true;
          }
        }
      }

      if (!Object.keys(attrs).length) {
        return;
      }

      if (this.options.attributesGroupName) {
        const attrCollection = {};

        attrCollection[this.options.attributesGroupName] = attrs;

        return attrCollection;
      }

      return attrs;
    }
  }

  const parseXml = function (xmlData) {
    xmlData = xmlData.replace(/\r\n?/g, '\n'); //TODO: remove this line

    const xmlObj = new XmlNode('!xml');
    let currentNode = xmlObj;
    let textData = '';
    let jPath = '';

    for (let i = 0; i < xmlData.length; i++) {
      const ch = xmlData[i];

      if (ch === '<') {
        if (xmlData[i + 1] === '/') {
          const closeIndex = findClosingIndex(
            xmlData,
            '>',
            i,
            'Closing Tag is not closed.'
          );
          let tagName = xmlData.substring(i + 2, closeIndex).trim();

          if (this.options.removeNSPrefix) {
            const colonIndex = tagName.indexOf(':');

            if (colonIndex !== -1) {
              tagName = tagName.substr(colonIndex + 1);
            }
          }

          if (currentNode) {
            textData = this.saveTextToParentTag(textData, currentNode, jPath);
          }

          jPath = jPath.substr(0, jPath.lastIndexOf('.'));

          currentNode = this.tagsNodeStack.pop();
          textData = '';
          i = closeIndex;
        } else if (xmlData[i + 1] === '?') {
          let tagData = readTagExp(xmlData, i, false, '?>');

          if (!tagData) throw new Error('Pi Tag is not closed.');

          textData = this.saveTextToParentTag(textData, currentNode, jPath);

          if (
            (this.options.ignoreDeclaration && tagData.tagName === '?xml') ||
            this.options.ignorePiTags
          ) {
          } else {
            const childNode = new XmlNode(tagData.tagName);

            childNode.add(this.options.textNodeName, '');

            if (tagData.tagName !== tagData.tagExp && tagData.attrExpPresent) {
              childNode[':@'] = this.buildAttributesMap(tagData.tagExp, jPath);
            }

            currentNode.addChild(childNode);
          }

          i = tagData.closeIndex + 1;
        } else if (xmlData.substr(i + 1, 3) === '!--') {
          const endIndex = findClosingIndex(
            xmlData,
            '-->',
            i + 4,
            'Comment is not closed.'
          );

          if (this.options.commentPropName) {
            const comment = xmlData.substring(i + 4, endIndex - 2);

            textData = this.saveTextToParentTag(textData, currentNode, jPath);

            currentNode.add(this.options.commentPropName, [
              { [this.options.textNodeName]: comment }
            ]);
          }

          i = endIndex;
        } else if (xmlData.substr(i + 1, 2) === '!D') {
          const result = readDocType(xmlData, i);

          this.docTypeEntities = result.entities;
          i = result.i;
        } else if (xmlData.substr(i + 1, 2) === '![') {
          const closeIndex =
            findClosingIndex(xmlData, ']]>', i, 'CDATA is not closed.') - 2;
          const tagExp = xmlData.substring(i + 9, closeIndex);

          textData = this.saveTextToParentTag(textData, currentNode, jPath);

          if (this.options.cdataPropName) {
            currentNode.add(this.options.cdataPropName, [
              { [this.options.textNodeName]: tagExp }
            ]);
          } else {
            let val = this.parseTextData(
              tagExp,
              currentNode.tagname,
              jPath,
              true,
              false,
              true
            );

            if (val === undefined) val = '';

            currentNode.add(this.options.textNodeName, val);
          }

          i = closeIndex + 2;
        } else {
          let result = readTagExp(xmlData, i, this.options.removeNSPrefix);
          let tagName = result.tagName;
          let tagExp = result.tagExp;
          let attrExpPresent = result.attrExpPresent;
          let closeIndex = result.closeIndex;

          if (currentNode && textData) {
            if (currentNode.tagname !== '!xml') {
              textData = this.saveTextToParentTag(
                textData,
                currentNode,
                jPath,
                false
              );
            }
          }

          if (tagName !== xmlObj.tagname) {
            jPath += jPath ? '.' + tagName : tagName;
          }

          const lastTag = currentNode;

          if (
            lastTag &&
            this.options.unpairedTags.indexOf(lastTag.tagname) !== -1
          ) {
            currentNode = this.tagsNodeStack.pop();
          }

          if (this.isItStopNode(this.options.stopNodes, jPath, tagName)) {
            let tagContent = '';

            if (
              tagExp.length > 0 &&
              tagExp.lastIndexOf('/') === tagExp.length - 1
            ) {
              i = result.closeIndex;
            } else if (this.options.unpairedTags.indexOf(tagName) !== -1) {
              i = result.closeIndex;
            } else {
              const result = this.readStopNodeData(
                xmlData,
                tagName,
                closeIndex + 1
              );

              if (!result) throw new Error(`Unexpected end of ${tagName}`);

              i = result.i;
              tagContent = result.tagContent;
            }

            const childNode = new XmlNode(tagName);

            if (tagName !== tagExp && attrExpPresent) {
              childNode[':@'] = this.buildAttributesMap(tagExp, jPath);
            }

            if (tagContent) {
              tagContent = this.parseTextData(
                tagContent,
                tagName,
                jPath,
                true,
                attrExpPresent,
                true,
                true
              );
            }

            jPath = jPath.substr(0, jPath.lastIndexOf('.'));
            childNode.add(this.options.textNodeName, tagContent);

            currentNode.addChild(childNode);
          } else {
            if (
              tagExp.length > 0 &&
              tagExp.lastIndexOf('/') === tagExp.length - 1
            ) {
              if (tagName[tagName.length - 1] === '/') {
                tagName = tagName.substr(0, tagName.length - 1);
                tagExp = tagName;
              } else {
                tagExp = tagExp.substr(0, tagExp.length - 1);
              }

              const childNode = new XmlNode(tagName);

              if (tagName !== tagExp && attrExpPresent) {
                childNode[':@'] = this.buildAttributesMap(tagExp, jPath);
              }

              jPath = jPath.substr(0, jPath.lastIndexOf('.'));
              currentNode.addChild(childNode);
            } else {
              const childNode = new XmlNode(tagName);

              this.tagsNodeStack.push(currentNode);

              if (tagName !== tagExp && attrExpPresent) {
                childNode[':@'] = this.buildAttributesMap(tagExp, jPath);
              }

              currentNode.addChild(childNode);
              currentNode = childNode;
            }

            textData = '';
            i = closeIndex;
          }
        }
      } else {
        textData += xmlData[i];
      }
    }

    return xmlObj.child;
  };

  const replaceEntitiesValue = function (val) {
    if (this.options.processEntities) {
      for (let entityName in this.docTypeEntities) {
        const entity = this.docTypeEntities[entityName];

        val = val.replace(entity.regx, entity.val);
      }

      for (let entityName in this.lastEntities) {
        const entity = this.lastEntities[entityName];

        val = val.replace(entity.regex, entity.val);
      }

      if (this.options.htmlEntities) {
        for (let entityName in this.htmlEntities) {
          const entity = this.htmlEntities[entityName];

          val = val.replace(entity.regex, entity.val);
        }
      }
    }

    return val;
  };

  function saveTextToParentTag(textData, currentNode, jPath, isLeafNode) {
    if (textData) {
      if (isLeafNode === undefined)
        isLeafNode = Object.keys(currentNode.child).length === 0;

      textData = this.parseTextData(
        textData,
        currentNode.tagname,
        jPath,
        false,
        currentNode[':@'] ? Object.keys(currentNode[':@']).length !== 0 : false,
        isLeafNode
      );

      if (textData !== undefined && textData !== '')
        currentNode.add(this.options.textNodeName, textData);

      textData = '';
    }

    return textData;
  }

  function isItStopNode(stopNodes, jPath, currentTagName) {
    const allNodesExp = '*.' + currentTagName;

    for (const stopNodePath in stopNodes) {
      const stopNodeExp = stopNodes[stopNodePath];

      if (allNodesExp === stopNodeExp || jPath === stopNodeExp) return true;
    }

    return false;
  }

  function tagExpWithClosingIndex(xmlData, i, closingChar = '>') {
    let attrBoundary;
    let tagExp = '';

    for (let index = i; index < xmlData.length; index++) {
      let ch = xmlData[index];

      if (attrBoundary) {
        if (ch === attrBoundary) attrBoundary = '';
      } else if (ch === '"' || ch === "'") {
        attrBoundary = ch;
      } else if (ch === closingChar[0]) {
        if (closingChar[1]) {
          if (xmlData[index + 1] === closingChar[1]) {
            return {
              data: tagExp,
              index: index
            };
          }
        } else {
          return {
            data: tagExp,
            index: index
          };
        }
      } else if (ch === '\t') {
        ch = ' ';
      }

      tagExp += ch;
    }
  }

  function findClosingIndex(xmlData, str, i, errMsg) {
    const closingIndex = xmlData.indexOf(str, i);

    if (closingIndex === -1) {
      throw new Error(errMsg);
    } else {
      return closingIndex + str.length - 1;
    }
  }

  function readTagExp(xmlData, i, removeNSPrefix, closingChar = '>') {
    const result = tagExpWithClosingIndex(xmlData, i + 1, closingChar);

    if (!result) return;

    let tagExp = result.data;
    const closeIndex = result.index;
    const separatorIndex = tagExp.search(/\s/);
    let tagName = tagExp;
    let attrExpPresent = true;

    if (separatorIndex !== -1) {
      tagName = tagExp.substr(0, separatorIndex).replace(/\s\s*$/, '');
      tagExp = tagExp.substr(separatorIndex + 1);
    }

    if (removeNSPrefix) {
      const colonIndex = tagName.indexOf(':');

      if (colonIndex !== -1) {
        tagName = tagName.substr(colonIndex + 1);
        attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
      }
    }

    return {
      tagName: tagName,
      tagExp: tagExp,
      closeIndex: closeIndex,
      attrExpPresent: attrExpPresent
    };
  }

  function readStopNodeData(xmlData, tagName, i) {
    const startIndex = i;
    let openTagCount = 1;

    for (; i < xmlData.length; i++) {
      if (xmlData[i] === '<') {
        if (xmlData[i + 1] === '/') {
          const closeIndex = findClosingIndex(
            xmlData,
            '>',
            i,
            `${tagName} is not closed`
          );
          let closeTagName = xmlData.substring(i + 2, closeIndex).trim();

          if (closeTagName === tagName) {
            openTagCount--;

            if (openTagCount === 0) {
              return {
                tagContent: xmlData.substring(startIndex, i),
                i: closeIndex
              };
            }
          }

          i = closeIndex;
        } else {
          const tagData = readTagExp(xmlData, i, '>');

          if (tagData) {
            const openTagName = tagData && tagData.tagName;

            if (openTagName === tagName) {
              openTagCount++;
            }

            i = tagData.closeIndex;
          }
        }
      }
    }
  }

  function parseValue(val, shouldParse, options) {
    if (shouldParse && typeof val === 'string') {
      const newval = val.trim();

      if (newval === 'true') return true;
      else if (newval === 'false') return false;
      else return toNumber(val, options);
    } else {
      if (isExist(val)) {
        return val;
      } else {
        return '';
      }
    }
  }

  function prettify(node, options) {
    return compress(node, options);
  }

  function compress(arr, options, jPath) {
    let text;
    const compressedObj = {};

    for (let i = 0; i < arr.length; i++) {
      const tagObj = arr[i];
      const property = propName(tagObj);
      let newJpath = '';

      if (jPath === undefined) newJpath = property;
      else newJpath = jPath + '.' + property;

      if (property === options.textNodeName) {
        if (text === undefined) text = tagObj[property];
        else text += '' + tagObj[property];
      } else if (property === undefined) {
        continue;
      } else if (tagObj[property]) {
        let val = compress(tagObj[property], options, newJpath);
        const isLeaf = isLeafTag(val, options);

        if (tagObj[':@']) {
          assignAttributes(val, tagObj[':@'], newJpath, options);
        } else if (
          Object.keys(val).length === 1 &&
          val[options.textNodeName] !== undefined &&
          !options.alwaysCreateTextNode
        ) {
          val = val[options.textNodeName];
        } else if (Object.keys(val).length === 0) {
          if (options.alwaysCreateTextNode) val[options.textNodeName] = '';
          else val = '';
        }

        if (
          compressedObj[property] !== undefined &&
          compressedObj.hasOwnProperty(property)
        ) {
          if (!Array.isArray(compressedObj[property])) {
            compressedObj[property] = [compressedObj[property]];
          }

          compressedObj[property].push(val);
        } else {
          if (options.isArray(property, newJpath, isLeaf)) {
            compressedObj[property] = [val];
          } else {
            compressedObj[property] = val;
          }
        }
      }
    }

    if (typeof text === 'string') {
      if (text.length > 0) compressedObj[options.textNodeName] = text;
    } else if (text !== undefined) compressedObj[options.textNodeName] = text;

    return compressedObj;
  }

  function propName(obj) {
    const keys = Object.keys(obj);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      if (key !== ':@') return key;
    }
  }

  function assignAttributes(obj, attrMap, jpath, options) {
    if (attrMap) {
      const keys = Object.keys(attrMap);
      const len = keys.length; //don't make it inline

      for (let i = 0; i < len; i++) {
        const atrrName = keys[i];

        if (options.isArray(atrrName, jpath + '.' + atrrName, true, true)) {
          obj[atrrName] = [attrMap[atrrName]];
        } else {
          obj[atrrName] = attrMap[atrrName];
        }
      }
    }
  }

  function isLeafTag(obj, options) {
    const propCount = Object.keys(obj).length;

    return propCount === 0 || (propCount === 1 && obj[options.textNodeName]);
  }

  const defaultOptions = {
    preserveOrder: false,
    attributeNamePrefix: '@_',
    attributesGroupName: false,
    textNodeName: '#text',
    ignoreAttributes: true,
    removeNSPrefix: false,
    allowBooleanAttributes: false,
    parseTagValue: true,
    parseAttributeValue: false,
    trimValues: true,
    cdataPropName: false,
    numberParseOptions: {
      hex: true,
      leadingZeros: true
    },
    tagValueProcessor: function (tagName, val) {
      return val;
    },
    attributeValueProcessor: function (attrName, val) {
      return val;
    },
    stopNodes: [],
    alwaysCreateTextNode: false,
    isArray: () => false,
    commentPropName: false,
    unpairedTags: [],
    processEntities: true,
    htmlEntities: false,
    ignoreDeclaration: false,
    ignorePiTags: false
  };

  const buildOptions = function (options) {
    return Object.assign({}, defaultOptions, options);
  };

  class XMLParser {
    constructor(options) {
      this.options = buildOptions(options);
    }

    /**
     * Parse XML data to JS object
     * @param {string|Buffer} xmlData
     */
    parse(xmlData) {
      if (typeof xmlData === 'string') {
      } else if (xmlData.toString) {
        xmlData = xmlData.toString();
      } else {
        throw new Error('XML data is accepted in String or Bytes[] form.');
      }

      const orderedObjParser = new OrderedObjParser(this.options);
      const orderedResult = orderedObjParser.parseXml(xmlData);

      if (this.options.preserveOrder || orderedResult === undefined)
        return orderedResult;
      else return prettify(orderedResult, this.options);
    }
  }

  return new XMLParser(options).parse(data);
}

// console.log(
//   parseXml(
//     '<?xml version="1.0" encoding="UTF-8"?><note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Do not forget me this weekend!</body></note>'
//   )
// );

// The Fly
const html = `





<!DOCTYPE html>
<html lang="en">
<head>


<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NVM4XFS');</script>
<!-- End Google Tag Manager -->

<!-- CONFIGURACIÓN DE SOCIAL MEDIA -->
<script>
  const GOOGLE_SIGNIN_CLIENTID = '271806115842-ivr99kbfuv959pbun0104kamk9vgt6o6.apps.googleusercontent.com';
  const FACEBOOK_SIGNIN_CLIENTID = '241853041812724';
</script>

<!-- IMPORTAR SCRIPT DE FACEBOOK -->
      <script src="https://accounts.google.com/gsi/client"></script>


<style>
#wrapper, #wrapper.no_sidebar {
padding: 0;
position: relative;
box-shadow: 0 -50px 56px rgba(0, 0, 0, 0.50);
-moz-box-shadow: 0 -50px 56px rgba(0, 0, 0, 0.50);
-webkit-box-shadow: 0 -50px 56px rgba(0, 0, 0, 0.50);
vertical-align: top;
background: #254B82;
margin: 113px auto 0 auto;	}
</style>
<!-- Google --><meta name="title" content="Breaking News - The Fly">
<meta name="description" content="Breaking News - The Fly. The Fly team scours all sources of company news, from mainstream to cutting edge,then filters out the noise to deliver shortform stories consisting of only market moving content.">
<meta name="keywords" content="stock market news, financial investment news, live stock market news, live stock market feeds, stock market alerts">
<!-- Twitter --><meta property="twitter:card" content="summary_large_image">
<meta property="twitter:site" content="@theflynews">
<meta property="twitter:title" content="Breaking News - The Fly">
<meta property="twitter:description" content="Breaking News - The Fly. The Fly team scours all sources of company news, from mainstream to cutting edge,then filters out the noise to deliver shortform stories consisting of only market moving content.">
<meta property="twitter:image" content="https://thefly.com/images/meta/metatags.jpg">
<!-- Open Graph - Facebook --><meta property="og:type" content="website">
<meta property="og:title" content="Breaking News - The Fly">
<meta property="og:description" content="Breaking News - The Fly. The Fly team scours all sources of company news, from mainstream to cutting edge,then filters out the noise to deliver shortform stories consisting of only market moving content.">
<meta property="og:image" content="https://thefly.com/images/meta/metatags.jpg">
<link rel="alternate" media="only screen and (max-width: 640px)" href="https://m.thefly.com/news-feed"><title>Breaking News - The Fly</title>
<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
<meta http-equiv="Content-type" content="text/html; charset=UTF-8" />
<meta name="Googlebot-News" content="noindex, nofollow"><script type="text/javascript" src="/js/log.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/jquery-1.7.2.js?lastUpdate=20240323104"></script> 
<script>
//#1067 Algunos plugins generan llamados a undefined page siempre que haya un input con el nombre "search". Esto lo debería apagar.
window.suggestmeyes_loaded = true;
//	Variable global que indica en qué página está
var page = 'news';
var loggedin = 0;
var esGrandfathered = 0;
var snf = 0;
var subs = 0;
var fts = 'https://thefly.com//free_trial.php';
var sfd = 'https://thefly.com/';
var logJs = false;
var sessionNotify = {};
sessionNotify.title = "";
sessionNotify.message = "";
sessionNotify.redirect = "";

/* Free user */
var esFreeUser = 0; 
var freeUserFTDone = 0; 
var fu_quota_news = 1;
var fu_quota_syndicate = 1;
var fu_quota_events = 1;

// social Media Ints
var sm_goog_enabled = 1;
var sm_fb_enabled = 0;
var sm_li_enabled = 1;


</script>

<!--[if lt IE 9]>
<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->

<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="viewport" content="width=device-width,initial-scale=1.0">

<!-- <link rel="icon" href="< ?php echo $site_root; ? >/theflyFav.png" type="image/png" />  -->
<link rel="icon" href="/flyfavicon.png" />
<link rel="shortcut icon" href="/flyfavicon.png" />

<!--
<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon.png"/>
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
<link rel="manifest" href="/manifest.json"/>
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5"/>
<meta name="msapplication-TileColor" content="#2d89ef"/>
<meta name="theme-color" content="#5d8dd6"/>-->


<link rel="stylesheet" href="/js/plugins/uniform/css/uniform.css">
<link rel="stylesheet" href="/js/plugins/uniform/css/uniform.fotw.css">
<link rel="stylesheet" href="/js/plugins/fancybox/jquery.fancybox-1.3.4.css">
<link rel="stylesheet" href="/css/blue.monday/jplayer.thefly.css">

<link rel="stylesheet" href="/css/todos.css?lastUpdate=20240323104">
<!--[if gte IE 9]>
<link rel="stylesheet" href="/css/ie_9up.css">
<![endif]-->
<!--[if lt IE 9]>
<link rel="stylesheet" href="/css/ie_old.css">
<![endif]-->
  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-Q8C51VDZZ2"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-Q8C51VDZZ2', {
          'custom_map': {'dimension1': 'loginStatus'}});
        
        //gtag('set', 'loginStatus', 'notlogged');

  </script>

        
<!-- Global Site Tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-57334935-1"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('set', 'loginStatus', 'notlogged');
gtag('set', 'dimension1', 'notlogged');
gtag('config', 'UA-57334935-1');
var gtagId = "G-Q8C51VDZZ2";
var ga_client_id = false;

gtag('get', gtagId, 'client_id', (clientID) => {
    ga_client_id = clientID;
});

</script>

    
  
  <script>
    /* Wrappers para analytics 
        - Modificaciones: el parametro fieldsObject se elimino porque no se usa. Para implementarlo en la nueva version hay que agergar para los casos especificos el config. Ver la doc sobre este punto en Google
    */
    function aTrackEvent(eventCategory, eventAction, eventLabel, eventValue, fieldsObject){
                  // Le paso la dmiension a cada evento por si no lo toma de la sesion
          gtag('event', eventAction, {
            'event_category': eventCategory,
            'event_label': eventLabel,
            'value': eventValue,
            'loginStatus': 'notlogged'
          });
              log("aTrackEvent('"+eventCategory+"','"+eventAction+"','"+eventLabel+"','"+eventValue+"')");
      //console.log("aTrackEvent('"+eventCategory+"','"+eventAction+"','"+eventLabel+"','"+eventValue+"')");
      return true;
    }

    function trackTiming(category, timingVar, timingValue, timingLabel ){
      // Le paso la dmiension a cada evento por si no lo toma de la sesion
      gtag('event', 'timing_complete', {
          'name': timingVar,
          'value': timingValue,
          'event_category': category,
          'event_label': timingLabel,
          'loginStatus': 'notlogged'
        });

      log("trackTiming('"+category+"','"+timingVar+"','"+timingValue+"','"+timingLabel+"')");
    }

  </script>

  
    
    <script>

    $("document").ready(function(){
        /* No esto y seguro cual de las dos esta funcionando, dejo las dos formas */
        gtag('set', 'loginStatus', 'notlogged');
        gtag('set', 'dimension1', 'notlogged');
    });
    </script>
  <script type='application/ld+json'>
{"@context":"http:\/\/schema.org","@type":"Organization","url":"https:\/\/thefly.com","logo":"https:\/\/thefly.com\/images\/logo_thefly_small.png","contactPoint":[{"@type":"ContactPoint","telephone":"+1 908 273 6397","contactType":"customer support","areaServed":"US","availableLanguage":"English"}],"sameAs":[]}</script><script type='application/ld+json'>
{"@context":"http:\/\/schema.org","@type":"WebSite","name":"TheFly.com","alternateName":"First site in stock news.","url":"https:\/\/thefly.com"}</script>


<script src="/c3650cdf-216a-4ba2-80b0-9d6c540b105e58d2670b-ea0f-484e-b88c-0e2c1499ec9bd71e4b42-8570-44e3-89b6-845326fa43b6" type="text/javascript"></script>

</head>
<body class=" ">

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NVM4XFS"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->



<div class="cookie-banner" style="display:none">
        <div class="exclamation-icon">
          <img src="/images/exclamation_icon.png"/>
        </div>
        <div class="consent-message">
          <div class="consent-title">We use cookies to improve user experience, and analyze website traffic.
          </div>
          <div class="consent-text">
          For these reasons, we may share your site usage data with our analytics partners. By clicking "Accept Cookies" you consent to store on your device all the technologies described in our <a href="/overlays/disclaimer.php?h=Privacy%20Policy&go=priv" class='open_disclaimer_overlay'>Cookie Policy.</a>
          </div>
        </div>
        <div class="consent-accept">
          <button class="cookie-accept gold">ACCEPT COOKIES</button>
        </div>
         </div><header id="site_header"  class="gradient site_header_back">
<div class="container">
  <dl id='site_logo'>&nbsp;</dl> 
  <input type='button' class="send go_free_trial logo_button" value='Start Free Trial' name='start_account'>
  <div id="header-login-wrapper">
<nav
id="utility-new-login"
class="login-form"
>
<input
  type="checkbox"
  name="login_switcher"
  id="login_switcher"
  class="not_uniform"
>
<label
  id="login_label"
  for="login_switcher"
>
  <span>
    Login
  </span>
</label>
<span>
  |
</span>
<a id="#login_form_free_signup" href="/free_sign_up.php">
  Join
</a>
<nav
  id="login_nav"
>
  <div>
    <span>
      Sign In with:
    </span>
    <ul>
              <li>
        <!--
        <div
          id="google-login"
        ></div>
        -->
        
        <div id="google-login" ></div>
        <button id="google-login-alternative" data-href="g_red.php?cb=news.php&a=2" style='display:none !important'>
          <i>
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="LgbsSe-Bz112c"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg>
          </i>
          <span>
          Google
          </span>
          </button>
          <div id="g_id_onload"
               data-client_id="271806115842-ivr99kbfuv959pbun0104kamk9vgt6o6.apps.googleusercontent.com"
               data-context="use" 
               data-auto_select="true"
               data-itp_support="true"
               >
          </div>
                    
      </li>
                                <li>
          <button
          id="linkedin-sign-up"
          class="linkedin-login-button"
          data-href="ld_red.php?cb=news.php&a=2"
        >
          <i>
            <img width='25px' src="images/sm_ln_logo.png" />
          </i>
          <span>
            LinkedIn
          </span>
        </button>					</li>
            </ul>
  </div>
  <hr
    text="OR"
  >
  <form action="login.php" id="login_form" class="form-login" method="post">
    <label>
      <input name="username" id="username" type="text" class="textinput not_uniform" size="28" maxlength="50" placeholder="Email/Username">
    </label>
    <label>
      <input name="password" id="password" type="password" class="textinput not_uniform" size="28" maxlength="50" placeholder="Password">
    </label>
    <label>
      <input name="remember_me" id="remember_me" type="checkbox" />&nbsp;Remember me			</label>
    <label>
      <input
        type="submit"
        value="LOGIN"
        id="submit_login"
      />
    </label>
          <input type="hidden" name='ga_client_id' value=''>
    <input type="hidden" name='platform_id' value=''>
    <input type="hidden" name='credentials' value=''>
    <input type="hidden" name='state' value=''>
    <span>
      Forgot your password?
      <a href="overlays/forgotPassword.php" class="forgot_password">Click here</a>
      </a>
    </span>
  </form>
  <hr>
  <span>
    Not registered yet?
    <a
      href="/free_sign_up.php"
    >
      Join Now
    </a>
  </span>
</nav>
</nav><!-- /utility-new -->
</div>	</div><!-- /container -->
</header><!-- /site_header -->
<nav id="site_header_nav"  class="gradient">
<div class="container">
  <ul class="sf-menu">
    <li><a href="/">Home</a></li>
    <li class="active"><a href="#">News &amp; Analysis</a>
      <ul style="display: none;">
        <li><a href="news.php">Breaking&nbsp;News</a></li>
        <li><a href="news.php?onthefly=on&h=6">On The Fly</a></li>
        <li><a href="#" onClick="javascript:openRadioWindow(this);return false;">Fly cast</a></li>
      </ul>
    </li>
    
            <li><a href="portfolios.php">My Portfolios</a></li>
            <li ><a id='link_calendar_menu' href="#">Calendars & Tools</a>
      <ul class='ul_menu_dentro_calendar' style="display: none;">
                    <li><a href="events.php">Events</a></li>
                            <li><a href="syndicate.php">Syndicate</a></li>
                  <li><a href="streetResearch.php">Street&nbsp;Research</a></li>
        <li><a href="dividend_calculator.php">Dividend Calculator</a></li>
      </ul>			
    </li>
    <li ><a id='link_about_menu' href="#">About The Fly</a>
      <ul style="display: none;" id="menu_about_list">
        <li><a href="services.php">Services</a></li>
        <li><a href="about_the_fly.php">About&nbsp;Us</a></li>
        <li><a href="faq.php">HELP/FAQ</a></li>
        <li><a href="contact.php">Contact Us</a></li>
        <li><a href='/rates.php' class='open_subscriptions_overlay ' >Subscriptions</a></li>
        <li><a href="/overlays/disclaimer.php" class='open_disclaimer_overlay'>Disclaimer and Terms of Use</a></li>
        <!--<li><a href="/overlays/disclaimer.php?h=Privacy%20Policy&go=priv" class='open_disclaimer_overlay'>Privacy Policy</a></li>-->
        <li><a href="/disclaimer.php?h=Privacy%20Policy&go=priv">Privacy Policy</a>					<li class='wrap_menu'><a href="/ads_app.php" class='open_donotsellinfo'>Limit the use of my sensitive personal information</a></li>
      </ul>
    </li>
    <li><a class='no-upercase' href="apis.php">APIs</a></li>


  
    <!--			<li ><a href="mailto:support@thefly.com">Contact</a></li>
       <li><a href="#" class="disabled">Calendars</a></li>-->
  </ul>
      
  <form action="news.php" method="get" id="nav_search">
    <input id='input_nav_search' name="symbol" type="text" class="textinput" size="10" maxlength="50" placeholder="Enter Symbol">
    <input type="image" src="/images/buttons/search_nav.png">
  </form>
  
</div><!-- /container -->
</nav><!-- site_header_nav -->

<div id="wrapper" class="no_sidebar">
<div id="content_wrapper" class="no_sidebar">
  



<header>
  <h1 class="breaking_news">Breaking News</h1>
  <ul id="view_options">
    <li id="view_label">View</li>
    <li><a href="#" id="hide_sidebar" class="active" title="Hide sidebar">Hide Sidebar</a></li>
    <li><a href="#" id="show_sidebar"  title="Show sidebar">Show Sidebar</a></li>
    <li><a href="#" id="open_popup" class='open_popup_link' title="Open popup">Open Popup</a></li>
  </ul>
</header>

<div id="search_news" class="clearfix">
<form action="news.php" method="get" id="search_filter_stories_news">
      
    <fieldset class="news_filters collapsed gradient" id="portfolio_timeframe">
      <input id="input_symbol_search_news" name="symbol" type="text" class="textinput" size="25" maxlength="50" placeholder="Enter Symbols">
      <input type="image" src="/images/buttons/search_nav.png"> 			</fieldset>
         
    <fieldset class="news_filters  hidden  collapsed clearfix gradient" id="category_filters">
      <legend>Filters</legend>
      <ul id="ul_all_filters">
        <li id="market_story_filters" class="heading">
          <input name="market_stories" id="market_stories" class="heading_checkbox" type="checkbox" checked="true"> <label for="market_stories">Market Stories</label>
          <ul>
            <li><input name="hot_stocks_filter" id="hot_stocks_filter" type="checkbox" checked="true"> <label for="hot_stocks_filter">Hot Stocks</label></li>
            <li><input name="rumors_filter" id="rumors_filter" type="checkbox" checked="true"> <label for="rumors_filter" checked="true">Rumors</label></li>
            <li><input name="general_news_filter" id="general_news_filter" type="checkbox" checked="true"> <label for="general_news_filter">General News</label></li>
            <li><input name="periodicals_filter" id="periodicals_filter" type="checkbox" checked="true"> <label for="periodicals_filter">Periodicals</label></li>
            <li><input name="earnings_filter" id="earnings_filter" type="checkbox" checked="true"> <label for="earnings_filter">Earnings</label></li>
            <li><input name="technical_analysis_filter" id="technical_analysis_filter" type="checkbox" checked="true"> <label for="technical_analysis_filter">Tech Analysis</label></li>
            <li><input name="options_filter" id="options_filter" type="checkbox" checked="true"> <label for="options_filter">Options</label></li>
            <li><input name="syndicates_filter" id="syndicates_filter" type="checkbox" checked="true"> <label for="syndicates_filter">Syndicate</label></li>
          </ul>
        </li>
        <li id="onthefly_filters" class="heading">
          <input name="onthefly" id="onthefly" class="heading_checkbox" type="checkbox" checked="true"> <label for="onthefly">On The Fly</label>
          <ul>
            <li><input name="insight_filter" id="insight_filter" type="checkbox" checked="true"> <label for="insight_filter">Insights</label></li>
            <li><input name="market_mover_filter" id="market_mover_filter" type="checkbox" checked="true"> <label for="market_mover_filter">Mkt. Movers</label></li>
            
            <li><input name="e_inter_filter" id="e_inter_filter" type="checkbox" checked="true"> <label for="e_inter_filter">Exclusive Interview</label></li>
            
            <li><input name="mid_wrap_filter" id="mid_wrap_filter" type="checkbox" checked="true"> <label for="mid_wrap_filter">Mid/Close Wrap</label></li>
            
            <li><input name="sec_wrap_filter" id="sec_wrap_filter" type="checkbox" checked="true"> <label for="sec_wrap_filter">Sector Wrap</label></li>
            
            <li><input name="analyst_wrap_filter" id="analyst_wrap_filter" type="checkbox" checked="true"> <label for="analyst_wrap_filter">Analyst Wrap</label></li>
          </ul>
        </li>
        <li id="recommendations_filters" class="heading">
          <input name="analyst_recommendations" id="analyst_recommendations" class="heading_checkbox" type="checkbox" checked="true"> <label for="analyst_recommendations">Street&nbsp;Research</label>
          <ul>
            <li><input name="upgrade_filter" id="upgrade_filter" type="checkbox" checked="true"> <label for="upgrade_filter">Upgrade</label></li>
            <li><input name="downgrade_filter" id="downgrade_filter" type="checkbox" checked="true"> <label for="downgrade_filter">Downgrade</label></li>
            <li><input name="initiate_filter" id="initiate_filter" type="checkbox" checked="true"> <label for="initiate_filter">Initiation</label></li>
            <li><input name="no_change_filter" id="no_change_filter" type="checkbox" checked="true"> <label for="no_change_filter">No Change</label></li>
          </ul>
        </li>
        <li id="events_filters" class="heading">
          <input name="events" id="events" class="heading_checkbox" type="checkbox" checked="true"> <label for="events">Events</label>
        </li>					
      </ul>
      <a href="#" id="show_more_filters">Show More</a>
      <a href="#" id="show_less_filters">Show Less</a>
    </fieldset>					</form>
  <div class='newsFeedWidget'>
    <table class="first_table" style='margin: 0;'>
      <tbody> </table><table class='news_table yesterday first_table'>  <tr class='dateDivisionRow firstRowClass' data-date='2024-03-22'>    <td colspan=5 class='dateDivision'>Yesterday<span id='calendarioEnDivisionTiempo' class='calendario'><input type='text' name='fecha' style='display:none;' /> </span><div id='toggle_stories'><a href='#' class='fpo_overlay' id='show_full_stories_bloqueado'>Show Full Stories</a><div id='show_full_stories_not_logged'> <p class="candado_chico">	<span class="cerrarBoton" style="float: right;">X</span> </p>To view all stories in expanded form, please subscribe.<div class='footer_show_full_stories_bloqueado'><a href='#' class='button gold open_free_trial'>Get Free Trial</a></div></div><a class='send_info_link' href='contact.php?send=1'> Send Info </a></div></td>  </tr><tr id="news_3886746_20240322195000" data-id="3886746"  data-timeOffset="39" data-storytype="" data-topic="hot_stocks" data-datetime="20240322195000" data-unlockdate="2026-12-17 19:50:00" class=" tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1797555000" data-datenews="2024-03-22 19:50:00">  
           <td class="story_type">
              <span class="icon_story_type hot_stocks" data-name="Hot Stocks">
              <div class="fpo_overlay_ticker">Hot Stocks</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886746/INTZ-Intrusion-Inc-trading-halted-news-pending'>Intrusion Inc trading halted, news pending</a>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">19:50
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">19:50
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">19:50</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='INTZ'>INTZ<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">Intrusion</p></section><section class="statsCompany">		  	<dl>		  		<dt> / <p class="companyPrice gain">+</p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'>	      <dd class="">&nbsp;</dd></div>  </td></tr><tr id="news_3886745_20240322190135" data-id="3886745"  data-timeOffset="39" data-storytype="" data-topic="hot_stocks" data-datetime="20240322190135" data-unlockdate="2026-12-17 19:01:35" class=" tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1797552095" data-datenews="2024-03-22 19:01:35">  
           <td class="story_type">
              <span class="icon_story_type hot_stocks" data-name="Hot Stocks">
              <div class="fpo_overlay_ticker">Hot Stocks</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886745/OGI-Organigram-receives-Health-Canadas-final-redetermination-on-Jolts'>Organigram receives Health Canada&#039;s final redetermination on Jolts</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">19:01
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">19:01
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">19:01</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='OGI'>OGI<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Organigram</p></section><section class="statsCompany">		  	<dl>		  		<dt>$2.72 / <p class="companyPrice gain">+0.22<small class="smallWithoutIcon"> (+8.80%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class='clickeable blocked'>
                      <div class='abstract'>Organigram announced&hellip; <div class='candado free_user'><div class="free_promo"><div class="text_1">Available to The Fly Members Only</div><div class='text_2'>Breaking content available to members only. Sign up or login for access.</div><a href="free_sign_up.php" class="button blue open_free_user">Create FREE Account</a></div></div> </div></dd></div>  </td></tr><tr id="news_3886744_20240322175504" data-id="3886744"  data-timeOffset="39" data-storytype="" data-topic="hot_stocks" data-datetime="20240322175504" data-unlockdate="2026-12-17 17:55:04" class=" tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1797548104" data-datenews="2024-03-22 17:55:04">  
           <td class="story_type">
              <span class="icon_story_type hot_stocks" data-name="Hot Stocks">
              <div class="fpo_overlay_ticker">Hot Stocks</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886744/DWAC-Digital-World-Acquisition-holders-approve-proposed-merger-with-TMTG'>Digital World Acquisition holders approve proposed merger with TMTG</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">17:55
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">17:55
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">17:55</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='DWAC'>DWAC<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Digital World Acquisition</p></section><section class="statsCompany">		  	<dl>		  		<dt>$36.85 / <p class="companyPrice loss">-5.64<small class="smallWithoutIcon"> (-13.27%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class='clickeable blocked'>
                      <div class='abstract'>Digital World Acquisition&hellip; <div class='candado free_user'><div class="free_promo"><div class="text_1">Available to The Fly Members Only</div><div class='text_2'>Breaking content available to members only. Sign up or login for access.</div><a href="free_sign_up.php" class="button blue open_free_user">Create FREE Account</a></div></div> </div></dd></div>  </td></tr><tr id="news_3886743_20240322173430" data-id="3886743"  data-timeOffset="39" data-storytype="" data-topic="events" data-datetime="20240322173430" data-unlockdate="2026-12-17 17:34:30" class=" tr_noticia events Conference/Events " data-unlockdateUTC="1797546870" data-datenews="2024-03-22 17:34:30">  
           <td class="story_type">
              <span class="icon_story_type events" data-name="Conference/Events">
              <div class="fpo_overlay_ticker">Conference/Events</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886743/LANC-Lancaster-Colony-management-to-meet-with-Stephens'>Lancaster Colony management to meet with Stephens</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">17:34
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">17:34
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">17:34</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='LANC'>LANC<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Lancaster Colony</p></section><section class="statsCompany">		  	<dl>		  		<dt>$205.89 / <p class="companyPrice gain">+0.33<small class="smallWithoutIcon"> (+0.16%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class='clickeable blocked'>
                      <div class='abstract'>Meeting to be held in New&hellip; <div class='candado free_user'><div class="free_promo"><div class="text_1">Available to The Fly Members Only</div><div class='text_2'>Breaking content available to members only. Sign up or login for access.</div><a href="free_sign_up.php" class="button blue open_free_user">Create FREE Account</a></div></div> </div></dd></div>  </td></tr><tr id="news_3886742_20240322173026" data-id="3886742"  data-timeOffset="39" data-storytype="" data-topic="syndic" data-datetime="20240322173026" data-unlockdate="2026-12-17 17:30:26" class=" tr_noticia syndic Syndicate " data-unlockdateUTC="1797546626" data-datenews="2024-03-22 17:30:26">  
           <td class="story_type">
              <span class="icon_story_type syndic" data-name="Syndicate">
              <div class="fpo_overlay_ticker">Syndicate</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886742/UUUU-Energy-Fuels-files-automatic-mixed-securities-shelf'>Energy Fuels files automatic mixed securities shelf</a>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">17:30
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">17:30
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">17:30</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='UUUU'>UUUU<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Energy Fuels</p></section><section class="statsCompany">		  	<dl>		  		<dt>$6.17 / <p class="companyPrice loss">-0.055<small class="smallWithoutIcon"> (-0.88%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'>	      <dd class="">&nbsp;</dd></div>  </td></tr><tr id="news_3886741_20240322172529" data-id="3886741"  data-timeOffset="39" data-storytype="" data-topic="syndic" data-datetime="20240322172529" data-unlockdate="2026-12-17 17:25:29" class=" tr_noticia syndic Syndicate " data-unlockdateUTC="1797546329" data-datenews="2024-03-22 17:25:29">  
           <td class="story_type">
              <span class="icon_story_type syndic" data-name="Syndicate">
              <div class="fpo_overlay_ticker">Syndicate</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886741/CNXC-Concentrix-files-to-sell-M-shares-of-common-stock-for-holders'>Concentrix files to sell 13.17M shares of common stock for holders</a>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">17:25
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">17:25
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">17:25</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='CNXC'>CNXC<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Concentrix</p></section><section class="statsCompany">		  	<dl>		  		<dt>$61.30 / <p class="companyPrice loss">-1.725<small class="smallWithoutIcon"> (-2.74%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'>	      <dd class="">&nbsp;</dd></div>  </td></tr><tr id="news_3886740_20240322171318" data-id="3886740"  data-timeOffset="39" data-storytype="" data-topic="syndic" data-datetime="20240322171318" data-unlockdate="2026-12-17 17:13:18" class=" tr_noticia syndic Syndicate " data-unlockdateUTC="1797545598" data-datenews="2024-03-22 17:13:18">  
           <td class="story_type">
              <span class="icon_story_type syndic" data-name="Syndicate">
              <div class="fpo_overlay_ticker">Syndicate</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886740/AEMD-Aethlon-Medical-files-to-sell-common-stock-warrants-no-amount-given'>Aethlon Medical files to sell common stock, warrants, no amount given</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">17:13
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">17:13
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">17:13</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='AEMD'>AEMD<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Aethlon Medical</p></section><section class="statsCompany">		  	<dl>		  		<dt>$1.69 / <p class="companyPrice gain">+0.03<small class="smallWithoutIcon"> (+1.81%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class='clickeable blocked'>
                      <div class='abstract'>Maxim Group is acting as&hellip; <div class='candado free_user'><div class="free_promo"><div class="text_1">Available to The Fly Members Only</div><div class='text_2'>Breaking content available to members only. Sign up or login for access.</div><a href="free_sign_up.php" class="button blue open_free_user">Create FREE Account</a></div></div> </div></dd></div>  </td></tr><tr id="news_3886739_20240322171235" data-id="3886739"  data-timeOffset="39" data-storytype="" data-topic="events" data-datetime="20240322171235" data-unlockdate="2026-12-17 17:12:35" class=" tr_noticia events Conference/Events " data-unlockdateUTC="1797545555" data-datenews="2024-03-22 17:12:35">  
           <td class="story_type">
              <span class="icon_story_type events" data-name="Conference/Events">
              <div class="fpo_overlay_ticker">Conference/Events</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886739/CRNX-JMP-Securities-biotech-analysts-to-hold-an-analystindustry-conference-call'>JMP Securities biotech analysts to hold an analyst/industry conference call</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">17:12
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">17:12
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">17:12</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='CRNX'>CRNX<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Crinetics</p></section><section class="statsCompany">		  	<dl>		  		<dt>$44.28 / <p class="companyPrice loss">-0.7<small class="smallWithoutIcon"> (-1.56%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class='clickeable blocked'>
                      <div class='abstract'>Biotechnology Analysts&hellip; <div class='candado free_user'><div class="free_promo"><div class="text_1">Available to The Fly Members Only</div><div class='text_2'>Breaking content available to members only. Sign up or login for access.</div><a href="free_sign_up.php" class="button blue open_free_user">Create FREE Account</a></div></div> </div></dd></div>  </td></tr><tr id="news_3886738_20240322164758" data-id="3886738"  data-timeOffset="39" data-storytype="" data-topic="syndic" data-datetime="20240322164758" data-unlockdate="2026-12-17 16:47:58" class=" tr_noticia syndic Syndicate " data-unlockdateUTC="1797544078" data-datenews="2024-03-22 16:47:58">  
           <td class="story_type">
              <span class="icon_story_type syndic" data-name="Syndicate">
              <div class="fpo_overlay_ticker">Syndicate</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886738/NEE-NextEra-Energy-files-automatic-mixed-securities-shelf'>NextEra Energy files automatic mixed securities shelf</a>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:47
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:47
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:47</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='NEE'>NEE<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">NextEra Energy</p></section><section class="statsCompany">		  	<dl>		  		<dt>$61.78 / <p class="companyPrice gain">+0.43<small class="smallWithoutIcon"> (+0.70%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'>	      <dd class="">&nbsp;</dd></div>  </td></tr><tr id="news_3886737_20240322164705" data-id="3886737"  data-timeOffset="39" data-storytype="" data-topic="hot_stocks" data-datetime="20240322164705" data-unlockdate="2026-12-17 16:47:05" class=" tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1797544025" data-datenews="2024-03-22 16:47:05">  
           <td class="story_type">
              <span class="icon_story_type hot_stocks" data-name="Hot Stocks">
              <div class="fpo_overlay_ticker">Hot Stocks</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886737/CC-Chemours-names-Denise-Dignam-as-CEO'>Chemours names Denise Dignam as CEO</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:47
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:47
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:47</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='CC'>CC<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Chemours</p></section><section class="statsCompany">		  	<dl>		  		<dt>$27.87 / <p class="companyPrice gain">+0.62<small class="smallWithoutIcon"> (+2.28%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class='clickeable blocked'>
                      <div class='abstract'>The Chemours Company&hellip; <div class='candado free_user'><div class="free_promo"><div class="text_1">Available to The Fly Members Only</div><div class='text_2'>Breaking content available to members only. Sign up or login for access.</div><a href="free_sign_up.php" class="button blue open_free_user">Create FREE Account</a></div></div> </div></dd></div>  </td></tr>
          </tbody>
        </table>
        <table class="yesterday news_table first_table">
          <tbody>
      <tr id="news_3886736_20240322163317" data-id="3886736"  data-timeOffset="39" data-storytype="" data-topic="syndic" data-datetime="20240322163317" data-unlockdate="2026-12-17 16:33:17" class=" tr_noticia syndic Syndicate " data-unlockdateUTC="1797543197" data-datenews="2024-03-22 16:33:17">  
           <td class="story_type">
              <span class="icon_story_type syndic" data-name="Syndicate">
              <div class="fpo_overlay_ticker">Syndicate</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886736/APLT-Applied-Therapeutics-files-to-sell-M-shares-of-common-stock-for-holders'>Applied Therapeutics files to sell 14.29M shares of common stock for holders</a>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:33
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:33
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:33</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='APLT'>APLT<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Applied Therapeutics</p></section><section class="statsCompany">		  	<dl>		  		<dt>$6.76 / <p class="companyPrice loss">-0.065<small class="smallWithoutIcon"> (-0.95%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'>	      <dd class="">&nbsp;</dd></div>  </td></tr><tr id="news_3886735_20240322163149" data-id="3886735"  data-timeOffset="39" data-storytype="" data-topic="hot_stocks" data-datetime="20240322163149" data-unlockdate="2026-12-17 16:31:49" class=" tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1797543109" data-datenews="2024-03-22 16:31:49">  
           <td class="story_type">
              <span class="icon_story_type hot_stocks" data-name="Hot Stocks">
              <div class="fpo_overlay_ticker">Hot Stocks</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886735/RILY-B-Riley-Financial-receives-Nasdaq-notice-of-noncompliance'>B. Riley Financial receives Nasdaq notice of non-compliance</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:31
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:31
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:31</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='RILY'>RILY<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">B. Riley Financial</p></section><section class="statsCompany">		  	<dl>		  		<dt>$19.48 / <p class="companyPrice loss">-1.4<small class="smallWithoutIcon"> (-6.70%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class='clickeable blocked'>
                      <div class='abstract'>B. Riley Financial&hellip; <div class='candado free_user'><div class="free_promo"><div class="text_1">Available to The Fly Members Only</div><div class='text_2'>Breaking content available to members only. Sign up or login for access.</div><a href="free_sign_up.php" class="button blue open_free_user">Create FREE Account</a></div></div> </div></dd></div>  </td></tr><tr id="news_3886734_20240322163100" data-id="3886734"  data-timeOffset="39" data-storytype="" data-topic="options" data-datetime="20240322163100" data-unlockdate="2026-12-17 16:31:00" class=" tr_noticia options Options " data-unlockdateUTC="1797543060" data-datenews="2024-03-22 16:31:00">  
           <td class="story_type">
              <span class="icon_story_type options" data-name="Options">
              <div class="fpo_overlay_ticker">Options</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886734/-Preliminary-option-volume-of-M-today'>Preliminary option volume of 43.1M today</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:31
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:31
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:31</div></span></small>  </span> 
          <div class="simbolos_wrapper"></div>
           </div><div class='newsContent'><dd class='clickeable blocked'>
                      <div class='abstract'>Preliminary option volume&hellip; <div class='candado free_user'><div class="free_promo"><div class="text_1">Available to The Fly Members Only</div><div class='text_2'>Breaking content available to members only. Sign up or login for access.</div><a href="free_sign_up.php" class="button blue open_free_user">Create FREE Account</a></div></div> </div></dd></div>  </td></tr><tr id="news_3886733_20240322162428" data-id="3886733"  data-timeOffset="38" data-storytype="" data-topic="hot_stocks" data-datetime="20240322162428" data-unlockdate="2026-12-17 16:24:28" class=" tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1797542668" data-datenews="2024-03-22 16:24:28">  
           <td class="story_type">
              <span class="icon_story_type hot_stocks" data-name="Hot Stocks">
              <div class="fpo_overlay_ticker">Hot Stocks</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886733/GAME-GameSquare-announces-voluntary-delisting-from-TSXV'>GameSquare announces voluntary delisting from TSXV</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:24
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:24
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:24</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='GAME'>GAME<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">GameSquare</p></section><section class="statsCompany">		  	<dl>		  		<dt>$1.36 / <p class="companyPrice loss">-0.12<small class="smallWithoutIcon"> (-8.11%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class='clickeable blocked'>
                      <div class='abstract'>GameSquare Holdings&hellip; <div class='candado free_user'><div class="free_promo"><div class="text_1">Available to The Fly Members Only</div><div class='text_2'>Breaking content available to members only. Sign up or login for access.</div><a href="free_sign_up.php" class="button blue open_free_user">Create FREE Account</a></div></div> </div></dd></div>  </td></tr><tr id="news_3886732_20240322162303" data-id="3886732"  data-timeOffset="38" data-storytype="" data-topic="syndic" data-datetime="20240322162303" data-unlockdate="2026-12-17 16:23:03" class=" tr_noticia syndic Syndicate " data-unlockdateUTC="1797542583" data-datenews="2024-03-22 16:23:03">  
           <td class="story_type">
              <span class="icon_story_type syndic" data-name="Syndicate">
              <div class="fpo_overlay_ticker">Syndicate</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886732/MOTS-Motus-GI-Holdings-files-to-sell-M-shares-of-common-stock-for-holders'>Motus GI Holdings files to sell 4.4M shares of common stock for holders</a>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:23
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:23
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:23</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='MOTS'>MOTS<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Motus GI Holdings</p></section><section class="statsCompany">		  	<dl>		  		<dt> / <p class="companyPrice gain">+</p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'>	      <dd class="">&nbsp;</dd></div>  </td></tr><tr id="news_3886731_20240322162101" data-id="3886731"  data-timeOffset="38" data-storytype="" data-topic="options" data-datetime="20240322162101" data-unlockdate="2026-12-17 16:21:01" class=" tr_noticia options Options " data-unlockdateUTC="1797542461" data-datenews="2024-03-22 16:21:01">  
           <td class="story_type">
              <span class="icon_story_type options" data-name="Options">
              <div class="fpo_overlay_ticker">Options</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886731/VIX-Closing-CBOE-SPX-and-VIX-Index-summary-for-March-nd'>Closing CBOE SPX and VIX Index summary for March 22nd</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:21
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:21
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:21</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='VIX'>VIX<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">Volatility Index S&P 500 Options</p></section><section class="statsCompany">		  	<dl>		  		<dt> / <p class="companyPrice gain">+</p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class='clickeable blocked'>
                      <div class='abstract'>The CBOE Volatility Index&hellip; <div class='candado free_user'><div class="free_promo"><div class="text_1">Available to The Fly Members Only</div><div class='text_2'>Breaking content available to members only. Sign up or login for access.</div><a href="free_sign_up.php" class="button blue open_free_user">Create FREE Account</a></div></div> </div></dd></div>  </td></tr><tr id="news_3886730_20240322162014" data-id="3886730"  data-timeOffset="38" data-storytype="" data-topic="syndic" data-datetime="20240322162014" data-unlockdate="2026-12-17 16:20:14" class=" tr_noticia syndic Syndicate " data-unlockdateUTC="1797542414" data-datenews="2024-03-22 16:20:14">  
           <td class="story_type">
              <span class="icon_story_type syndic" data-name="Syndicate">
              <div class="fpo_overlay_ticker">Syndicate</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886730/NTR-Nutrien-files-automatic-mixed-securities-shelf'>Nutrien files automatic mixed securities shelf</a>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:20
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:20
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:20</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='NTR'>NTR<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">Nutrien</p></section><section class="statsCompany">		  	<dl>		  		<dt>$52.22 / <p class="companyPrice loss">-1.41<small class="smallWithoutIcon"> (-2.63%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'>	      <dd class="">&nbsp;</dd></div>  </td></tr><tr id="news_3886729_20240322161831" data-id="3886729"  data-timeOffset="38" data-storytype="" data-topic="hot_stocks" data-datetime="20240322161831" data-unlockdate="2026-12-17 16:18:31" class=" tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1797542311" data-datenews="2024-03-22 16:18:31">  
           <td class="story_type">
              <span class="icon_story_type hot_stocks" data-name="Hot Stocks">
              <div class="fpo_overlay_ticker">Hot Stocks</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886729/SWX-Southwest-Gas-Centuri-files-public-registration-statement'>Southwest Gas: Centuri files public registration statement</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:18
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:18
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:18</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='SWX'>SWX<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Southwest Gas</p></section><section class="statsCompany">		  	<dl>		  		<dt>$71.68 / <p class="companyPrice loss">-0.18<small class="smallWithoutIcon"> (-0.25%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class='clickeable blocked'>
                      <div class='abstract'>Southwest Gas Holdings&hellip; <div class='candado free_user'><div class="free_promo"><div class="text_1">Available to The Fly Members Only</div><div class='text_2'>Breaking content available to members only. Sign up or login for access.</div><a href="free_sign_up.php" class="button blue open_free_user">Create FREE Account</a></div></div> </div></dd></div>  </td></tr><tr id="news_3886728_20240322161307" data-id="3886728"  data-timeOffset="37" data-storytype="" data-topic="hot_stocks" data-datetime="20240322161307" data-unlockdate="2026-12-17 16:13:07" class=" tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1797541987" data-datenews="2024-03-22 16:13:07">  
           <td class="story_type">
              <span class="icon_story_type hot_stocks" data-name="Hot Stocks">
              <div class="fpo_overlay_ticker">Hot Stocks</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886728/RBT-Rubicon-Technologies-receives-noncompliance-notice-from-NYSE'>Rubicon Technologies receives noncompliance notice from NYSE</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:13
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:13
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:13</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='RBT'>RBT<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Rubicon Technologies</p></section><section class="statsCompany">		  	<dl>		  		<dt> / <p class="companyPrice gain">+</p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class='clickeable blocked'>
                      <div class='abstract'>Rubicon Technologies&hellip; <div class='candado free_user'><div class="free_promo"><div class="text_1">Available to The Fly Members Only</div><div class='text_2'>Breaking content available to members only. Sign up or login for access.</div><a href="free_sign_up.php" class="button blue open_free_user">Create FREE Account</a></div></div> </div></dd></div>  </td></tr><tr id="news_3886727_20240322161200" data-id="3886727"  data-timeOffset="37" data-storytype="" data-topic="on_the_fly" data-datetime="20240322161200" data-unlockdate="" class=" tr_noticia on_the_fly OnTheFly  subt_mid_wrap" data-unlockdateUTC="1711181592" data-datenews="2024-03-22 16:12:00">  
           <td class="story_type">
              <span class="icon_story_type on_the_fly" data-name="On The Fly">
              <div class="fpo_overlay_ticker">On The Fly</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886727/STVN;NKTX;NKE;FDX;AAPL;BIDU;TSLA;LULU;BBY;FL;SCHW;SEDG;HUMA;HOOK;HYZN;PROK;AMPX;STLA;EADSY;BA;WMT;TGT;AMZN;RSI;CGC;TLRY;GRFS;STEM-What-You-Missed-On-Wall-Street-On-Friday'>What You Missed On Wall Street On Friday</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:12
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:12
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:12</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='STVN'>STVN<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">Stevanato Group</p></section><section class="statsCompany">		  	<dl>		  		<dt>$31.10 / <p class="companyPrice gain">+2.69<small class="smallWithoutIcon"> (+9.47%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='NKTX'>NKTX<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Nkarta</p></section><section class="statsCompany">		  	<dl>		  		<dt>$8.84 / <p class="companyPrice loss">-4.13<small class="smallWithoutIcon"> (-31.84%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='NKE'>NKE<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Nike</p></section><section class="statsCompany">		  	<dl>		  		<dt>$94.04 / <p class="companyPrice loss">-6.775<small class="smallWithoutIcon"> (-6.72%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='FDX'>FDX<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">FedEx</p></section><section class="statsCompany">		  	<dl>		  		<dt>$284.38 / <p class="companyPrice gain">+19.5<small class="smallWithoutIcon"> (+7.36%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='AAPL'>AAPL<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Apple</p></section><section class="statsCompany">		  	<dl>		  		<dt>$172.35 / <p class="companyPrice gain">+0.96<small class="smallWithoutIcon"> (+0.56%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='BIDU'>BIDU<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Baidu</p></section><section class="statsCompany">		  	<dl>		  		<dt>$102.26 / <p class="companyPrice gain">+0.6<small class="smallWithoutIcon"> (+0.59%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='TSLA'>TSLA<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Tesla</p></section><section class="statsCompany">		  	<dl>		  		<dt>$170.95 / <p class="companyPrice loss">-1.85<small class="smallWithoutIcon"> (-1.07%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='LULU'>LULU<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Lululemon</p></section><section class="statsCompany">		  	<dl>		  		<dt>$403.87 / <p class="companyPrice loss">-75.4<small class="smallWithoutIcon"> (-15.73%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='BBY'>BBY<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Best Buy</p></section><section class="statsCompany">		  	<dl>		  		<dt>$81.71 / <p class="companyPrice gain">+1.28<small class="smallWithoutIcon"> (+1.59%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='FL'>FL<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Foot Locker</p></section><section class="statsCompany">		  	<dl>		  		<dt>$24.45 / <p class="companyPrice gain">+0.785<small class="smallWithoutIcon"> (+3.32%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='SCHW'>SCHW<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Charles Schwab</p></section><section class="statsCompany">		  	<dl>		  		<dt>$71.79 / <p class="companyPrice loss">-0.06<small class="smallWithoutIcon"> (-0.08%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='SEDG'>SEDG<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">SolarEdge</p></section><section class="statsCompany">		  	<dl>		  		<dt>$64.80 / <p class="companyPrice loss">-1.93<small class="smallWithoutIcon"> (-2.89%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='HUMA'>HUMA<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Humacyte</p></section><section class="statsCompany">		  	<dl>		  		<dt>$3.35 / <p class="companyPrice loss">-0.26<small class="smallWithoutIcon"> (-7.21%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='HOOK'>HOOK<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">Hookipa Pharma</p></section><section class="statsCompany">		  	<dl>		  		<dt> / <p class="companyPrice gain">+</p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='HYZN'>HYZN<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Hyzon Motors</p></section><section class="statsCompany">		  	<dl>		  		<dt> / <p class="companyPrice gain">+</p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='PROK'>PROK<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">ProKidney</p></section><section class="statsCompany">		  	<dl>		  		<dt>$1.40 / <p class="companyPrice gain">+0.04<small class="smallWithoutIcon"> (+2.94%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='AMPX'>AMPX<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">Amprius Technologies</p></section><section class="statsCompany">		  	<dl>		  		<dt>$2.75 / <p class="companyPrice loss">-0.195<small class="smallWithoutIcon"> (-6.63%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='STLA'>STLA<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Stellantis</p></section><section class="statsCompany">		  	<dl>		  		<dt>$29.21 / <p class="companyPrice gain">+0.01<small class="smallWithoutIcon"> (+0.03%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='EADSY'>EADSY<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">Airbus</p></section><section class="statsCompany">		  	<dl>		  		<dt>$45.95 / <p class="companyPrice gain">+0.08<small class="smallWithoutIcon"> (+0.17%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='BA'>BA<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Boeing</p></section><section class="statsCompany">		  	<dl>		  		<dt>$188.93 / <p class="companyPrice gain">+1.16<small class="smallWithoutIcon"> (+0.62%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='WMT'>WMT<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Walmart</p></section><section class="statsCompany">		  	<dl>		  		<dt>$60.95 / <p class="companyPrice loss">-0.48<small class="smallWithoutIcon"> (-0.78%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='TGT'>TGT<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Target</p></section><section class="statsCompany">		  	<dl>		  		<dt>$168.74 / <p class="companyPrice loss">-1.43<small class="smallWithoutIcon"> (-0.84%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='AMZN'>AMZN<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Amazon.com</p></section><section class="statsCompany">		  	<dl>		  		<dt>$179.04 / <p class="companyPrice gain">+0.85<small class="smallWithoutIcon"> (+0.48%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='RSI'>RSI<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Rush Street Interactive</p></section><section class="statsCompany">		  	<dl>		  		<dt>$6.56 / <p class="companyPrice gain">+0.195<small class="smallWithoutIcon"> (+3.06%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='CGC'>CGC<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">Canopy Growth</p></section><section class="statsCompany">		  	<dl>		  		<dt>$7.74 / <p class="companyPrice gain">+3.18<small class="smallWithoutIcon"> (+69.74%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='TLRY'>TLRY<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Tilray</p></section><section class="statsCompany">		  	<dl>		  		<dt>$2.31 / <p class="companyPrice gain">+0.35<small class="smallWithoutIcon"> (+17.90%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='GRFS'>GRFS<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Grifols</p></section><section class="statsCompany">		  	<dl>		  		<dt>$6.19 / <p class="companyPrice loss">-0.595<small class="smallWithoutIcon"> (-8.78%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='STEM'>STEM<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Stem</p></section><section class="statsCompany">		  	<dl>		  		<dt>$1.99 / <p class="companyPrice loss">-0.255<small class="smallWithoutIcon"> (-11.38%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class="clickeable">
                   <p class="abstract hayMasTexto">Get caught up quickly on&hellip;  </p><div class="completeText"><p><span class='open_new_overlay gold button'> <a class='open_onthefly_new_window' href='https://thefly.com/permalinks/entry.php/id3886727/STVN;NKTX;NKE;FDX;AAPL;BIDU;TSLA;LULU;BBY;FL;SCHW;SEDG;HUMA;HOOK;HYZN;PROK;AMPX;STLA;EADSY;BA;WMT;TGT;AMZN;RSI;CGC;TLRY;GRFS;STEM-What-You-Missed-On-Wall-Street-On-Friday'> Open Full Text  </a> </span> </p></div></dd> <!--dd.clickeable--></div>  </td></tr>
          </tbody>
        </table>
        <table class="yesterday news_table first_table">
          <tbody>
      <tr id="news_3886726_20240322161127" data-id="3886726"  data-timeOffset="37" data-storytype="" data-topic="hot_stocks" data-datetime="20240322161127" data-unlockdate="2026-12-17 16:11:27" class=" tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1797541887" data-datenews="2024-03-22 16:11:27">  
           <td class="story_type">
              <span class="icon_story_type hot_stocks" data-name="Hot Stocks">
              <div class="fpo_overlay_ticker">Hot Stocks</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886726/PFIS;FNCB-Peoples-Financial-FNCB-Bancorp-merger-approved-by-shareholders'>Peoples Financial, FNCB Bancorp merger approved by shareholders</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:11
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:11
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:11</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='PFIS'>PFIS<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">Peoples Financial</p></section><section class="statsCompany">		  	<dl>		  		<dt>$40.33 / <p class="companyPrice loss">-1.97<small class="smallWithoutIcon"> (-4.66%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='FNCB'>FNCB<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">FNCB Bancorp</p></section><section class="statsCompany">		  	<dl>		  		<dt>$5.95 / <p class="companyPrice loss">-0.06<small class="smallWithoutIcon"> (-1.00%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class='clickeable blocked'>
                      <div class='abstract'>Peoples Financial&hellip; <div class='candado free_user'><div class="free_promo"><div class="text_1">Available to The Fly Members Only</div><div class='text_2'>Breaking content available to members only. Sign up or login for access.</div><a href="free_sign_up.php" class="button blue open_free_user">Create FREE Account</a></div></div> </div></dd></div>  </td></tr><tr id="news_3886725_20240322160843" data-id="3886725"  data-timeOffset="37" data-storytype="" data-topic="syndic" data-datetime="20240322160843" data-unlockdate="2026-12-17 16:08:43" class=" tr_noticia syndic Syndicate " data-unlockdateUTC="1797541723" data-datenews="2024-03-22 16:08:43">  
           <td class="story_type">
              <span class="icon_story_type syndic" data-name="Syndicate">
              <div class="fpo_overlay_ticker">Syndicate</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886725/DSP-Viant-files-to-sell-M-shares-of-Class-A-common-stock-for-holders'>Viant files to sell 10M shares of Class A common stock for holders</a>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:08
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:08
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:08</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='DSP'>DSP<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">Viant</p></section><section class="statsCompany">		  	<dl>		  		<dt>$10.22 / <p class="companyPrice loss">-0.135<small class="smallWithoutIcon"> (-1.30%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'>	      <dd class="">&nbsp;</dd></div>  </td></tr><tr id="news_3886724_20240322160746" data-id="3886724"  data-timeOffset="37" data-storytype="" data-topic="syndic" data-datetime="20240322160746" data-unlockdate="2026-12-17 16:07:46" class=" tr_noticia syndic Syndicate " data-unlockdateUTC="1797541666" data-datenews="2024-03-22 16:07:46">  
           <td class="story_type">
              <span class="icon_story_type syndic" data-name="Syndicate">
              <div class="fpo_overlay_ticker">Syndicate</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886724/DSP-Viant-files-M-mixed-securities-shelf'>Viant files $100M mixed securities shelf</a>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:07
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:07
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:07</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='DSP'>DSP<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">Viant</p></section><section class="statsCompany">		  	<dl>		  		<dt>$10.23 / <p class="companyPrice loss">-0.12<small class="smallWithoutIcon"> (-1.16%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'>	      <dd class="">&nbsp;</dd></div>  </td></tr><tr id="news_3886723_20240322160702" data-id="3886723"  data-timeOffset="37" data-storytype="" data-topic="hot_stocks" data-datetime="20240322160702" data-unlockdate="2026-12-17 16:07:02" class=" tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1797541622" data-datenews="2024-03-22 16:07:02">  
           <td class="story_type">
              <span class="icon_story_type hot_stocks" data-name="Hot Stocks">
              <div class="fpo_overlay_ticker">Hot Stocks</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886723/MASI-Masimo-board-approves-evaluation-of-separation-of-consumer-business'>Masimo board approves evaluation of separation of consumer business</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:07
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:07
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:07</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='MASI'>MASI<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Masimo</p></section><section class="statsCompany">		  	<dl>		  		<dt>$134.90 / <p class="companyPrice gain">+1.75<small class="smallWithoutIcon"> (+1.31%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class='clickeable blocked'>
                      <div class='abstract'>Masimo announced that its&hellip; <div class='candado free_user'><div class="free_promo"><div class="text_1">Available to The Fly Members Only</div><div class='text_2'>Breaking content available to members only. Sign up or login for access.</div><a href="free_sign_up.php" class="button blue open_free_user">Create FREE Account</a></div></div> </div></dd></div>  </td></tr><tr id="news_3886722_20240322160353" data-id="3886722"  data-timeOffset="36" data-storytype="" data-topic="syndic" data-datetime="20240322160353" data-unlockdate="2026-12-17 16:03:53" class=" tr_noticia syndic Syndicate " data-unlockdateUTC="1797541433" data-datenews="2024-03-22 16:03:53">  
           <td class="story_type">
              <span class="icon_story_type syndic" data-name="Syndicate">
              <div class="fpo_overlay_ticker">Syndicate</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886722/INDO-Indonesia-Energy-files-M-mixed-securities-shelf'>Indonesia Energy files $50M mixed securities shelf</a>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:03
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:03
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:03</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='INDO'>INDO<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Indonesia Energy</p></section><section class="statsCompany">		  	<dl>		  		<dt>$2.15 / <p class="companyPrice loss">-0.04<small class="smallWithoutIcon"> (-1.83%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'>	      <dd class="">&nbsp;</dd></div>  </td></tr><tr id="news_3886721_20240322160328" data-id="3886721"  data-timeOffset="36" data-storytype="" data-topic="syndic" data-datetime="20240322160328" data-unlockdate="2026-12-17 16:03:28" class=" tr_noticia syndic Syndicate " data-unlockdateUTC="1797541408" data-datenews="2024-03-22 16:03:28">  
           <td class="story_type">
              <span class="icon_story_type syndic" data-name="Syndicate">
              <div class="fpo_overlay_ticker">Syndicate</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886721/DNLI-Denali-Therapeutics-files-to-sell-M-shares-of-common-stock-for-holders'>Denali Therapeutics files to sell 29.29M shares of common stock for holders</a>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:03
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:03
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:03</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='DNLI'>DNLI<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">Denali Therapeutics</p></section><section class="statsCompany">		  	<dl>		  		<dt>$19.66 / <p class="companyPrice loss">-1.32<small class="smallWithoutIcon"> (-6.29%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'>	      <dd class="">&nbsp;</dd></div>  </td></tr><tr id="news_3886720_20240322160302" data-id="3886720"  data-timeOffset="36" data-storytype="" data-topic="syndic" data-datetime="20240322160302" data-unlockdate="2026-12-17 16:03:02" class=" tr_noticia syndic Syndicate " data-unlockdateUTC="1797541382" data-datenews="2024-03-22 16:03:02">  
           <td class="story_type">
              <span class="icon_story_type syndic" data-name="Syndicate">
              <div class="fpo_overlay_ticker">Syndicate</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886720/HXL-Hexcel-files-automatic-mixed-securities-shelf'>Hexcel files automatic mixed securities shelf</a>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:03
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:03
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:03</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='HXL'>HXL<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Hexcel</p></section><section class="statsCompany">		  	<dl>		  		<dt>$72.11 / <p class="companyPrice gain">+0.235<small class="smallWithoutIcon"> (+0.33%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'>	      <dd class="">&nbsp;</dd></div>  </td></tr><tr id="news_3886719_20240322160228" data-id="3886719"  data-timeOffset="36" data-storytype="" data-topic="hot_stocks" data-datetime="20240322160228" data-unlockdate="2026-12-17 16:02:28" class=" tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1797541348" data-datenews="2024-03-22 16:02:28">  
           <td class="story_type">
              <span class="icon_story_type hot_stocks" data-name="Hot Stocks">
              <div class="fpo_overlay_ticker">Hot Stocks</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886719/AXNX;BSX-Axonics-shareholders-approve-merger-with-Boston-Scientific'>Axonics shareholders approve merger with Boston Scientific</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:02
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:02
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:02</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='AXNX'>AXNX<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Axonics</p></section><section class="statsCompany">		  	<dl>		  		<dt>$68.35 / <p class="companyPrice gain">+0.14<small class="smallWithoutIcon"> (+0.21%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='BSX'>BSX<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Boston Scientific</p></section><section class="statsCompany">		  	<dl>		  		<dt>$67.73 / <p class="companyPrice gain">+0.18<small class="smallWithoutIcon"> (+0.27%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class='clickeable blocked'>
                      <div class='abstract'>Axonics (AXNX) announced&hellip; <div class='candado free_user'><div class="free_promo"><div class="text_1">Available to The Fly Members Only</div><div class='text_2'>Breaking content available to members only. Sign up or login for access.</div><a href="free_sign_up.php" class="button blue open_free_user">Create FREE Account</a></div></div> </div></dd></div>  </td></tr><tr id="news_3886718_20240322160058" data-id="3886718"  data-timeOffset="36" data-storytype="" data-topic="on_the_fly" data-datetime="20240322160058" data-unlockdate="" class=" tr_noticia on_the_fly OnTheFly  subt_sector_wrap" data-unlockdateUTC="1711180895" data-datenews="2024-03-22 16:00:58">  
           <td class="story_type">
              <span class="icon_story_type on_the_fly" data-name="On The Fly">
              <div class="fpo_overlay_ticker">On The Fly</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886718/RSI;DKNG;GAMB;MGM;ELYS;SRAD;FLUT;PENN;ACEL;BALY;BYD;CZR;CHDN;GAN;GENI;LVS;SGHC;WYNN-Bet-On-It-Rush-Street-Interactive-said-to-explore-potential-sale'>Bet On It: Rush Street Interactive said to explore potential sale</a>&nbsp;<span class='flechitaflechita'>»</span>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:00
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:00
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:00</div></span></small>  </span> 
          <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='RSI'>RSI<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Rush Street Interactive</p></section><section class="statsCompany">		  	<dl>		  		<dt>$6.56 / <p class="companyPrice gain">+0.19<small class="smallWithoutIcon"> (+2.99%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='DKNG'>DKNG<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">DraftKings</p></section><section class="statsCompany">		  	<dl>		  		<dt>$47.39 / <p class="companyPrice loss">-0.55<small class="smallWithoutIcon"> (-1.15%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='GAMB'>GAMB<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Gambling.com</p></section><section class="statsCompany">		  	<dl>		  		<dt>$8.88 / <p class="companyPrice gain">+0.065<small class="smallWithoutIcon"> (+0.74%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='MGM'>MGM<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">MGM Resorts</p></section><section class="statsCompany">		  	<dl>		  		<dt>$44.58 / <p class="companyPrice loss">-0.165<small class="smallWithoutIcon"> (-0.37%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='ELYS'>ELYS<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Elys Game Technology</p></section><section class="statsCompany">		  	<dl>		  		<dt> / <p class="companyPrice gain">+</p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='SRAD'>SRAD<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Sportradar</p></section><section class="statsCompany">		  	<dl>		  		<dt>$11.51 / <p class="companyPrice gain">+0.06<small class="smallWithoutIcon"> (+0.52%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='FLUT'>FLUT<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Flutter Entertainment</p></section><section class="statsCompany">		  	<dl>		  		<dt>$217.92 / <p class="companyPrice loss">-0.03<small class="smallWithoutIcon"> (-0.01%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='PENN'>PENN<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Penn Entertainment</p></section><section class="statsCompany">		  	<dl>		  		<dt>$17.36 / <p class="companyPrice loss">-0.17<small class="smallWithoutIcon"> (-0.97%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='ACEL'>ACEL<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">Accel Entertainment</p></section><section class="statsCompany">		  	<dl>		  		<dt>$11.75 / <p class="companyPrice loss">-0.225<small class="smallWithoutIcon"> (-1.88%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='BALY'>BALY<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Bally's</p></section><section class="statsCompany">		  	<dl>		  		<dt>$13.61 / <p class="companyPrice gain">+0.1<small class="smallWithoutIcon"> (+0.74%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='BYD'>BYD<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Boyd Gaming</p></section><section class="statsCompany">		  	<dl>		  		<dt>$63.03 / <p class="companyPrice loss">-0.675<small class="smallWithoutIcon"> (-1.06%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='CZR'>CZR<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Caesars</p></section><section class="statsCompany">		  	<dl>		  		<dt>$41.34 / <p class="companyPrice loss">-0.285<small class="smallWithoutIcon"> (-0.68%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='CHDN'>CHDN<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Churchill Downs</p></section><section class="statsCompany">		  	<dl>		  		<dt>$117.79 / <p class="companyPrice loss">-0.85<small class="smallWithoutIcon"> (-0.72%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='GAN'>GAN<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">Gan Limited</p></section><section class="statsCompany">		  	<dl>		  		<dt>$1.30 / <p class="companyPrice loss">-0.02<small class="smallWithoutIcon"> (-1.52%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='GENI'>GENI<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">Genius Sports</p></section><section class="statsCompany">		  	<dl>		  		<dt>$5.64 / <p class="companyPrice loss">-0.145<small class="smallWithoutIcon"> (-2.51%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='LVS'>LVS<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Las Vegas Sands</p></section><section class="statsCompany">		  	<dl>		  		<dt>$50.13 / <p class="companyPrice loss">-0.21<small class="smallWithoutIcon"> (-0.42%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='SGHC'>SGHC<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Super Group</p></section><section class="statsCompany">		  	<dl>		  		<dt>$3.44 / <p class="companyPrice loss">-0.155<small class="smallWithoutIcon"> (-4.31%)</small></p></dt>		  	</dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='WYNN'>WYNN<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Wynn Resorts</p></section><section class="statsCompany">		  	<dl>		  		<dt>$99.84 / <p class="companyPrice loss">-0.17<small class="smallWithoutIcon"> (-0.17%)</small></p></dt>		  	</dl></section></div></span></div>
           </div><div class='newsContent'><dd class="clickeable">
                   <p class="abstract hayMasTexto">Welcome to the latest&hellip;  </p><div class="completeText"><p><span class='open_new_overlay gold button'> <a class='open_onthefly_new_window' href='https://thefly.com/permalinks/entry.php/id3886718/RSI;DKNG;GAMB;MGM;ELYS;SRAD;FLUT;PENN;ACEL;BALY;BYD;CZR;CHDN;GAN;GENI;LVS;SGHC;WYNN-Bet-On-It-Rush-Street-Interactive-said-to-explore-potential-sale'> Open Full Text  </a> </span> </p></div></dd> <!--dd.clickeable--></div>  </td></tr><tr id="news_3886717_20240322160000" data-id="3886717"  data-timeOffset="36" data-storytype="" data-topic="hot_stocks" data-datetime="20240322160000" data-unlockdate="2026-12-17 16:00:00" class=" tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1797541200" data-datenews="2024-03-22 16:00:00">  
           <td class="story_type">
              <span class="icon_story_type hot_stocks" data-name="Hot Stocks">
              <div class="fpo_overlay_ticker">Hot Stocks</div>							
            </span>
            </td>  <td><div class="story_header">
          <a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3886717/-Aspac-I-Acquisition-Corp-trading-resumes'>Aspac I Acquisition Corp. trading resumes</a>
            <span class="time_date">  <small class="timeType"><span class="fpo_overlay soloHora">16:00
            <div class="fpo_overlay_ticker">03/22/24</div>
          </span><span class="fpo_overlay fecha">03/22
            <div class="fpo_overlay_ticker">16:00
            </div>
          </span><span class="fpo_overlay fechaConAnio">03/22/24<div class="fpo_overlay_ticker">16:00</div></span></small>  </span> 
          <div class="simbolos_wrapper"></div>
           </div><div class='newsContent'>	      <dd class="">&nbsp;</dd></div>  </td></tr>
          </tbody>
        </table>
        <table class="yesterday news_table first_table">
          <tbody>
              </tbody>
    </table>
  </div>			
  <div class="moreNewsTriggers">	
    <a class="storiesEarlier" href="#" id="see_older_stories"></a>
  </div>
  
</div><!-- /search_news -->
  </div><!-- /content_wrapper -->


<aside id="main_sidebar" style="display:none;">



<section id="on_the_fly_sidebar">
  <h3 class="logged_out"><a href='news.php?onthefly=on&h=6' class='link'>On The Fly</a></h3>
  <p>News and insights, exclusive to thefly.com</p>
  <table>
    <tbody>
    <tr>  <th scope="row">16:12</th>  <td><a onClick="openNewInOverlay('3886727', '2024-03-22 16:12:00');return false;" href="#">What You Missed On Wall Street On Friday&raquo;</a></td></tr><tr>  <th scope="row">16:00</th>  <td><a onClick="openNewInOverlay('3886718', '2024-03-22 16:00:58');return false;" href="#">Bet On It: Rush Street Interactive said to explore potential sale&raquo;</a></td></tr><tr>  <th scope="row">15:24</th>  <td><a onClick="openNewInOverlay('3886707', '2024-03-22 15:24:46');return false;" href="#">Buy/Sell: Wall Street's top 10 stock calls this week&raquo;</a></td></tr><tr>  <th scope="row">12:14</th>  <td><a onClick="openNewInOverlay('3886639', '2024-03-22 12:14:53');return false;" href="#">What You Missed On Wall Street This Morning&raquo;</a></td></tr><tr>  <th scope="row">11:33</th>  <td><a onClick="openNewInOverlay('3886626', '2024-03-22 11:33:36');return false;" href="#">Biotech Alert: Searches spiking for these stocks today&raquo;</a></td></tr>
    </tbody>
  </table>
  <p><a href='news.php?onthefly=on&h=6' class='view_all'>View all On The Fly Stories &raquo;</a></p>
</section><!-- /on_the_fly_sidebar -->	<section id="todays_events">
  <h3>Upcoming<br>Events (0)</h3>
  <table>
    <tbody>
      <tr><td>No upcoming Events for your search</td></tr>
    </tbody>
  </table>
  <p><a href='events.php' class='view_all'>View all of today&rsquo;s events &raquo;</a></p>
</section><!-- /class="todays_events" -->	<section id="todays_syndicate">
  <h3>Today&rsquo;s<br>Syndicate (0)</h3>
  <table>
    <tbody>
      <tr><td><span class='empty_module'>No syndicate deals.</span></td></tr>
    </tbody>
  </table>
  <p><a href='syndicate.php' class='view_all'>View this week&rsquo;s syndicate &raquo;</a></p>
</section><!-- /class="todays_syndicate" -->


</aside><!-- /main_sidebar -->

</div><!-- /wrapper -->


<!-- <footer class="gradient" id="site_footer"> -->
<footer id="site_footer">
<nav class="site_nav">
  <!-- 
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="news.php">Breaking News</a></li>
    <li><a href="onthefly.php">On The Fly</a></li>
    <li><a href="portfolios.php" >My Portfolios</a></li>
    <li><a href="events.php" >Events</a></li>
    <li><a href="syndicate.php" >Syndicate</a></li>
    <li><a href="about_the_fly.php">About The Fly</a></li>
    <li><a href="disclaimer.php">Disclaimer</a></li>
    <li><a href="contact.php">Contact</a></li>
    <li><a href="careers.php">Careers</a></li>
  </ul>
   -->
   <div class="footer_section">
     <div class="footer_title"><span class="title">ABOUT THE FLY</span></div>
    <ul>
      <li><a href="services.php">Services</a></li>
      <li><a href="about_the_fly.php">About Us</a></li>
      <li><a href="faq.php">Help/FAQ</a></li>
      <li><a href="careers.php">Careers</a></li>
      <li><a href="/overlays/disclaimer.php" class='open_disclaimer_overlay'>Disclaimer and Terms of Use</a></li>
      <li><a href="/disclaimer.php?h=Privacy%20Policy&go=priv">Privacy Policy</a></li>
      <li><a href="/overlays/cancellationPolicy.php" class='open_overlay'>Cancellation Policy</a></li>
      <li><a href="/ads_app.php" class='open_donotsellinfo'>Limit the use of my sensitive personal information</a></li>
      <!-- <li><a href="#">Advertise</a></li> -->
    </ul>
  </div>
   <div class="footer_section">
     <div class="footer_title"><span class="title">SUBSCRIPTIONS</span></div>
    <ul>
      <li><a href="rates.php">Basic Plan</a></li>
      <li><a href="rates.php">Full Access</a></li>
    </ul>
  </div>
   <div class="footer_section">
     <div class="footer_title"><span class="title">NEWS</span></div>
    <ul>
      <li><a href="news.php">Breaking News</a></li>
      <li><a id="open_popup_button" href="#" class="open_popup_link slider_control pop_out_button">Breaking News Pop-out</a></li>
      <li><a href="news.php?onthefly=on&h=6">On The Fly</a></li>
      <li><span id="footerFlyCastLink" class="fly_cast_link">Fly Cast</span></li>
    </ul>
  </div>
   <div class="footer_section">
     <div class="footer_title"><span class="title">CALENDARS</span></div>
    <ul>
      <li><a href="events.php" >Events</a></li>
      <li><a href="syndicate.php" >Syndicate</a></li>			
      <li><a href="streetResearch.php" >Street Research</a></li>
    </ul>
  </div>
   <div class="footer_section section_social">
     <div class="footer_title"><span class="title">STAY CONNECTED</span></div>
    <ul>
      <li><a href="contact.php">Contact Us</a></li>
      <li><a href="settings.php?notifications=1">Newsletters and Alerts</a></li>
      <li><a class="social_link" href="https://www.twitter.com/theflynews" target="_blank"><img class="social twitter" src="/images/social/twitter.png"></a><a class="social_link" href="https://www.linkedin.com/company/theflynews" target="_blank"><img class="social linkedin" src="/images/social/linkedin.png"><a class="social_link" href="https://www.facebook.com/theflynews" target="_blank"><img class="social facebook" src="/images/social/facebook.png"></a></a></li>
    </ul>
    
    
  </div>

  <div class="footer_section thefly_copyright">
    Copyright ©1998-2024 Thefly.com LLC		</div>
</nav>
</footer>

<footer id="fixed_footer" class="gradient">
<div class="container">
  <ul>
    <li><a href="#why_the_fly" class="slider_control">Why the Fly?</a></li>
    <li><a href="free_sign_up.php" class="button blue open_free_user">Join Now</a></li>
    <li id="open_synd_popup" class="open_synd_popup"><a id="open_synd_popup" href="#" class="pop_out_button"><img src='images/bottom_nav_pop_synd.svg' alt="Syndicate Pop Up"/> Syndicate Pop-out</a></li>
    <li class="pop_out_button"><a id="open_popup_button" href="#" class="open_popup_link slider_control pop_out_button"><img src='images/bottom_nav_pop_news.svg' alt="Breaking News Pop Up"/>Breaking News Pop-out</a></li>
  </ul>
  <!--<div class="fly small_fly"></div>-->
  <div class="fly_cast">
  <!-- placeholder image: replace with Flash player -->
    <div id="jquery_jplayer_1_deshabilitado" class="jp-jplayer"></div>
    <div id="jp_container_1" class="jp-audio">
      <div class="jp-type-single">
        <div class="jp-gui jp-interface">
          <div class="jp-controls-div">
          <ul class="jp-controls">
            <li><p class='fly-cast-title'>Fly Cast</p></li>
            <li><img style='margin-top:3px;' src='/images/backgrounds/flecha_negra.png' alt='Launch Fly Cast'/></li>
          </ul>
        </div>
        <div class="jp-no-solution">
          <span>Update Required</span>
          To play the media you will need to either update your browser to a recent version or update your <a href="https://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.					</div>
      </div>
    </div>
    <!-- /placeholder image -->
  </div><!-- fly_cast -->
  <div class="fly small_fly"></div>
</div><!-- /container -->
</footer><!-- /fixed_footer -->

<div class="slider gradient" id="why_the_fly">
  <div class="container">
    <h2>Get Full Fly Access</h2>
    <dl>
      <dt>Breaking market intelligence sent straight to you</dt>
      <dd>Our team of experts analyze every news story and filter out the noise to deliver real-time market moving news.</dd>
    </dl>
    <dl>
      <dt>Up-to-date information on important industry events</dt>
      <dd>Get real-time updates on events that are moving the market&mdash;from conferences and calls to syndicate announcements.</dd>
    </dl>
    <dl>
      <dt>News focused on the companies in your portfolio</dt>
      <dd>Create up to 12 portfolios with 150 stocks each, and see how active they are in market news.</dd>
    </dl>
    <div id="why_learn_more">
      <a href="#" class="open_free_trial free_trial_button gold">
        14 Day Free Trial					<!-- <img src="images/buttons/30_day_free_trial.png" alt="14 Day Free Trial" width="168" height="41">-->
      </a>
      <p class="learn_more"><a href="about_the_fly.php">Learn more &raquo;</a></p>
    </div>
    <a href="#" class="close_slider"></a>
    <div class="fly big_fly"></div>
  </div><!-- /container -->
</div><!-- /why_the_fly -->

<script type="text/javascript">var texts = {"busqueda":{"validadorSimbolos":{"oneRepeated":"This symbol is repeated: ","manyRepeated":"These symbols are repeated: ","oneInexistent":"This symbol is non-existent: ","manyInexistent":"These symbols are non-existent: "},"agregarSimbolosABusqueda":{"alert":"The input is empty."}},"dinamizarNoticia":{"cambiarTextoRecsDeshabilitadas":{"textoRecs":"To see Analyst Recommendations, <a href=# class=\"open_free_trial\">subscribe to Full Access Plan<\/a>."},"actualizarNoticiaAbierta":{"msg":"<div class='mostrarContenidoEscondidoActualizado'>This article is now available. <span class='gold linkActualizarContenido'>Update Content<\/span><\/div>"}},"fotw":{"calcularTimeAgo":{"overHour":"Over an hour ago","overMin":"Over a minute ago","overManyMins":"Over %time mins ago","overDay":"Over a day ago"},"radioStream":{"title":"The Fly Radio"},"hayAlMenosUnoChequeado":{"alert":"At least one checkbox must be checked."},"clickAdvancedSearch":{"showAdvanceSearch":"Show advanced search","hideAdvanceSearch":"Hide advanced search"},"validarFormSearchNews":{"alert":"Check market commentary or Recommendation. Or select a portfolio (if logged in)."},"setearCambiosFiltros":[],"groupSelectorsFilters":{"mousedown":{"alert":"At least one filter must be checked."}},"profileSettings":{"noty":{"text":"To apply the changes on the site, we will refresh the page after the popup close"}}},"news":{"ponerNewsPagNews":{"noMoreNews":"No more news for the last year."},"moreNews":{"earlierStories":"Loading earlier stories","storiesSinceClose":"Loading stories since yesterday's close"}},"login":{"respuestaLogin":{"msg":"There was an error processing your request. Please try again"}},"portfolio":{"agregarSimbolosAPortfolio":{"alert":"Symbols field is empty."},"grabarPortfolio":{"alert":"You need to add a symbol to the portfolio to save it."},"borrarSimboloPortfolio":{"alert":"borrar simbolo => %simbolo \n id_port %id_portfolio"}},"settings":{"settingsCheckUnsavedPortfolios":{"noty":{"text":"Do you want save your changes before leaving?"}},"settingsCheckUnsavedBilling":{"noty":{"text":"Your Subscription was not saved. Do you want to leave without saving?"}},"ready":{"delete_portfolio_button":{"click":{"noty":{"text":"Are you sure you want to delete your Portfolio %portName ?"}}},"delete_symbol_button":{"click":{"noty":{"text":"The portfolio should have at least one symbol"}}}},"portfolioInputValidate":{"portNameEmpty":{"noty":{"text":"Please complete portfolio's name"}},"portSymbolsEmpty":{"noty":{"text":"Please complete at least one symbol"}}},"actionSavePortfolio":[],"validarExistenciaSimbolos":{"invalidSymbol":"This symbol is invalid => %symbols","invalidSymbols":"These symbols are invalid => %symbols","dimissMsg":"<br>Click this message to dismiss."},"addSymbolAction":{"portfolioRow_new":{"noty":{"text":"Please type one or more symbols"}},"symbolInputValidate":{"noty":{"text":"Could not add more symbols. You've reached the maximum limit of %maxCantSimbolosPort symbols per portfolio"}}},"portfolioAjaxOK":{"portfolioAdded":"New portfolio was added","portfolioDeleted":"Portfolio was deleted","saveAlertSettings":"Alert's settings were modified"},"symbolInputValidate":{"noty":{"text":"The symbol %symbol is already in the list"}},"notificationsAjaxOK":{"notificationsSaved":"Notifications saved"},"updateSubscriptions":{"savingError":"Error saving the subscriptions changes, please try again"},"otroReady":{"noty":{"text":"Please fill all inputs. The new password and repeat password must be the same."}},"otroReadyMas":{"noty":{"text":"Please complete with a new email address"}},"changeEmailAjaxOK":{"reqError":"Request error. Please try again"}},"update":{"procesarActualizacion_q":{"mostrarMensajeFancy":{"title":"Sorry...","msg":"You have been disconnected because someone has logged in from another location."}},"procesarActualizacion":[]},"buttons":{"subscribe":"Subscribe","save":"Save","discard":"Discard","ok":"Ok","cancel":"Cancel","stay":"Stay"},"popups":{"radio":{"title":"TheFly Radio"}},"fancy":{"title":"The Fly"}};

var ult_modifiedNews = '5545944';

var wid_versions = {"1":"15784"};

var cookieConsentCfg = {"active":true,"cookie":{"name":"cookie_consent","expiry":30}};

</script><script type="text/javascript" src="/js/jquery-ui.min-1.8.18.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/plugins/jquery.cycle.all.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/plugins/fancybox/jquery.fancybox-1.3.4.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/plugins/jquery.placeholder.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/plugins/jquery.form.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/plugins/uniform/jquery.uniform.min.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/plugins/jquery.dotdotdot-1.5.1.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/plugins/Loadingdotdot.mod.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/plugins/soundmanager2-jsmin.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/plugins/jquery.cookie.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/plugins/jquery.clock.min.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/superfish.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/plugins/jquery-tiny-pubsub-master/dist/ba-tiny-pubsub.min.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/vallenato.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/plugins/jquery.noty.packaged.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/ajax.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/fotw.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/update.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/dinamizarNoticias.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/busqueda.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/alertas.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/forgot_password.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/login.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/tooltip.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/news.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/charts.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/overlays.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/analytics.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/widgetOTFIndex.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/widgetTrendingNews.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/site.events.handler.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/widgetLanding.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/news_filters.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/widgetNewsFeed.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/widgetHubs.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/onShow.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/widgetChartQuote.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/cookieConsent.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/widgetFreeTrial.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/widgetChangeCc.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/fu.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/syndicate.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/smJwt.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/widgetFormFreeUser.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/smSignup.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/widgetFreeTrialPromo.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/widgetPromoCode.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/modalMessage.js?lastUpdate=20240323104"></script><script type="text/javascript" src="/js/feed_filters.js?lastUpdate=20240323104"></script><div id="searchAutocompleteWrapper" class="search_autocomplete_wrapper"></div>
<script type="text/javascript">
$(document).ready(function() {
  initSymbolAutocomplete ("#input_nav_search");
  initSymbolAutocomplete ("#symbol_search_news_home");
  initSymbolAutocomplete ("#input_symbol_search_news");
  initSymbolAutocomplete ("#agregarSimbolosInput");	
  initSymbolAutocomplete ("div#search_events_n input:[name='symbol']");
  initOnlyOneSymbolAutocomplete ("#symbol1");
  initOnlyOneSymbolAutocomplete ("#symbol2");
  initOnlyOneSymbolAutocomplete ("#symbol3");
  initOnlyOneSymbolAutocomplete ("#symbol4");
  initOnlyOneSymbolAutocomplete ("#symbol5");
});
</script><script>
trackTiming('Page Requests', '/news.php', '186', 'Request /news.php')
</script>
</body>
</html>
<div class="pop_up_promo" style="display: none;">
</div>

<script type="text/javascript">
var buscaPorCalendario=0;

setearUltimos(1711137000);

    //#653 Make ad Fixed
  var fixmeTop = 0;


//Filtros dinamicos 
  $(document).ready(function() {
   
  setearCambiosFiltros("#search_filter_stories_news input[type='checkbox']");
  
//TODO esto es copia de fotw.js linea 487 para actualizar
// los checks grupales. Es muy parecido salvo que la seleccion
// de las variables de los elementos ($groupElem, $elems) se hacen
// en el fotw relativo al elemento que hace click.

// Rta TODO Me parece que eso a lo que se refeire el todo ya no está
// mas en el fotw.js. Copio todo para ese archivo para reutilizarlo 
// en el news popOut. 
 
  inicializarBotonesShowHideFullStories();

  prepararFiltros();
    
    fixDateRow();
    
    prepararAutoload(getParametrosNews);

    //Eventos busqueda: le pone el on click para que muestre la info
    $("div.eventDateCalendar:not(.syndDateCalendar)", "div.search_results_bar").click(function (){abrirEventInfo($(this), "ev"); return false;});

  //Syndicate busqueda: le pone el onclick
    $("div.search_results_bar div.syndDateCalendar").click(function (){abrirEventInfo($(this),"sy"); return false;});
  
  //Overlay de las recommendations en el header del resultado de busqueda
  $("div.search_results_bar .story_details dl").hover(
    function(){
      $(".fpo_overlay_img", this).each(function() {
        var padre = $(this).parents("span.ticker");
        $(this).css("left",padre.width()+12);
      });
      var overlay = $(".overlayRecNews", this);
      if(overlay.length > 0){
        overlay.show();
        //se fija que esté dentro de la pantalla en el pop
        acomodarEnPop(overlay);
      }
    }, //mouseover
    function(){
      var overlay = $(".overlayRecNews", this);
      if(overlay.length > 0){
        reestablecerEnPop(overlay);
        overlay.hide();
      }
    } //mouseout
  );

  $('#show_full_stories_bloqueado').click(
      function () { // mouseover
        if (loggedin){
          //TODO esto es temporal, si el usuario no está subscripto a news_feed
          //Show full stories está deshabilitado y mandaría a subscibirse a
          //news_feed.
          cambiarOpenFreeTrialASubscribe($(this).siblings('div'));
        }
        $(this).siblings('div').show();
      }
    );
  $('#show_full_stories_not_logged').click(function (){$(this).hide()});

  var widNF = new WidgetNewsFeed("#search_news");


  // Esto es para las related de las busquedas
  // Funciones para abrir lo pops cuando
  // los related recs estan bloqueadas
  $('div.linked dl.relatedRec').click(function (){
    var id = $(this).attr("data-id");
    var sd = $(this).attr("data-sd");
    
    //window.location.href ="landingPageNews.php?id="+id+"&sch_date="+sd;
    window.location.href ="n.php?id="+id+"&sch_date="+sd;
  });
  
  $('div.open_subs dl.relatedRec').click(function(){abrirRelPopUpSubscribed(this)});

  $('div.open_free dl.relatedRec').click(function(){abrirRelPopUpNotLoggedIn(this)});

  //Chequeo si hay que obtener los datos del simbolo diferido.
  if($('#uniq_sym_search.dlyd').length && $(".simboloBuscando.simboloUnico>section.ticker").length){
    var sym = "symbol="+$(".simboloBuscando.simboloUnico>section.ticker").text();
    hacerAjaxSolamente("/ajax/get_q.php", sym, function(res){  ret = JSON.parse(res); if(ret.return){$('#uniq_sym_search.dlyd').html(ret.data)} }, {"type":"post"}, function(){});
  }
  
  //#653 Make ad Fixed
  var fixeableAdSelector = "div.wrapper_ad_fixed";
  if ($(fixeableAdSelector).length != 0){
    fixmeTop = 123+$(fixeableAdSelector).offset().top;   // get initial position of the element		
    fixAds();
  }
});
</script>
`;

const isDST = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const firstOfMarch = new Date(currentYear, 2, 1);
  const daysUntilFirstSundayInMarch = (7 - firstOfMarch.getDay()) % 7;
  const secondSundayInMarch =
    firstOfMarch.getDate() + daysUntilFirstSundayInMarch + 7;
  const start = new Date(currentYear, 2, secondSundayInMarch);
  const firstOfNovember = new Date(currentYear, 10, 1);
  const daysUntilFirstSundayInNov = (7 - firstOfNovember.getDay()) % 7;
  const firstSundayInNovember =
    firstOfNovember.getDate() + daysUntilFirstSundayInNov;
  const end = new Date(currentYear, 10, firstSundayInNovember);

  return (
    currentDate.getTime() <= end.getTime() &&
    currentDate.getTime() >= start.getTime()
  );
};

const stories = [];

for (const m of html.matchAll(
  /(<tr id="news_[\s\S]+?)<div class='newsContent'>/gi
)) {
  const story = m[1];
  const priority = /tr_noticia_prioridad/i.test(story);
  const [_, topic, link, title] = story
    .replace('<span class="importantHeadline">', '')
    .match(
      /data-topic="(.+?)"[\s\S]+<a[\s\S]+href='([\s\S]+?)'>([\s\S]+?)<\/a>/i
    );
  const [__, time, date] = story.match(
    /soloHora">([\s\S]+?)<div class="fpo_overlay_ticker">([\s\S]+?)<\/div>/i
  );
  const tickers = [...story.matchAll(/data-ticker='([\s\S]+?)'/gi)].map(
    (i) => i[1]
  );

  if (tickers.some((t) => true))
    stories.push({
      date: `${date} ${time.replace(/\s+/g, ' ')}GMT-${isDST() ? '4' : '5'}`,
      tickers: tickers.join(','),
      priority,
      topic,
      link,
      title: title.replace(/&#039;/g, "'").replace(/&amp;#39;/g, "'")
    });
}

console.log(stories);

function test() {
  /**
   * Функция форматирования сообщения о новой записи в таблице состояния.
   *
   * @param {json} record - Запись, вставленная в таблицу состояния.
   */
  const formatDateTime = (pubDate) => {
    const [date, timeZ] = new Date(Date.parse(pubDate || new Date()))
      .toISOString()
      .split(/T/);
    const [y, m, d] = date.split(/-/);
    const [time] = timeZ.split(/\./);

    return `${d}.${m}.${y} ${time} MSK`;
  };

  const formatTitle = (record) => {
    let icon = '🐝';

    switch (record.topic) {
      case 'events':
        icon = '📅';

        break;
      case 'recomm':
        icon = '👍';

        break;
      case 'recDowngrade':
        icon = '⬇️';

        break;
      case 'recUpgrade':
        icon = '⬆️';

        break;
      case 'periodicals':
        icon = '📰';

        break;
      case 'options':
        icon = '🅾️';

        break;
      case 'general_news':
        icon = '🌎';

        break;
      case 'hot_stocks':
        icon = '🔥';

        break;
      case 'earnings':
        icon = '💰';

        break;
      case 'syndic':
        break;
      case 'technical_analysis':
        icon = '💹';

        break;
    }

    if (record.priority) icon = '‼️' + icon;

    if (record.tickers.trim())
      return (
        icon +
        ' ' +
        record.tickers
          .split(',')
          .map((ticker) => {
            if (ticker.startsWith('$')) return ticker;

            return '$' + ticker;
          })
          .join(' ')
      );

    return icon + ' The Fly';
  };

  const options = {
    disable_web_page_preview: true
  };

  if (record.tickers.trim()) {
    options.reply_markup = JSON.stringify({
      inline_keyboard: [
        record.tickers
          .split(',')
          .filter((ticker) => {
            return ticker !== '$ECON';
          })
          .slice(0, 5)
          .map((t) => {
            if (t === 'SPB') t = 'SPB@US';

            return {
              text: t,
              callback_data: JSON.stringify({
                e: 'ticker',
                t
              })
            };
          })
      ]
    });
  }

  return {
    text: `${formatTitle(record)}
⏰ ${formatDateTime(record.date)}
<b><a href="${encodeURIComponent(record.link)}">${encodeURIComponent(
      record.title
    )}</a></b>`,
    options
  };
}
