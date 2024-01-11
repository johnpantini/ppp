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

console.log(
  parseXml(
    '<?xml version="1.0" encoding="UTF-8"?><note><to>Tove</to><from>Jani</from><heading>Reminder</heading><body>Do not forget me this weekend!</body></note>'
  )
);

// The Fly
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<script src="/cdn-cgi/apps/head/ndvGCjKj1YsAx8OwosHePwqIQmc.js"></script><style>
#wrapper, #wrapper.no_sidebar {
\tpadding: 0;
\tposition: relative;
\tbox-shadow: 0 -50px 56px rgba(0, 0, 0, 0.50);
\t-moz-box-shadow: 0 -50px 56px rgba(0, 0, 0, 0.50);
\t-webkit-box-shadow: 0 -50px 56px rgba(0, 0, 0, 0.50);
\tvertical-align: top;
\tbackground: #254B82;
margin: 147px auto 0 auto;\t}
</style>
<meta name="title" content="Breaking News - The Fly">
<meta name="description" content="Breaking News - The Fly. The Fly team scours all sources of company news, from mainstream to cutting edge,then filters out the noise to deliver shortform stories consisting of only market moving content.">
<meta name="keywords" content="stock market news, financial investment news, live stock market news, live stock market feeds, stock market alerts">
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:site" content="@theflynews">
<meta property="twitter:title" content="Breaking News - The Fly">
<meta property="twitter:description" content="Breaking News - The Fly. The Fly team scours all sources of company news, from mainstream to cutting edge,then filters out the noise to deliver shortform stories consisting of only market moving content.">
<meta property="twitter:image" content="https://thefly.com/images/meta/metatags.jpg">
<meta property="og:type" content="website">
<meta property="og:title" content="Breaking News - The Fly">
<meta property="og:description" content="Breaking News - The Fly. The Fly team scours all sources of company news, from mainstream to cutting edge,then filters out the noise to deliver shortform stories consisting of only market moving content.">
<meta property="og:image" content="https://thefly.com/images/meta/metatags.jpg">
<link rel="alternate" href="https://m.thefly.com/news-feed"><title>Breaking News - The Fly</title>
<meta http-equiv="X-UA-Compatible" content="IE=Edge" />
<meta http-equiv="Content-type" content="text/html; charset=UTF-8" />
<meta name="Googlebot-News" content="noindex, nofollow"><script type="text/javascript" src="/js/log.js?lastUpdate=202206173423888144"></script><script type="text/javascript" src="/js/jquery-1.7.2.js?lastUpdate=202206173423888144"></script>
<script>
\t//#1067 Algunos plugins generan llamados a undefined page siempre que haya un input con el nombre "search". Esto lo debería apagar.
\twindow.suggestmeyes_loaded = true;
//\tVariable global que indica en qué página está
\tvar page = 'news';
\tvar loggedin = 0;
\tvar esGrandfathered = 0;
\tvar snf = 0;
\tvar fts = 'https://thefly.com//free_trial.php';
\tvar sfd = 'https://thefly.com/';
\tvar logJs = false;
\tvar sessionNotify = {};
\tsessionNotify.title = "";
\tsessionNotify.message = "";
\tsessionNotify.redirect = "";
</script>
<!--[if lt IE 9]>
<script src="//html5shiv.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="viewport" content="width=device-width,initial-scale=1.0">

<link rel="icon" href="/flyfavicon.png" />
<link rel="shortcut icon" href="/flyfavicon.png" />

<link rel="stylesheet" href="/js/plugins/uniform/css/uniform.css">
<link rel="stylesheet" href="/js/plugins/uniform/css/uniform.fotw.css">
<link rel="stylesheet" href="/js/plugins/fancybox/jquery.fancybox-1.3.4.css">
<link rel="stylesheet" href="/css/blue.monday/jplayer.thefly.css">
<link rel="stylesheet" href="/css/todos.css?lastUpdate=202206173423888144">
<!--[if gte IE 9]>
<link rel="stylesheet" href="/css/ie_9up.css">
<![endif]-->
<!--[if lt IE 9]>
<link rel="stylesheet" href="/css/ie_old.css">
<![endif]-->

<script async src="https://www.googletagmanager.com/gtag/js?id=UA-57334935-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('set', 'loginStatus', 'notlogged');
  gtag('set', 'dimension1', 'notlogged');
  gtag('config', 'UA-57334935-1');
</script>
<script>
\t\t\t/* Wrappers para analytics
\t\t\t\t\t- Modificaciones: el parametro fieldsObject se elimino porque no se usa. Para implementarlo en la nueva version hay que agergar para los casos especificos el config. Ver la doc sobre este punto en Google
\t\t\t*/
\t\t\tfunction aTrackEvent(eventCategory, eventAction, eventLabel, eventValue, fieldsObject){
\t\t\t\t\t\t\t\t\t\t// Le paso la dmiension a cada evento por si no lo toma de la sesion
\t\t\t\t\t\tgtag('event', eventAction, {
\t  \t\t\t\t\t'event_category': eventCategory,
\t  \t\t\t\t\t'event_label': eventLabel,
\t  \t\t\t\t\t'value': eventValue,
\t  \t\t\t\t\t'loginStatus': 'notlogged'
\t\t\t\t\t\t});
\t\t\t\t\t\t\t\tlog("aTrackEvent('"+eventCategory+"','"+eventAction+"','"+eventLabel+"','"+eventValue+"')");
\t\t\t\t//console.log("aTrackEvent('"+eventCategory+"','"+eventAction+"','"+eventLabel+"','"+eventValue+"')");
\t\t\t\treturn true;
\t\t\t}

\t\t\tfunction trackTiming(category, timingVar, timingValue, timingLabel ){
\t\t\t\t// Le paso la dmiension a cada evento por si no lo toma de la sesion
\t\t\t\tgtag('event', 'timing_complete', {
\t\t\t\t\t  'name': timingVar,
\t\t\t\t\t  'value': timingValue,
\t\t\t\t\t  'event_category': category,
\t\t\t\t\t  'event_label': timingLabel,
\t\t\t\t\t  'loginStatus': 'notlogged'
\t\t\t\t\t});

\t\t\t\tlog("trackTiming('"+category+"','"+timingVar+"','"+timingValue+"','"+timingLabel+"')");
\t\t\t}

\t\t</script>
<script>

\t\t\t$("document").ready(function(){
\t\t\t\t\t/* No esto y seguro cual de las dos esta funcionando, dejo las dos formas */
\t\t\t\t\tgtag('set', 'loginStatus', 'notlogged');
\t\t\t\t\tgtag('set', 'dimension1', 'notlogged');
\t\t\t});
\t\t\t</script>
<script type='application/ld+json'>
{"@context":"http:\\/\\/schema.org","@type":"Organization","url":"https:\\/\\/thefly.com","logo":"https:\\/\\/thefly.com\\/images\\/logo_thefly_small.png","contactPoint":[{"@type":"ContactPoint","telephone":"+1 908 273 6397","contactType":"customer support","areaServed":"US","availableLanguage":"English"}],"sameAs":[]}</script><script type='application/ld+json'>
{"@context":"http:\\/\\/schema.org","@type":"WebSite","name":"TheFly.com","alternateName":"First site in stock news.","url":"https:\\/\\/thefly.com"}</script>
<script async src="https://u5.investingchannel.com/static/uat.js"></script>
<script>
         InvestingChannelQueue = window.InvestingChannelQueue || [];
         InvestingChannelQueue.push(function() {
             InvestingChannel.UAT.Run("0e5c08ae-fecf-41c6-8671-93ae635c67af");
         });
</script>
</head>
<body class=" ">
<div class="cookie-banner" style="display:none">
<div class="exclamation-icon">
<img src="/images/exclamation_icon.png" />
</div>
<div class="consent-message">
<div class="consent-title">We use cookies to improve user experience, and analyze website traffic.
</div>
<div class="consent-text">
For these reasons, we may share your site usage data with our analytics partners. By clicking "Accept Cookies" you consent to store on your device all the technologies described in our <a href="/overlays/disclaimer.php?h=Privacy%20Policy&#priv" class='open_disclaimer_overlay'>Cookie Policy.</a>
</div>
</div>
<div class="consent-accept">
<button class="cookie-accept gold">ACCEPT COOKIES</button>
</div>
</div><header id="site_header" style='height: 100px;' class="gradient site_header_back">
<div class="container">
<dl id='site_logo'>&nbsp;</dl>
<div id='ic_728x90_1' class='ad_wrapper ad_header'></div> <form action="login.php" onsubmit="javascript:return false;" id="login_form" method="post">
<input name="username" id="username" type="text" class="textinput not_uniform" size="28" maxlength="50" placeholder="Email/Username">
<input name="password" id="password" type="password" class="textinput not_uniform" size="28" maxlength="50" placeholder="Password">
<input type="image" src="/images/buttons/login_new.png">
<a href="#" class="button gold open_free_trial">Get Free Trial</a>
<div class='links_abajo_login'>
<a href="overlays/forgotPassword.php" class="forgot_password">Forgot password</a><br>
<label for="remember_me">Remember me</label>&nbsp;<input name="remember_me" id="remember_me" type="checkbox" />
</div>
</form>
</div>
</header>
<nav id="site_header_nav" style='top:100px' class="gradient">
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
<li><a id='link_calendar_menu' href="#">Calendars</a>
<ul class='ul_menu_dentro_calendar' style="display: none;">
<li><a href="events.php">Events</a></li>
<li><a href="syndicate.php">Syndicate</a></li>
<li><a href="streetResearch.php">Street&nbsp;Research</a></li>
</ul>
</li>
<li><a id='link_about_menu' href="#">About The Fly</a>
<ul style="display: none;" id="menu_about_list">
<li><a href="services.php">Services</a></li>
<li><a href="about_the_fly.php">About&nbsp;Us</a></li>
<li><a href="faq.php">HELP/FAQ</a></li>
<li><a href="contact.php">Contact Us</a></li>
<li><a href='/rates.php' class='open_subscriptions_overlay '>Subscriptions</a></li>
<li><a href="/overlays/disclaimer.php" class='open_disclaimer_overlay'>Disclaimer and Terms of Use</a></li>
<li><a href="/overlays/disclaimer.php?h=Privacy%20Policy&#priv" class='open_disclaimer_overlay'>Privacy Policy</a></li>
<li><a href="/ads_app.php" class='open_donotsellinfo'>Do Not Sell My Personal Information</a></li>
</ul>
</li>

</ul>
<form action="news.php" method="get" id="nav_search">
<input id='input_nav_search' name="symbol" type="text" class="textinput" size="10" maxlength="50" placeholder="Enter Symbol">
<input type="image" src="/images/buttons/search_nav.png">
</form>
</div>
</nav>
<div id="wrapper" class="no_sidebar">
<div id="content_wrapper" class="no_sidebar">
<header>
<h1 class="breaking_news">Breaking News</h1>
<ul id="view_options">
<li id="view_label">View</li>
<li><a href="#" id="hide_sidebar" class="active" title="Hide sidebar">Hide Sidebar</a></li>
<li><a href="#" id="show_sidebar" title="Show sidebar">Show Sidebar</a></li>
<li><a href="#" id="open_popup" class='open_popup_link' title="Open popup">Open Popup</a></li>
</ul>
</header>
<div id="search_news" class="clearfix">
<form action="news.php" method="get" id="search_filter_stories_news">
<fieldset class="news_filters collapsed gradient" id="portfolio_timeframe">
<input id="input_symbol_search_news" name="symbol" type="text" class="textinput" size="25" maxlength="50" placeholder="Enter Symbols">
<input type="image" src="/images/buttons/search_nav.png"> <div id='ic_88x31_1' class='ad_wrapper trade_now_button'></div><div id='ic_234x20_1' class='ad_wrapper ad_junto_titulo_news'></div> </fieldset>
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
</fieldset> </form>
<div class='newsFeedWidget'>
<table class="first_table" style='margin: 0;'>
<tbody> </table><table class='news_table today first_table'> <tr class='dateDivisionRow firstRowClass' data-date='2022-06-17'> <td colspan=5 class='dateDivision'>Today<span id='calendarioEnDivisionTiempo' class='calendario'><input type='text' name='fecha' style='display:none;' /> </span><div id='toggle_stories'><a href='#' class='fpo_overlay' id='show_full_stories_bloqueado'>Show Full Stories</a><div id='show_full_stories_not_logged'> <p class="candado_chico"> <span class="cerrarBoton" style="float: right;">X</span> </p>To view all stories in expanded form, please subscribe.<div class='footer_show_full_stories_bloqueado'><a href='#' class='button gold open_free_trial'>Get Free Trial</a></div></div><a class='send_info_link' href='contact.php?send=1'> Send Info </a></div></td> </tr><tr id="news_3532709_20220617103542" data-id="3532709" data-timeOffset="9" data-storytype="" data-topic="hot_stocks" data-datetime="20220617103542" data-unlockdate="2022-06-17 10:45:42" class="tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1655477142" data-datenews="2022-06-17 10:35:42"> <td class="story_type">
<span class="icon_story_type hot_stocks" data-name="Hot Stocks">
<div class="fpo_overlay_ticker">Hot Stocks</div>
</span>
</td> <td><div class="story_header">
<a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3532709/SGEN-Seattle-Genetics-trading-resumes'><span>Seattle Genetics trading resumes</span></a>&nbsp;
<span class="time_date">
<small class="timeType"><span class="fpo_overlay soloHora">10:35<div class="fpo_overlay_ticker">06/17/22</div></span><span class="fpo_overlay fecha">06/17<div class="fpo_overlay_ticker">10:35</div></span><span class="fpo_overlay fechaConAnio">06/17/22<div class="fpo_overlay_ticker">10:35</div></span></small>
</span> <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='SGEN'>SGEN<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Seagen</p></section><section class="statsCompany"> <dl> <dt>$153.00 / <p class="companyPrice gain">+6.34<small class="smallWithoutIcon"> (+4.32%)</small></p></dt> </dl></section></div></span></div>
</div><div class='newsContent'> <dd class="">&nbsp;</dd></div><div class='elementosRelacionadosWrapper  noMoreContent '> <div class='clickeable toggleRelated'> <span class='showWord'>Show</span><span class='hideWord'>Hide</span> Related Items&nbsp;<span class='showWord'>>></span><span class='hideWord'><<</span> </div> <div class='relatedContent'> <ul class='globalRelated'> <li class='linkRelTopic_1'> <a href='#rel_1_tab'>Company News</a></li> <li class='linkRelatedRecs'> <a href='#rel_rec_tab'>Street Research </a></li> <li class='linkRelTopic_2'> <a href='#rel_2_tab'>Earnings</a></li> <li class='linkRelTopic_3'> <a href='#rel_3_tab'>Periodicals</a></li> <li class='linkRelTopic_4'> <a href='#rel_4_tab'>On The Fly</a></li></ul><div class='relTopic1' id='rel_1_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$153.00 / <p class="companyPrice gain">+6.34<small class="smallWithoutIcon"> (+4.32%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="hot related" data-id="3532707" data-sd="2022-06-17 10:33:25"> <dt>10:33 Today</dt> <dd>Seagen jumps 10% to $161.79 after WSJ report of Merck interest</dd></dl><dl class="hot related" data-id="3532704" data-sd="2022-06-17 10:30:42"> <dt>10:30 Today</dt> <dd>Seattle Genetics trading halted, volatility trading pause</dd></dl><dl class="hot related" data-id="3526694" data-sd="2022-06-06 11:04:52"> <dt> 06/06/22</dt> <dd>Seagen, Genmab present data from tisotumab vedotin clinical development program</dd></dl><dl class="hot related" data-id="3526107" data-sd="2022-06-03 15:14:45"> <dt> 06/03/22</dt> <dd>Seagen says trial data show Adcetris, AVE-PC combo was well tolerated</dd></dl></section></div><div id='rel_rec_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$153.00 / <p class="companyPrice gain">+6.34<small class="smallWithoutIcon"> (+4.32%)</small></p></dt> </dl></section><section class="recsCompany"><dl class="no_change relatedRec" data-id="3491492" data-sd="2022-04-08 14:46:24"> <dt> 04/08/22 Roth Capital</dt> <dd>Bicycle reported &#039;very strong&#039; side-effect profile, says Roth Capital</dd></dl><dl class="no_change relatedRec" data-id="3491490" data-sd="2022-04-08 14:40:24"> <dt> 04/08/22 Cantor Fitzgerald</dt> <dd>Bicycle Therapeutics&#039; BT8009 abstract &#039;very positive,&#039; says Cantor Fitzgerald</dd></dl><dl class="no_change relatedRec" data-id="3465922" data-sd="2022-02-24 11:04:16"> <dt> 02/24/22 Piper Sandler</dt> <dd>Seagen&#039;s tisotumab vedotin shows &#039;modest signal of activity,&#039; says Piper Sandler</dd></dl><dl class="no_change relatedRec" data-id="3460254" data-sd="2022-02-16 07:24:58"> <dt> 02/16/22 JMP Securities</dt> <dd>Seagen price target lowered to $142 from $201 at JMP Securities</dd></dl></div><div class='relTopic2' id='rel_2_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$153.00 / <p class="companyPrice gain">+6.34<small class="smallWithoutIcon"> (+4.32%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="ear related" data-id="3502681" data-sd="2022-04-28 16:06:56"> <dt> 04/28/22</dt> <dd>Seagen sees FY22 total revenue $1.665B-$1.745B, consensus $1.78B</dd></dl><dl class="ear related" data-id="3502676" data-sd="2022-04-28 16:06:05"> <dt> 04/28/22</dt> <dd>Seagen reports Q1 EPS (74c), consensus ($1.00)</dd></dl><dl class="ear related" data-id="3456759" data-sd="2022-02-10 07:29:32"> <dt> 02/10/22</dt> <dd>Seagen sees FY22 total revenue $1.67B-$1.75B, consensus $2.16B</dd></dl><dl class="ear related" data-id="3456235" data-sd="2022-02-09 16:03:20"> <dt> 02/09/22</dt> <dd>Seagen reports Q4 EPS (95c), consensus (83c)</dd></dl></section></div><div class='relTopic3' id='rel_3_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$153.00 / <p class="companyPrice gain">+6.34<small class="smallWithoutIcon"> (+4.32%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="period related" data-id="3532706" data-sd="2022-06-17 10:32:57"> <dt>10:32 Today</dt> <dd>Merck considering acquisition of Seagen, WSJ reports</dd></dl></section></div><div class='relTopic4' id='rel_4_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$153.00 / <p class="companyPrice gain">+6.34<small class="smallWithoutIcon"> (+4.32%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="otf related" data-id="3457387" data-sd="2022-02-10 16:26:03"> <dt> 02/10/22</dt> <dd>Wall Street in Fives - Must Read Lists for Thursday</dd></dl><dl class="otf related" data-id="3457132" data-sd="2022-02-10 12:13:49"> <dt> 02/10/22</dt> <dd>Wall Street in Fives - Must Read Lists at Midday</dd></dl><dl class="otf related" data-id="3456468" data-sd="2022-02-09 18:36:25"> <dt> 02/09/22</dt> <dd>Fly Intel: After-Hours Movers</dd></dl></section></div> </div></div> </td></tr><tr id="news_3532708_20220617103503" data-id="3532708" data-timeOffset="9" data-storytype="" data-topic="options" data-datetime="20220617103503" data-unlockdate="2022-06-18 10:35:03" class="tr_noticia options Options " data-unlockdateUTC="1655562903" data-datenews="2022-06-17 10:35:03"> <td class="story_type">
<span class="icon_story_type options" data-name="Options">
<div class="fpo_overlay_ticker">Options</div>
</span>
</td> <td><div class="story_header">
<a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3532708/F-Ford-put-volume-heavy-and-directionally-bearish'><span>Ford put volume heavy and directionally bearish</span></a>&nbsp;<span class='flechitaflechita'>»</span>
<span class="time_date">
<small class="timeType"><span class="fpo_overlay soloHora">10:35<div class="fpo_overlay_ticker">06/17/22</div></span><span class="fpo_overlay fecha">06/17<div class="fpo_overlay_ticker">10:35</div></span><span class="fpo_overlay fechaConAnio">06/17/22<div class="fpo_overlay_ticker">10:35</div></span></small>
</span> <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='F'>F<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Ford</p></section><section class="statsCompany"> <dl> <dt>$11.09 / <p class="companyPrice loss">-0.165<small class="smallWithoutIcon"> (-1.47%)</small></p></dt> </dl></section></div></span></div>
</div><div class='newsContent'><dd class='clickeable blocked'>
<p class='abstract'>Bearish flow noted in&hellip; <div class="candado"><div id="free_promo"><p class="open_free_trial"><strong>Story temporarily locked.</strong><br>To read stories as they happen please subscribe, Login above, or return <span class='tiempo_faltante'>tomorrow</span></p><a href="#" class="button gold open_free_trial">Get Free Trial</a></div></div></p></dd></div><div class='elementosRelacionadosWrapper '> <div class='clickeable toggleRelated'> <span class='showWord'>Show</span><span class='hideWord'>Hide</span> Related Items&nbsp;<span class='showWord'>>></span><span class='hideWord'><<</span> </div> <div class='relatedContent'> <ul class='globalRelated'> <li class='linkRelTopic_1'> <a href='#rel_1_tab'>Company News</a></li> <li class='linkRelatedRecs'> <a href='#rel_rec_tab'>Street Research </a></li> <li class='linkRelTopic_2'> <a href='#rel_2_tab'>Earnings</a></li> <li class='linkRelTopic_3'> <a href='#rel_3_tab'>Periodicals</a></li> <li class='linkRelTopic_4'> <a href='#rel_4_tab'>On The Fly</a></li> <li class='linkRelatedEvents'> <a href='#rel_ev_tab'>Events </a></li> <li class='linkRelTopic_5'> <a href='#rel_5_tab'>Options</a></li></ul><div class='relTopic1' id='rel_1_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="F">F</span> <span class="infoCompany">Ford</span></section><section class="statsCompany"> <dl> <dt>$11.09 / <p class="companyPrice loss">-0.165<small class="smallWithoutIcon"> (-1.47%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="hot related" data-id="3531779" data-sd="2022-06-16 06:42:15"> <dt> 06/16/22</dt> <dd>EU passenger car registrations down 11.2% in May</dd></dl><dl class="hot related" data-id="3531429" data-sd="2022-06-15 10:33:52"> <dt> 06/15/22</dt> <dd>Ford Credit seeing delinquencies start to increase, says CFO Lawler</dd></dl><dl class="hot related" data-id="3531427" data-sd="2022-06-15 10:32:57"> <dt> 06/15/22</dt> <dd>Ford CFO John Lawler says demand continues to be &#039;very robust&#039;</dd></dl><dl class="hot related" data-id="3525317" data-sd="2022-06-02 09:19:11"> <dt> 06/02/22</dt> <dd>Ford reports May U.S. vehicle sales 154,461, down 4.5%</dd></dl></section></div><div id='rel_rec_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="F">F</span> <span class="infoCompany">Ford</span></section><section class="statsCompany"> <dl> <dt>$11.09 / <p class="companyPrice loss">-0.165<small class="smallWithoutIcon"> (-1.47%)</small></p></dt> </dl></section><section class="recsCompany"><dl class="no_change relatedRec" data-id="3524441" data-sd="2022-06-01 08:31:37"> <dt> 06/01/22 Goldman Sachs</dt> <dd>Ford price target lowered to $14 from $18 at Goldman Sachs</dd></dl><dl class="no_change relatedRec" data-id="3524199" data-sd="2022-06-01 06:16:22"> <dt> 06/01/22 Citi</dt> <dd>Citi lowers Ford tagret but opens &#039;90-Day Upside Catalyst Watch&#039;</dd></dl><dl class="no_change relatedRec" data-id="3519686" data-sd="2022-05-20 13:04:32"> <dt> 05/20/22 Tigress Financial</dt> <dd>Ford price target raised to $22 from $20 at Tigress Financial</dd></dl><dl class="upgrade relatedRec" data-id="3515292" data-sd="2022-05-13 07:58:17"> <dt> 05/13/22 Morgan Stanley</dt> <dd>Ford upgraded to Equal Weight at Morgan Stanley following selloff</dd></dl></div><div class='relTopic2' id='rel_2_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="F">F</span> <span class="infoCompany">Ford</span></section><section class="statsCompany"> <dl> <dt>$11.09 / <p class="companyPrice loss">-0.165<small class="smallWithoutIcon"> (-1.47%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="ear related" data-id="3501378" data-sd="2022-04-27 16:07:24"> <dt> 04/27/22</dt> <dd>Ford reports Q1 adjusted EPS 38c, consensus 37c</dd></dl><dl class="ear related" data-id="3501222" data-sd="2022-04-27 13:31:39"> <dt> 04/27/22</dt> <dd>Notable companies reporting after market close</dd></dl><dl class="ear related" data-id="3452822" data-sd="2022-02-03 16:07:14"> <dt> 02/03/22</dt> <dd>Ford reports Q4 adjusted EPS 26c, consensus 45c</dd></dl><dl class="ear related" data-id="3452702" data-sd="2022-02-03 13:09:18"> <dt> 02/03/22</dt> <dd>Notable companies reporting after market close</dd></dl></section></div><div class='relTopic3' id='rel_3_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="F">F</span> <span class="infoCompany">Ford</span></section><section class="statsCompany"> <dl> <dt>$11.09 / <p class="companyPrice loss">-0.165<small class="smallWithoutIcon"> (-1.47%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="period related" data-id="3532354" data-sd="2022-06-16 16:38:48"> <dt> 06/16/22</dt> <dd>Ford recalls 2.9M vehicles due to gear shift issue, NY Times says</dd></dl><dl class="period related" data-id="3530683" data-sd="2022-06-14 10:38:00"> <dt> 06/14/22</dt> <dd>Ford tells dealers to stop selling electric Mustang Mach-E crossovers, CNBC says</dd></dl><dl class="period related" data-id="3530041" data-sd="2022-06-13 12:00:49"> <dt> 06/13/22</dt> <dd>U.S. car makers urge congress to lift cap on EV tax credits, Reuters says</dd></dl><dl class="period related" data-id="3526191" data-sd="2022-06-04 09:46:06"> <dt> 06/04/22</dt> <dd>Stellantis now an overlooked star, Barron&#039;s says</dd></dl></section></div><div class='relTopic4' id='rel_4_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="F">F</span> <span class="infoCompany">Ford</span></section><section class="statsCompany"> <dl> <dt>$11.09 / <p class="companyPrice loss">-0.165<small class="smallWithoutIcon"> (-1.47%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="otf related" data-id="3530877" data-sd="2022-06-14 16:28:22"> <dt> 06/14/22</dt> <dd>What You Missed On Wall Street On Tuesday</dd></dl><dl class="otf related" data-id="3530753" data-sd="2022-06-14 12:23:48"> <dt> 06/14/22</dt> <dd>What You Missed On Wall Street This Morning</dd></dl><dl class="otf related" data-id="3530003" data-sd="2022-06-13 10:30:40"> <dt> 06/13/22</dt> <dd>What You Missed This Week in EVs and Clean Energy</dd></dl><dl class="otf related" data-id="3526187" data-sd="2022-06-04 09:23:43"> <dt> 06/04/22</dt> <dd>Opening Day: Zhong Yang rises 240% in market debut</dd></dl></section></div><div class='evRelated' id='rel_ev_tab'><div class='related-evs'><div class="related-ev-wrapper"><dl class="ev_t_conference_calls eventDateCalendar"> <dt> 06/22/22</dt> <dd>Ford - F</dd></dl><div id="ev420037_4" class="muestraEvento eventoPagEventos" style="display: none; width:361; height:294; position: absolute;" data-id="420037" data-tipoEventoId="0"></div></div><div class="related-ev-wrapper"><dl class="ev_t_conference_calls eventDateCalendar"> <dt> 07/27/22</dt> <dd>Ford - F</dd></dl><div id="ev419904_5" class="muestraEvento eventoPagEventos" style="display: none; width:361; height:294; position: absolute;" data-id="419904" data-tipoEventoId="0"></div></div></div></div><div class='relTopic5' id='rel_5_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="F">F</span> <span class="infoCompany">Ford</span></section><section class="statsCompany"> <dl> <dt>$11.09 / <p class="companyPrice loss">-0.165<small class="smallWithoutIcon"> (-1.47%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="opt related" data-id="3527799" data-sd="2022-06-08 07:35:03"> <dt> 06/08/22</dt> <dd>Unusual call flow in option market yesterday</dd></dl><dl class="opt related" data-id="3527534" data-sd="2022-06-07 16:20:11"> <dt> 06/07/22</dt> <dd>Early call buyers in Ford see 100% gains</dd></dl><dl class="opt related" data-id="3525259" data-sd="2022-06-02 08:55:07"> <dt> 06/02/22</dt> <dd>Notable open interest changes for June 2nd</dd></dl><dl class="opt related" data-id="3524493" data-sd="2022-06-01 08:55:04"> <dt> 06/01/22</dt> <dd>Notable open interest changes for June 1st</dd></dl></section></div> </div></div> </td></tr><tr id="news_3532707_20220617103325" data-id="3532707" data-timeOffset="9" data-storytype="" data-topic="hot_stocks" data-datetime="20220617103325" data-unlockdate="2022-06-17 10:43:25" class="tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1655477005" data-datenews="2022-06-17 10:33:25"> <td class="story_type">
<span class="icon_story_type hot_stocks" data-name="Hot Stocks">
<div class="fpo_overlay_ticker">Hot Stocks</div>
</span>
</td> <td><div class="story_header">
<a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3532707/SGEN;MRK-Seagen-jumps--to--after-WSJ-report-of-Merck-interest'><span>Seagen jumps 10% to $161.79 after WSJ report of Merck interest</span></a>&nbsp;
<span class="time_date">
<small class="timeType"><span class="fpo_overlay soloHora">10:33<div class="fpo_overlay_ticker">06/17/22</div></span><span class="fpo_overlay fecha">06/17<div class="fpo_overlay_ticker">10:33</div></span><span class="fpo_overlay fechaConAnio">06/17/22<div class="fpo_overlay_ticker">10:33</div></span></small>
</span> <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='SGEN'>SGEN<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Seagen</p></section><section class="statsCompany"> <dl> <dt>$152.27 / <p class="companyPrice gain">+5.61<small class="smallWithoutIcon"> (+3.83%)</small></p></dt> </dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='MRK'>MRK<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Merck</p></section><section class="statsCompany"> <dl> <dt>$85.29 / <p class="companyPrice gain">+0.39<small class="smallWithoutIcon"> (+0.46%)</small></p></dt> </dl></section></div></span></div>
</div><div class='newsContent'> <dd class="">&nbsp;</dd></div><div class='elementosRelacionadosWrapper  noMoreContent '> <div class='clickeable toggleRelated'> <span class='showWord'>Show</span><span class='hideWord'>Hide</span> Related Items&nbsp;<span class='showWord'>>></span><span class='hideWord'><<</span> </div> <div class='relatedContent'> <ul class='globalRelated'> <li class='linkRelTopic_1'> <a href='#rel_1_tab'>Company News</a></li> <li class='linkRelatedRecs'> <a href='#rel_rec_tab'>Street Research </a></li> <li class='linkRelTopic_2'> <a href='#rel_2_tab'>Earnings</a></li> <li class='linkRelTopic_3'> <a href='#rel_3_tab'>Periodicals</a></li> <li class='linkRelTopic_4'> <a href='#rel_4_tab'>On The Fly</a></li> <li class='linkRelatedEvents'> <a href='#rel_ev_tab'>Events </a></li> <li class='linkRelTopic_5'> <a href='#rel_5_tab'>Options</a></li></ul><div class='relTopic1' id='rel_1_tab'><div class='story_details_tabs'><ul><li><a href='#tab_rel_noti_1_1'><span>SGEN</span></a></li><li><a href='#tab_rel_noti_1_2'><span>MRK</span></a></li></ul><div class='div_tab' id='tab_rel_noti_1_1'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$152.27 / <p class="companyPrice gain">+5.61<small class="smallWithoutIcon"> (+3.83%)</small></p></dt> </dl></section><dl class="hot related" data-id="3532704" data-sd="2022-06-17 10:30:42"> <dt>10:30 Today</dt> <dd>Seattle Genetics trading halted, volatility trading pause</dd></dl><dl class="hot related" data-id="3526694" data-sd="2022-06-06 11:04:52"> <dt> 06/06/22</dt> <dd>Seagen, Genmab present data from tisotumab vedotin clinical development program</dd></dl><dl class="hot related" data-id="3526107" data-sd="2022-06-03 15:14:45"> <dt> 06/03/22</dt> <dd>Seagen says trial data show Adcetris, AVE-PC combo was well tolerated</dd></dl><dl class="hot related" data-id="3520202" data-sd="2022-05-23 08:36:48"> <dt> 05/23/22</dt> <dd>Seagen gives topline results of Phase 2 trial of tucatinib/trastuzumab combo</dd></dl></div><div class='div_tab' id='tab_rel_noti_1_2'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="MRK">MRK</span> <span class="infoCompany">Merck</span></section><section class="statsCompany"> <dl> <dt>$85.29 / <p class="companyPrice gain">+0.39<small class="smallWithoutIcon"> (+0.46%)</small></p></dt> </dl></section><dl class="hot related" data-id="3532585" data-sd="2022-06-17 08:03:08"> <dt>08:03 Today</dt> <dd>Codexis announces publication of research on bioconjugation of native peptides</dd></dl><dl class="hot related" data-id="3532272" data-sd="2022-06-16 15:30:14"> <dt> 06/16/22</dt> <dd>FTC says to ramp up enforcement against illegal drug rebate schemes</dd></dl><dl class="hot related" data-id="3529711" data-sd="2022-06-13 06:46:50"> <dt> 06/13/22</dt> <dd>Merck announces FDA approval of sBLA for KEYTRUDA</dd></dl><dl class="hot related" data-id="3527026" data-sd="2022-06-07 06:47:55"> <dt> 06/07/22</dt> <dd>Merck and Ridgeback announce additional data from Phase 3 MOVe-OUT trial</dd></dl></div></div></div><div id='rel_rec_tab'><div class='story_details_tabs'><ul><li><a href='#tab_1'><span>SGEN</span></a></li><li><a href='#tab_2'><span>MRK</span></a></li></ul><div class='div_tab' id='tab_1'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$152.27 / <p class="companyPrice gain">+5.61<small class="smallWithoutIcon"> (+3.83%)</small></p></dt> </dl></section><section class="recsCompany"><dl class="no_change relatedRec" data-id="3491492" data-sd="2022-04-08 14:46:24"> <dt> 04/08/22 Roth Capital</dt> <dd>Bicycle reported &#039;very strong&#039; side-effect profile, says Roth Capital</dd></dl><dl class="no_change relatedRec" data-id="3491490" data-sd="2022-04-08 14:40:24"> <dt> 04/08/22 Cantor Fitzgerald</dt> <dd>Bicycle Therapeutics&#039; BT8009 abstract &#039;very positive,&#039; says Cantor Fitzgerald</dd></dl><dl class="no_change relatedRec" data-id="3465922" data-sd="2022-02-24 11:04:16"> <dt> 02/24/22 Piper Sandler</dt> <dd>Seagen&#039;s tisotumab vedotin shows &#039;modest signal of activity,&#039; says Piper Sandler</dd></dl><dl class="no_change relatedRec" data-id="3460254" data-sd="2022-02-16 07:24:58"> <dt> 02/16/22 JMP Securities</dt> <dd>Seagen price target lowered to $142 from $201 at JMP Securities</dd></dl></div></section><div class='div_tab' id='tab_2'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="MRK">MRK</span> <span class="infoCompany">Merck</span></section><section class="statsCompany"> <dl> <dt>$85.29 / <p class="companyPrice gain">+0.39<small class="smallWithoutIcon"> (+0.46%)</small></p></dt> </dl></section><section class="recsCompany"><dl class="no_change relatedRec" data-id="3492541" data-sd="2022-04-12 07:12:50"> <dt> 04/12/22 Barclays</dt> <dd>Merck price target raised to $97 from $94 at Barclays</dd></dl><dl class="no_change relatedRec" data-id="3491720" data-sd="2022-04-11 06:42:59"> <dt> 04/11/22 H.C. Wainwright</dt> <dd>Rubius Therapeutics price target lowered to $15 from $40 at H.C. Wainwright</dd></dl><dl class="initiate relatedRec" data-id="3489662" data-sd="2022-04-06 07:35:29"> <dt> 04/06/22 Morgan Stanley</dt> <dd>Merck assumed with an Equal Weight at Morgan Stanley</dd></dl><dl class="no_change relatedRec" data-id="3489294" data-sd="2022-04-05 14:55:00"> <dt> 04/05/22 BMO Capital</dt> <dd>Merck targets &#039;ambitious&#039; $10B revenue from cardiovascular franchise, says BMO</dd></dl></div></section></div></div><div class='relTopic2' id='rel_2_tab'><div class='story_details_tabs'><ul><li><a href='#tab_rel_noti_2_1'><span>SGEN</span></a></li><li><a href='#tab_rel_noti_2_2'><span>MRK</span></a></li></ul><div class='div_tab' id='tab_rel_noti_2_1'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$152.27 / <p class="companyPrice gain">+5.61<small class="smallWithoutIcon"> (+3.83%)</small></p></dt> </dl></section><dl class="ear related" data-id="3502681" data-sd="2022-04-28 16:06:56"> <dt> 04/28/22</dt> <dd>Seagen sees FY22 total revenue $1.665B-$1.745B, consensus $1.78B</dd></dl><dl class="ear related" data-id="3502676" data-sd="2022-04-28 16:06:05"> <dt> 04/28/22</dt> <dd>Seagen reports Q1 EPS (74c), consensus ($1.00)</dd></dl><dl class="ear related" data-id="3456759" data-sd="2022-02-10 07:29:32"> <dt> 02/10/22</dt> <dd>Seagen sees FY22 total revenue $1.67B-$1.75B, consensus $2.16B</dd></dl><dl class="ear related" data-id="3456235" data-sd="2022-02-09 16:03:20"> <dt> 02/09/22</dt> <dd>Seagen reports Q4 EPS (95c), consensus (83c)</dd></dl></div><div class='div_tab' id='tab_rel_noti_2_2'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="MRK">MRK</span> <span class="infoCompany">Merck</span></section><section class="statsCompany"> <dl> <dt>$85.29 / <p class="companyPrice gain">+0.39<small class="smallWithoutIcon"> (+0.46%)</small></p></dt> </dl></section><dl class="ear related" data-id="3501783" data-sd="2022-04-28 06:34:23"> <dt> 04/28/22</dt> <dd>Merck raises FY22 adjusted EPS view to $7.24-$7.36, consensus $7.24</dd></dl><dl class="ear related" data-id="3501774" data-sd="2022-04-28 06:30:33"> <dt> 04/28/22</dt> <dd>Merck reports Q1 adjusted EPS $2.14, consensus $1.83</dd></dl><dl class="ear related" data-id="3501224" data-sd="2022-04-27 20:25:00"> <dt> 04/27/22</dt> <dd>Notable companies reporting before tomorrow&#039;s open</dd></dl><dl class="ear related" data-id="3501224" data-sd="2022-04-27 13:38:15"> <dt> 04/27/22</dt> <dd>Notable companies reporting before tomorrow&#039;s open</dd></dl></div></div></div><div class='relTopic3' id='rel_3_tab'><div class='story_details_tabs'><ul><li><a href='#tab_rel_noti_3_1'><span>SGEN</span></a></li><li><a href='#tab_rel_noti_3_2'><span>MRK</span></a></li></ul><div class='div_tab' id='tab_rel_noti_3_1'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$152.27 / <p class="companyPrice gain">+5.61<small class="smallWithoutIcon"> (+3.83%)</small></p></dt> </dl></section><dl class="period related" data-id="3532706" data-sd="2022-06-17 10:32:57"> <dt>10:32 Today</dt> <dd>Merck considering acquisition of Seagen, WSJ reports</dd></dl></div><div class='div_tab' id='tab_rel_noti_3_2'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="MRK">MRK</span> <span class="infoCompany">Merck</span></section><section class="statsCompany"> <dl> <dt>$85.29 / <p class="companyPrice gain">+0.39<small class="smallWithoutIcon"> (+0.46%)</small></p></dt> </dl></section><dl class="period related" data-id="3532706" data-sd="2022-06-17 10:32:57"> <dt>10:32 Today</dt> <dd>Merck considering acquisition of Seagen, WSJ reports</dd></dl><dl class="period related" data-id="3523532" data-sd="2022-05-31 06:18:19"> <dt> 05/31/22</dt> <dd>Pfizer&#039;s Paxlovid becomes leading pandemic pill, WSJ reports</dd></dl><dl class="period related" data-id="3520717" data-sd="2022-05-24 06:35:04"> <dt> 05/24/22</dt> <dd>COVID-19 vaccine, drug sales plateau, WSJ reports</dd></dl><dl class="period related" data-id="3499576" data-sd="2022-04-26 06:31:58"> <dt> 04/26/22</dt> <dd>Biden administration to make Covid pills more widely available, WSJ reports</dd></dl></div></div></div><div class='relTopic4' id='rel_4_tab'><div class='story_details_tabs'><ul><li><a href='#tab_rel_noti_4_1'><span>SGEN</span></a></li><li><a href='#tab_rel_noti_4_2'><span>MRK</span></a></li></ul><div class='div_tab' id='tab_rel_noti_4_1'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$152.27 / <p class="companyPrice gain">+5.61<small class="smallWithoutIcon"> (+3.83%)</small></p></dt> </dl></section><dl class="otf related" data-id="3457387" data-sd="2022-02-10 16:26:03"> <dt> 02/10/22</dt> <dd>Wall Street in Fives - Must Read Lists for Thursday</dd></dl><dl class="otf related" data-id="3457132" data-sd="2022-02-10 12:13:49"> <dt> 02/10/22</dt> <dd>Wall Street in Fives - Must Read Lists at Midday</dd></dl><dl class="otf related" data-id="3456468" data-sd="2022-02-09 18:36:25"> <dt> 02/09/22</dt> <dd>Fly Intel: After-Hours Movers</dd></dl></div><div class='div_tab' id='tab_rel_noti_4_2'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="MRK">MRK</span> <span class="infoCompany">Merck</span></section><section class="statsCompany"> <dl> <dt>$85.29 / <p class="companyPrice gain">+0.39<small class="smallWithoutIcon"> (+0.46%)</small></p></dt> </dl></section><dl class="otf related" data-id="3521146" data-sd="2022-05-24 12:29:43"> <dt> 05/24/22</dt> <dd>What You Missed On Wall Street This Morning</dd></dl><dl class="otf related" data-id="3502890" data-sd="2022-04-28 16:49:41"> <dt> 04/28/22</dt> <dd>What You Missed On Wall Street On Thursday</dd></dl><dl class="otf related" data-id="3502523" data-sd="2022-04-28 12:23:15"> <dt> 04/28/22</dt> <dd>What You Missed On Wall Street This Morning</dd></dl><dl class="otf related" data-id="3502329" data-sd="2022-04-28 09:09:08"> <dt> 04/28/22</dt> <dd>Fly Intel: Pre-market Movers</dd></dl></div></div></div><div class='evRelated' id='rel_ev_tab'><div class='related-evs'><div class="related-ev-wrapper"><dl class="ev_t_conference_calls eventDateCalendar"> <dt> 07/28/22</dt> <dd>Merck - MRK</dd></dl><div id="ev418759_8" class="muestraEvento eventoPagEventos" style="display: none; width:361; height:294; position: absolute;" data-id="418759" data-tipoEventoId="0"></div></div><div class="related-ev-wrapper"><dl class="ev_t_government_events eventDateCalendar"> <dt> 07/01/22</dt> <dd>Extended PDUFA Date for Vaxneuvance</dd></dl><div id="ev83261_9" class="muestraEvento eventoPagEventos" style="display: none; width:361; height:294; position: absolute;" data-id="83261" data-tipoEventoId="5"></div></div><div class="related-ev-wrapper"><dl class="ev_t_government_events eventDateCalendar"> <dt> 01/29/23</dt> <dd>PDUFA Date for new sBLA for KEYTRUDA</dd></dl><div id="ev83830_10" class="muestraEvento eventoPagEventos" style="display: none; width:361; height:294; position: absolute;" data-id="83830" data-tipoEventoId="5"></div></div><div class="related-ev-wrapper"><dl class="ev_t_company_events eventDateCalendar"> <dt> 10/04/22</dt> <dd>Merck</dd></dl><div id="ev221374_11" class="muestraEvento eventoPagEventos" style="display: none; width:361; height:294; position: absolute;" data-id="221374" data-tipoEventoId="2"></div></div></div></div><div class='relTopic5' id='rel_5_tab'><div class='story_details_tabs'><ul><li><a href='#tab_rel_noti_5_1'><span>MRK</span></a></li></ul><div class='div_tab' id='tab_rel_noti_5_1'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="MRK">MRK</span> <span class="infoCompany">Merck</span></section><section class="statsCompany"> <dl> <dt>$85.29 / <p class="companyPrice gain">+0.39<small class="smallWithoutIcon"> (+0.46%)</small></p></dt> </dl></section><dl class="opt related" data-id="3524591" data-sd="2022-06-01 10:15:03"> <dt> 06/01/22</dt> <dd>Merck put volume heavy and directionally bearish</dd></dl><dl class="opt related" data-id="3523878" data-sd="2022-05-31 11:15:03"> <dt> 05/31/22</dt> <dd>Merck put volume heavy and directionally bearish</dd></dl><dl class="opt related" data-id="3518180" data-sd="2022-05-18 11:35:03"> <dt> 05/18/22</dt> <dd>Merck put volume heavy and directionally bearish</dd></dl><dl class="opt related" data-id="3488171" data-sd="2022-04-04 08:00:03"> <dt> 04/04/22</dt> <dd>Merck call buyer realizes 64% same-day gains</dd></dl></div></div></div> </div></div> </td></tr><tr id="news_3532706_20220617103257" data-id="3532706" data-timeOffset="9" data-storytype="" data-topic="periodicals" data-datetime="20220617103257" data-unlockdate="2022-06-18 10:32:57" class="tr_noticia periodicals Periodicals  tr_noticia_prioridad " data-unlockdateUTC="1655562777" data-datenews="2022-06-17 10:32:57"> <td class="story_type">
<span class="icon_story_type periodicals" data-name="Periodicals">
<div class="fpo_overlay_ticker">Periodicals</div>
</span>
</td> <td><div class="story_header">
<a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3532706/SGEN;MRK-Merck-considering-acquisition-of-Seagen-WSJ-reports'><span class="importantHeadline"><span>Merck considering acquisition of Seagen, WSJ reports</span></span></a>&nbsp;
<span class="time_date">
<small class="timeType"><span class="fpo_overlay soloHora">10:32<div class="fpo_overlay_ticker">06/17/22</div></span><span class="fpo_overlay fecha">06/17<div class="fpo_overlay_ticker">10:32</div></span><span class="fpo_overlay fechaConAnio">06/17/22<div class="fpo_overlay_ticker">10:32</div></span></small>
</span> <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='SGEN'>SGEN<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Seagen</p></section><section class="statsCompany"> <dl> <dt>$152.27 / <p class="companyPrice gain">+5.61<small class="smallWithoutIcon"> (+3.83%)</small></p></dt> </dl></section></div></span>, <span class='ticker fpo_overlay' data-ticker='MRK'>MRK<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Merck</p></section><section class="statsCompany"> <dl> <dt>$85.29 / <p class="companyPrice gain">+0.39<small class="smallWithoutIcon"> (+0.46%)</small></p></dt> </dl></section></div></span></div>
</div><div class='newsContent'> <dd class="">&nbsp;</dd></div><div class='elementosRelacionadosWrapper  noMoreContent '> <div class='clickeable toggleRelated'> <span class='showWord'>Show</span><span class='hideWord'>Hide</span> Related Items&nbsp;<span class='showWord'>>></span><span class='hideWord'><<</span> </div> <div class='relatedContent'> <ul class='globalRelated'> <li class='linkRelTopic_1'> <a href='#rel_1_tab'>Company News</a></li> <li class='linkRelatedRecs'> <a href='#rel_rec_tab'>Street Research </a></li> <li class='linkRelTopic_2'> <a href='#rel_2_tab'>Earnings</a></li> <li class='linkRelTopic_3'> <a href='#rel_3_tab'>Periodicals</a></li> <li class='linkRelTopic_4'> <a href='#rel_4_tab'>On The Fly</a></li> <li class='linkRelatedEvents'> <a href='#rel_ev_tab'>Events </a></li> <li class='linkRelTopic_5'> <a href='#rel_5_tab'>Options</a></li></ul><div class='relTopic1' id='rel_1_tab'><div class='story_details_tabs'><ul><li><a href='#tab_rel_noti_1_1'><span>SGEN</span></a></li><li><a href='#tab_rel_noti_1_2'><span>MRK</span></a></li></ul><div class='div_tab' id='tab_rel_noti_1_1'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$152.27 / <p class="companyPrice gain">+5.61<small class="smallWithoutIcon"> (+3.83%)</small></p></dt> </dl></section><dl class="hot related" data-id="3532704" data-sd="2022-06-17 10:30:42"> <dt>10:30 Today</dt> <dd>Seattle Genetics trading halted, volatility trading pause</dd></dl><dl class="hot related" data-id="3526694" data-sd="2022-06-06 11:04:52"> <dt> 06/06/22</dt> <dd>Seagen, Genmab present data from tisotumab vedotin clinical development program</dd></dl><dl class="hot related" data-id="3526107" data-sd="2022-06-03 15:14:45"> <dt> 06/03/22</dt> <dd>Seagen says trial data show Adcetris, AVE-PC combo was well tolerated</dd></dl><dl class="hot related" data-id="3520202" data-sd="2022-05-23 08:36:48"> <dt> 05/23/22</dt> <dd>Seagen gives topline results of Phase 2 trial of tucatinib/trastuzumab combo</dd></dl></div><div class='div_tab' id='tab_rel_noti_1_2'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="MRK">MRK</span> <span class="infoCompany">Merck</span></section><section class="statsCompany"> <dl> <dt>$85.29 / <p class="companyPrice gain">+0.39<small class="smallWithoutIcon"> (+0.46%)</small></p></dt> </dl></section><dl class="hot related" data-id="3532585" data-sd="2022-06-17 08:03:08"> <dt>08:03 Today</dt> <dd>Codexis announces publication of research on bioconjugation of native peptides</dd></dl><dl class="hot related" data-id="3532272" data-sd="2022-06-16 15:30:14"> <dt> 06/16/22</dt> <dd>FTC says to ramp up enforcement against illegal drug rebate schemes</dd></dl><dl class="hot related" data-id="3529711" data-sd="2022-06-13 06:46:50"> <dt> 06/13/22</dt> <dd>Merck announces FDA approval of sBLA for KEYTRUDA</dd></dl><dl class="hot related" data-id="3527026" data-sd="2022-06-07 06:47:55"> <dt> 06/07/22</dt> <dd>Merck and Ridgeback announce additional data from Phase 3 MOVe-OUT trial</dd></dl></div></div></div><div id='rel_rec_tab'><div class='story_details_tabs'><ul><li><a href='#tab_1'><span>SGEN</span></a></li><li><a href='#tab_2'><span>MRK</span></a></li></ul><div class='div_tab' id='tab_1'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$152.27 / <p class="companyPrice gain">+5.61<small class="smallWithoutIcon"> (+3.83%)</small></p></dt> </dl></section><section class="recsCompany"><dl class="no_change relatedRec" data-id="3491492" data-sd="2022-04-08 14:46:24"> <dt> 04/08/22 Roth Capital</dt> <dd>Bicycle reported &#039;very strong&#039; side-effect profile, says Roth Capital</dd></dl><dl class="no_change relatedRec" data-id="3491490" data-sd="2022-04-08 14:40:24"> <dt> 04/08/22 Cantor Fitzgerald</dt> <dd>Bicycle Therapeutics&#039; BT8009 abstract &#039;very positive,&#039; says Cantor Fitzgerald</dd></dl><dl class="no_change relatedRec" data-id="3465922" data-sd="2022-02-24 11:04:16"> <dt> 02/24/22 Piper Sandler</dt> <dd>Seagen&#039;s tisotumab vedotin shows &#039;modest signal of activity,&#039; says Piper Sandler</dd></dl><dl class="no_change relatedRec" data-id="3460254" data-sd="2022-02-16 07:24:58"> <dt> 02/16/22 JMP Securities</dt> <dd>Seagen price target lowered to $142 from $201 at JMP Securities</dd></dl></div></section><div class='div_tab' id='tab_2'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="MRK">MRK</span> <span class="infoCompany">Merck</span></section><section class="statsCompany"> <dl> <dt>$85.29 / <p class="companyPrice gain">+0.39<small class="smallWithoutIcon"> (+0.46%)</small></p></dt> </dl></section><section class="recsCompany"><dl class="no_change relatedRec" data-id="3492541" data-sd="2022-04-12 07:12:50"> <dt> 04/12/22 Barclays</dt> <dd>Merck price target raised to $97 from $94 at Barclays</dd></dl><dl class="no_change relatedRec" data-id="3491720" data-sd="2022-04-11 06:42:59"> <dt> 04/11/22 H.C. Wainwright</dt> <dd>Rubius Therapeutics price target lowered to $15 from $40 at H.C. Wainwright</dd></dl><dl class="initiate relatedRec" data-id="3489662" data-sd="2022-04-06 07:35:29"> <dt> 04/06/22 Morgan Stanley</dt> <dd>Merck assumed with an Equal Weight at Morgan Stanley</dd></dl><dl class="no_change relatedRec" data-id="3489294" data-sd="2022-04-05 14:55:00"> <dt> 04/05/22 BMO Capital</dt> <dd>Merck targets &#039;ambitious&#039; $10B revenue from cardiovascular franchise, says BMO</dd></dl></div></section></div></div><div class='relTopic2' id='rel_2_tab'><div class='story_details_tabs'><ul><li><a href='#tab_rel_noti_2_1'><span>SGEN</span></a></li><li><a href='#tab_rel_noti_2_2'><span>MRK</span></a></li></ul><div class='div_tab' id='tab_rel_noti_2_1'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$152.27 / <p class="companyPrice gain">+5.61<small class="smallWithoutIcon"> (+3.83%)</small></p></dt> </dl></section><dl class="ear related" data-id="3502681" data-sd="2022-04-28 16:06:56"> <dt> 04/28/22</dt> <dd>Seagen sees FY22 total revenue $1.665B-$1.745B, consensus $1.78B</dd></dl><dl class="ear related" data-id="3502676" data-sd="2022-04-28 16:06:05"> <dt> 04/28/22</dt> <dd>Seagen reports Q1 EPS (74c), consensus ($1.00)</dd></dl><dl class="ear related" data-id="3456759" data-sd="2022-02-10 07:29:32"> <dt> 02/10/22</dt> <dd>Seagen sees FY22 total revenue $1.67B-$1.75B, consensus $2.16B</dd></dl><dl class="ear related" data-id="3456235" data-sd="2022-02-09 16:03:20"> <dt> 02/09/22</dt> <dd>Seagen reports Q4 EPS (95c), consensus (83c)</dd></dl></div><div class='div_tab' id='tab_rel_noti_2_2'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="MRK">MRK</span> <span class="infoCompany">Merck</span></section><section class="statsCompany"> <dl> <dt>$85.29 / <p class="companyPrice gain">+0.39<small class="smallWithoutIcon"> (+0.46%)</small></p></dt> </dl></section><dl class="ear related" data-id="3501783" data-sd="2022-04-28 06:34:23"> <dt> 04/28/22</dt> <dd>Merck raises FY22 adjusted EPS view to $7.24-$7.36, consensus $7.24</dd></dl><dl class="ear related" data-id="3501774" data-sd="2022-04-28 06:30:33"> <dt> 04/28/22</dt> <dd>Merck reports Q1 adjusted EPS $2.14, consensus $1.83</dd></dl><dl class="ear related" data-id="3501224" data-sd="2022-04-27 20:25:00"> <dt> 04/27/22</dt> <dd>Notable companies reporting before tomorrow&#039;s open</dd></dl><dl class="ear related" data-id="3501224" data-sd="2022-04-27 13:38:15"> <dt> 04/27/22</dt> <dd>Notable companies reporting before tomorrow&#039;s open</dd></dl></div></div></div><div class='relTopic3' id='rel_3_tab'><div class='story_details_tabs'><ul><li><a href='#tab_rel_noti_3_1'><span>MRK</span></a></li></ul><div class='div_tab' id='tab_rel_noti_3_1'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="MRK">MRK</span> <span class="infoCompany">Merck</span></section><section class="statsCompany"> <dl> <dt>$85.29 / <p class="companyPrice gain">+0.39<small class="smallWithoutIcon"> (+0.46%)</small></p></dt> </dl></section><dl class="period related" data-id="3523532" data-sd="2022-05-31 06:18:19"> <dt> 05/31/22</dt> <dd>Pfizer&#039;s Paxlovid becomes leading pandemic pill, WSJ reports</dd></dl><dl class="period related" data-id="3520717" data-sd="2022-05-24 06:35:04"> <dt> 05/24/22</dt> <dd>COVID-19 vaccine, drug sales plateau, WSJ reports</dd></dl><dl class="period related" data-id="3499576" data-sd="2022-04-26 06:31:58"> <dt> 04/26/22</dt> <dd>Biden administration to make Covid pills more widely available, WSJ reports</dd></dl><dl class="period related" data-id="3498547" data-sd="2022-04-23 10:35:12"> <dt> 04/23/22</dt> <dd>Merck, CVS among dividend stocks to help whip inflation now, Barron&#039;s says</dd></dl></div></div></div><div class='relTopic4' id='rel_4_tab'><div class='story_details_tabs'><ul><li><a href='#tab_rel_noti_4_1'><span>SGEN</span></a></li><li><a href='#tab_rel_noti_4_2'><span>MRK</span></a></li></ul><div class='div_tab' id='tab_rel_noti_4_1'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$152.27 / <p class="companyPrice gain">+5.61<small class="smallWithoutIcon"> (+3.83%)</small></p></dt> </dl></section><dl class="otf related" data-id="3457387" data-sd="2022-02-10 16:26:03"> <dt> 02/10/22</dt> <dd>Wall Street in Fives - Must Read Lists for Thursday</dd></dl><dl class="otf related" data-id="3457132" data-sd="2022-02-10 12:13:49"> <dt> 02/10/22</dt> <dd>Wall Street in Fives - Must Read Lists at Midday</dd></dl><dl class="otf related" data-id="3456468" data-sd="2022-02-09 18:36:25"> <dt> 02/09/22</dt> <dd>Fly Intel: After-Hours Movers</dd></dl></div><div class='div_tab' id='tab_rel_noti_4_2'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="MRK">MRK</span> <span class="infoCompany">Merck</span></section><section class="statsCompany"> <dl> <dt>$85.29 / <p class="companyPrice gain">+0.39<small class="smallWithoutIcon"> (+0.46%)</small></p></dt> </dl></section><dl class="otf related" data-id="3521146" data-sd="2022-05-24 12:29:43"> <dt> 05/24/22</dt> <dd>What You Missed On Wall Street This Morning</dd></dl><dl class="otf related" data-id="3502890" data-sd="2022-04-28 16:49:41"> <dt> 04/28/22</dt> <dd>What You Missed On Wall Street On Thursday</dd></dl><dl class="otf related" data-id="3502523" data-sd="2022-04-28 12:23:15"> <dt> 04/28/22</dt> <dd>What You Missed On Wall Street This Morning</dd></dl><dl class="otf related" data-id="3502329" data-sd="2022-04-28 09:09:08"> <dt> 04/28/22</dt> <dd>Fly Intel: Pre-market Movers</dd></dl></div></div></div><div class='evRelated' id='rel_ev_tab'><div class='related-evs'><div class="related-ev-wrapper"><dl class="ev_t_conference_calls eventDateCalendar"> <dt> 07/28/22</dt> <dd>Merck - MRK</dd></dl><div id="ev418759_8" class="muestraEvento eventoPagEventos" style="display: none; width:361; height:294; position: absolute;" data-id="418759" data-tipoEventoId="0"></div></div><div class="related-ev-wrapper"><dl class="ev_t_government_events eventDateCalendar"> <dt> 07/01/22</dt> <dd>Extended PDUFA Date for Vaxneuvance</dd></dl><div id="ev83261_9" class="muestraEvento eventoPagEventos" style="display: none; width:361; height:294; position: absolute;" data-id="83261" data-tipoEventoId="5"></div></div><div class="related-ev-wrapper"><dl class="ev_t_government_events eventDateCalendar"> <dt> 01/29/23</dt> <dd>PDUFA Date for new sBLA for KEYTRUDA</dd></dl><div id="ev83830_10" class="muestraEvento eventoPagEventos" style="display: none; width:361; height:294; position: absolute;" data-id="83830" data-tipoEventoId="5"></div></div><div class="related-ev-wrapper"><dl class="ev_t_company_events eventDateCalendar"> <dt> 10/04/22</dt> <dd>Merck</dd></dl><div id="ev221374_11" class="muestraEvento eventoPagEventos" style="display: none; width:361; height:294; position: absolute;" data-id="221374" data-tipoEventoId="2"></div></div></div></div><div class='relTopic5' id='rel_5_tab'><div class='story_details_tabs'><ul><li><a href='#tab_rel_noti_5_1'><span>MRK</span></a></li></ul><div class='div_tab' id='tab_rel_noti_5_1'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="MRK">MRK</span> <span class="infoCompany">Merck</span></section><section class="statsCompany"> <dl> <dt>$85.29 / <p class="companyPrice gain">+0.39<small class="smallWithoutIcon"> (+0.46%)</small></p></dt> </dl></section><dl class="opt related" data-id="3524591" data-sd="2022-06-01 10:15:03"> <dt> 06/01/22</dt> <dd>Merck put volume heavy and directionally bearish</dd></dl><dl class="opt related" data-id="3523878" data-sd="2022-05-31 11:15:03"> <dt> 05/31/22</dt> <dd>Merck put volume heavy and directionally bearish</dd></dl><dl class="opt related" data-id="3518180" data-sd="2022-05-18 11:35:03"> <dt> 05/18/22</dt> <dd>Merck put volume heavy and directionally bearish</dd></dl><dl class="opt related" data-id="3488171" data-sd="2022-04-04 08:00:03"> <dt> 04/04/22</dt> <dd>Merck call buyer realizes 64% same-day gains</dd></dl></div></div></div> </div></div> </td></tr><tr id="news_3532705_20220617103127" data-id="3532705" data-timeOffset="9" data-storytype="" data-topic="technical_analysis" data-datetime="20220617103127" data-unlockdate="2022-06-17 10:41:27" class="tr_noticia technical_analysis Technical Analysis " data-unlockdateUTC="1655476887" data-datenews="2022-06-17 10:31:27"> <td class="story_type">
<span class="icon_story_type technical_analysis" data-name="Technical Analysis">
<div class="fpo_overlay_ticker">Technical Analysis</div>
</span>
</td> <td><div class="story_header">
<a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3532705/$DJT-DJ-Transportation-Average-Pivot-points'><span>DJ Transportation Average: Pivot points</span></a>&nbsp;<span class='flechitaflechita'>»</span>
<span class="time_date">
<small class="timeType"><span class="fpo_overlay soloHora">10:31<div class="fpo_overlay_ticker">06/17/22</div></span><span class="fpo_overlay fecha">06/17<div class="fpo_overlay_ticker">10:31</div></span><span class="fpo_overlay fechaConAnio">06/17/22<div class="fpo_overlay_ticker">10:31</div></span></small>
</span> <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='$DJT'>$DJT<div class="fpo_overlay_img overlayNotWide"><section class="infoCompany"><p class="infoCompany">DJ Transportation Average</p></section><section class="statsCompany"> <dl> <dt> / <p class="companyPrice gain">+</p></dt> </dl></section></div></span></div>
</div><div class='newsContent'><dd class='clickeable blocked'>
<p class='abstract'>The following are the&hellip; <div class="candado"><div id="free_promo"><p class="open_free_trial"><strong>Story temporarily locked.</strong><br>To read stories as they happen please subscribe, Login above, or return <span class='tiempo_faltante'> in 9 minutes</span></p><a href="#" class="button gold open_free_trial">Get Free Trial</a></div></div></p></dd></div><div class='elementosRelacionadosWrapper '> <div class='clickeable toggleRelated'> <span class='showWord'>Show</span><span class='hideWord'>Hide</span> Related Items&nbsp;<span class='showWord'>>></span><span class='hideWord'><<</span> </div> <div class='relatedContent'> <ul class='globalRelated'> <li class='linkRelTopic_1'> <a href='#rel_1_tab'>Company News</a></li> <li class='linkRelTopic_2'> <a href='#rel_2_tab'>Technical Analysis</a></li></ul><div class='relTopic1' id='rel_1_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="$DJT">$DJT</span> <span class="infoCompany">DJ Transportation Average</span></section><section class="statsCompany"> <dl> <dt> / <p class="companyPrice gain">+</p></dt> </dl></section><section class='recsCompany'><dl class="hot related" data-id="3527467" data-sd="2022-06-07 13:55:25"> <dt> 06/07/22</dt> <dd>Global growth to fall to 2.9% in 2022 from 5.7% in 2021, World Bank says</dd></dl></section></div><div class='relTopic2' id='rel_2_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="$DJT">$DJT</span> <span class="infoCompany">DJ Transportation Average</span></section><section class="statsCompany"> <dl> <dt> / <p class="companyPrice gain">+</p></dt> </dl></section><section class='recsCompany'><dl class="tech related" data-id="3532117" data-sd="2022-06-16 10:31:49"> <dt> 06/16/22</dt> <dd>DJ Transportation Average: Pivot points</dd></dl><dl class="tech related" data-id="3531425" data-sd="2022-06-15 10:30:29"> <dt> 06/15/22</dt> <dd>DJ Transportation Average: Pivot points</dd></dl><dl class="tech related" data-id="3530681" data-sd="2022-06-14 10:30:42"> <dt> 06/14/22</dt> <dd>DJ Transportation Average: Pivot points</dd></dl><dl class="tech related" data-id="3530002" data-sd="2022-06-13 10:30:22"> <dt> 06/13/22</dt> <dd>DJ Transportation Average: Pivot points</dd></dl></section></div> </div></div> </td></tr>
</tbody>
</table><div class='ad_wrapper wrapper_ad_entre_noticias'><div id='ic_728x90_2' class='ad_individual_entre_noticia ad_AdInvestigatingChannelLeaderboard'></div></div>
<table class="today news_table first_table">
<tbody>
<tr id="news_3532704_20220617103042" data-id="3532704" data-timeOffset="9" data-storytype="" data-topic="hot_stocks" data-datetime="20220617103042" data-unlockdate="2022-06-18 10:30:42" class="tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1655562642" data-datenews="2022-06-17 10:30:42"> <td class="story_type">
<span class="icon_story_type hot_stocks" data-name="Hot Stocks">
<div class="fpo_overlay_ticker">Hot Stocks</div>
</span>
</td> <td><div class="story_header">
<a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3532704/SGEN-Seattle-Genetics-trading-halted-volatility-trading-pause'><span>Seattle Genetics trading halted, volatility trading pause</span></a>&nbsp;
<span class="time_date">
<small class="timeType"><span class="fpo_overlay soloHora">10:30<div class="fpo_overlay_ticker">06/17/22</div></span><span class="fpo_overlay fecha">06/17<div class="fpo_overlay_ticker">10:30</div></span><span class="fpo_overlay fechaConAnio">06/17/22<div class="fpo_overlay_ticker">10:30</div></span></small>
</span> <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='SGEN'>SGEN<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Seagen</p></section><section class="statsCompany"> <dl> <dt>$153.02 / <p class="companyPrice gain">+6.36<small class="smallWithoutIcon"> (+4.34%)</small></p></dt> </dl></section></div></span></div>
</div><div class='newsContent'> <dd class="">&nbsp;</dd></div><div class='elementosRelacionadosWrapper  noMoreContent '> <div class='clickeable toggleRelated'> <span class='showWord'>Show</span><span class='hideWord'>Hide</span> Related Items&nbsp;<span class='showWord'>>></span><span class='hideWord'><<</span> </div> <div class='relatedContent'> <ul class='globalRelated'> <li class='linkRelTopic_1'> <a href='#rel_1_tab'>Company News</a></li> <li class='linkRelatedRecs'> <a href='#rel_rec_tab'>Street Research </a></li> <li class='linkRelTopic_2'> <a href='#rel_2_tab'>Earnings</a></li> <li class='linkRelTopic_3'> <a href='#rel_3_tab'>On The Fly</a></li></ul><div class='relTopic1' id='rel_1_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$153.02 / <p class="companyPrice gain">+6.36<small class="smallWithoutIcon"> (+4.34%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="hot related" data-id="3526694" data-sd="2022-06-06 11:04:52"> <dt> 06/06/22</dt> <dd>Seagen, Genmab present data from tisotumab vedotin clinical development program</dd></dl><dl class="hot related" data-id="3526107" data-sd="2022-06-03 15:14:45"> <dt> 06/03/22</dt> <dd>Seagen says trial data show Adcetris, AVE-PC combo was well tolerated</dd></dl><dl class="hot related" data-id="3520202" data-sd="2022-05-23 08:36:48"> <dt> 05/23/22</dt> <dd>Seagen gives topline results of Phase 2 trial of tucatinib/trastuzumab combo</dd></dl><dl class="hot related" data-id="3515836" data-sd="2022-05-16 06:04:39"> <dt> 05/16/22</dt> <dd>Seagen CEO Clay Siegall resigns, Roger Dansey to continue as interim CEO</dd></dl></section></div><div id='rel_rec_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$153.02 / <p class="companyPrice gain">+6.36<small class="smallWithoutIcon"> (+4.34%)</small></p></dt> </dl></section><section class="recsCompany"><dl class="no_change relatedRec" data-id="3491492" data-sd="2022-04-08 14:46:24"> <dt> 04/08/22 Roth Capital</dt> <dd>Bicycle reported &#039;very strong&#039; side-effect profile, says Roth Capital</dd></dl><dl class="no_change relatedRec" data-id="3491490" data-sd="2022-04-08 14:40:24"> <dt> 04/08/22 Cantor Fitzgerald</dt> <dd>Bicycle Therapeutics&#039; BT8009 abstract &#039;very positive,&#039; says Cantor Fitzgerald</dd></dl><dl class="no_change relatedRec" data-id="3465922" data-sd="2022-02-24 11:04:16"> <dt> 02/24/22 Piper Sandler</dt> <dd>Seagen&#039;s tisotumab vedotin shows &#039;modest signal of activity,&#039; says Piper Sandler</dd></dl><dl class="no_change relatedRec" data-id="3460254" data-sd="2022-02-16 07:24:58"> <dt> 02/16/22 JMP Securities</dt> <dd>Seagen price target lowered to $142 from $201 at JMP Securities</dd></dl></div><div class='relTopic2' id='rel_2_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$153.02 / <p class="companyPrice gain">+6.36<small class="smallWithoutIcon"> (+4.34%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="ear related" data-id="3502681" data-sd="2022-04-28 16:06:56"> <dt> 04/28/22</dt> <dd>Seagen sees FY22 total revenue $1.665B-$1.745B, consensus $1.78B</dd></dl><dl class="ear related" data-id="3502676" data-sd="2022-04-28 16:06:05"> <dt> 04/28/22</dt> <dd>Seagen reports Q1 EPS (74c), consensus ($1.00)</dd></dl><dl class="ear related" data-id="3456759" data-sd="2022-02-10 07:29:32"> <dt> 02/10/22</dt> <dd>Seagen sees FY22 total revenue $1.67B-$1.75B, consensus $2.16B</dd></dl><dl class="ear related" data-id="3456235" data-sd="2022-02-09 16:03:20"> <dt> 02/09/22</dt> <dd>Seagen reports Q4 EPS (95c), consensus (83c)</dd></dl></section></div><div class='relTopic3' id='rel_3_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="SGEN">SGEN</span> <span class="infoCompany">Seagen</span></section><section class="statsCompany"> <dl> <dt>$153.02 / <p class="companyPrice gain">+6.36<small class="smallWithoutIcon"> (+4.34%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="otf related" data-id="3457387" data-sd="2022-02-10 16:26:03"> <dt> 02/10/22</dt> <dd>Wall Street in Fives - Must Read Lists for Thursday</dd></dl><dl class="otf related" data-id="3457132" data-sd="2022-02-10 12:13:49"> <dt> 02/10/22</dt> <dd>Wall Street in Fives - Must Read Lists at Midday</dd></dl><dl class="otf related" data-id="3456468" data-sd="2022-02-09 18:36:25"> <dt> 02/09/22</dt> <dd>Fly Intel: After-Hours Movers</dd></dl></section></div> </div></div> </td></tr><tr id="news_3532703_20220617103004" data-id="3532703" data-timeOffset="9" data-storytype="" data-topic="general_news" data-datetime="20220617103004" data-unlockdate="2022-06-17 10:40:04" class="tr_noticia general_news General news " data-unlockdateUTC="1655476804" data-datenews="2022-06-17 10:30:04"> <td class="story_type">
<span class="icon_story_type general_news" data-name="General news">
<div class="fpo_overlay_ticker">General news</div>
</span>
</td> <td><div class="story_header">
<a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3532703/$ECON-European-Fixed-Income-Summary'><span>European Fixed Income Summary:</span></a>&nbsp;<span class='flechitaflechita'>»</span>
<span class="time_date">
<small class="timeType"><span class="fpo_overlay soloHora">10:30<div class="fpo_overlay_ticker">06/17/22</div></span><span class="fpo_overlay fecha">06/17<div class="fpo_overlay_ticker">10:30</div></span><span class="fpo_overlay fechaConAnio">06/17/22<div class="fpo_overlay_ticker">10:30</div></span></small>
</span> <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='$ECON'>$ECON<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Economic Data</p></section><section class="statsCompany"> <dl> <dt> / <p class="companyPrice gain">+</p></dt> </dl></section></div></span></div>
</div><div class='newsContent'><dd class='clickeable blocked'>
<p class='abstract'>European Fixed Income&hellip; <div class="candado"><div id="free_promo"><p class="open_free_trial"><strong>Story temporarily locked.</strong><br>To read stories as they happen please subscribe, Login above, or return <span class='tiempo_faltante'> in 9 minutes</span></p><a href="#" class="button gold open_free_trial">Get Free Trial</a></div></div></p></dd></div><div class='elementosRelacionadosWrapper '> <div class='clickeable toggleRelated'> <span class='showWord'>Show</span><span class='hideWord'>Hide</span> Related Items&nbsp;<span class='showWord'>>></span><span class='hideWord'><<</span> </div> <div class='relatedContent'> <ul class='globalRelated'> <li class='linkRelTopic_1'> <a href='#rel_1_tab'>Company News</a></li> <li class='linkRelatedRecs'> <a href='#rel_rec_tab'>Street Research </a></li> <li class='linkRelTopic_2'> <a href='#rel_2_tab'>Earnings</a></li> <li class='linkRelTopic_3'> <a href='#rel_3_tab'>Periodicals</a></li> <li class='linkRelTopic_4'> <a href='#rel_4_tab'>On The Fly</a></li></ul><div class='relTopic1' id='rel_1_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="$ECON">$ECON</span> <span class="infoCompany">Economic Data</span></section><section class="statsCompany"> <dl> <dt> / <p class="companyPrice gain">+</p></dt> </dl></section><section class='recsCompany'><dl class="hot related" data-id="3518967" data-sd="2022-05-19 11:04:04"> <dt> 05/19/22</dt> <dd>Could crypto crash be good for U.S. economy? Probably.</dd></dl><dl class="hot related" data-id="3514629" data-sd="2022-05-12 13:16:36"> <dt> 05/12/22</dt> <dd>Miller calls out Taylor Morrison, GM as names that may work in this environment</dd></dl><dl class="hot related" data-id="3497670" data-sd="2022-04-21 13:25:57"> <dt> 04/21/22</dt> <dd>Powell says 50 basis point hike on table for May meeting</dd></dl><dl class="hot related" data-id="3458072" data-sd="2022-02-11 12:59:13"> <dt> 02/11/22</dt> <dd>Gundlach thinks 10-year note yield can &#039;make a move toward 2.50&#039;</dd></dl></section></div><div id='rel_rec_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="$ECON">$ECON</span> <span class="infoCompany">Economic Data</span></section><section class="statsCompany"> <dl> <dt> / <p class="companyPrice gain">+</p></dt> </dl></section><section class="recsCompany"></div><div class='relTopic2' id='rel_2_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="$ECON">$ECON</span> <span class="infoCompany">Economic Data</span></section><section class="statsCompany"> <dl> <dt> / <p class="companyPrice gain">+</p></dt> </dl></section><section class='recsCompany'><dl class="ear related" data-id="3530836" data-sd="2022-06-14 15:50:37"> <dt> 06/14/22</dt> <dd>Ackman says 100 point hike tomorrow &#039;would be better&#039; than 75</dd></dl><dl class="ear related" data-id="3458062" data-sd="2022-02-11 12:43:26"> <dt> 02/11/22</dt> <dd>Gundlach sees five interest rate raises in 2022</dd></dl></section></div><div class='relTopic3' id='rel_3_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="$ECON">$ECON</span> <span class="infoCompany">Economic Data</span></section><section class="statsCompany"> <dl> <dt> / <p class="companyPrice gain">+</p></dt> </dl></section><section class='recsCompany'><dl class="period related" data-id="3530132" data-sd="2022-06-13 16:04:55"> <dt> 06/13/22</dt> <dd>Fed more likely to consider 0.75 point hike given recent data, WSJ says</dd></dl><dl class="period related" data-id="3511869" data-sd="2022-05-10 09:24:47"> <dt> 05/10/22</dt> <dd>Tepper says covered Nasdaq short, CNBC reports</dd></dl><dl class="period related" data-id="3474674" data-sd="2022-03-09 13:51:23"> <dt> 03/09/22</dt> <dd>U.S. funding bill hits snag over COVID-relief money, WSJ reports</dd></dl><dl class="period related" data-id="3462712" data-sd="2022-02-18 12:43:40"> <dt> 02/18/22</dt> <dd>U.S. officials see Russian invasion of Ukraine as &#039;imminent,&#039; WSJ says</dd></dl></section></div><div class='relTopic4' id='rel_4_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="$ECON">$ECON</span> <span class="infoCompany">Economic Data</span></section><section class="statsCompany"> <dl> <dt> / <p class="companyPrice gain">+</p></dt> </dl></section><section class='recsCompany'><dl class="otf related" data-id="3531632" data-sd="2022-06-15 16:23:54"> <dt> 06/15/22</dt> <dd>What You Missed On Wall Street On Wednesday</dd></dl><dl class="otf related" data-id="3514908" data-sd="2022-05-12 16:37:26"> <dt> 05/12/22</dt> <dd>What You Missed On Wall Street On Thursday</dd></dl><dl class="otf related" data-id="3507290" data-sd="2022-05-04 16:48:57"> <dt> 05/04/22</dt> <dd>What You Missed On Wall Street On Wednesday</dd></dl><dl class="otf related" data-id="3496921" data-sd="2022-04-20 16:25:36"> <dt> 04/20/22</dt> <dd>What You Missed On Wall Street On Wednesday</dd></dl></section></div> </div></div> </td></tr><tr id="news_3532702_20220617103002" data-id="3532702" data-timeOffset="9" data-storytype="" data-topic="general_news" data-datetime="20220617103002" data-unlockdate="2022-06-18 10:30:02" class="tr_noticia general_news General news " data-unlockdateUTC="1655562602" data-datenews="2022-06-17 10:30:02"> <td class="story_type">
<span class="icon_story_type general_news" data-name="General news">
<div class="fpo_overlay_ticker">General news</div>
</span>
</td> <td><div class="story_header">
<a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3532702/$ECON-Feds-George-explained-her-dissent-for-a--bp-hike'><span>Fed&#039;s George explained her dissent for a 50 bp hike</span></a>&nbsp;<span class='flechitaflechita'>»</span>
<span class="time_date">
<small class="timeType"><span class="fpo_overlay soloHora">10:30<div class="fpo_overlay_ticker">06/17/22</div></span><span class="fpo_overlay fecha">06/17<div class="fpo_overlay_ticker">10:30</div></span><span class="fpo_overlay fechaConAnio">06/17/22<div class="fpo_overlay_ticker">10:30</div></span></small>
</span> <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='$ECON'>$ECON<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Economic Data</p></section><section class="statsCompany"> <dl> <dt> / <p class="companyPrice gain">+</p></dt> </dl></section></div></span></div>
</div><div class='newsContent'><dd class='clickeable blocked'>
<p class='abstract'>Fed&#039;s George&hellip; <div class="candado"><div id="free_promo"><p class="open_free_trial"><strong>Story temporarily locked.</strong><br>To read stories as they happen please subscribe, Login above, or return <span class='tiempo_faltante'>tomorrow</span></p><a href="#" class="button gold open_free_trial">Get Free Trial</a></div></div></p></dd></div><div class='elementosRelacionadosWrapper '> <div class='clickeable toggleRelated'> <span class='showWord'>Show</span><span class='hideWord'>Hide</span> Related Items&nbsp;<span class='showWord'>>></span><span class='hideWord'><<</span> </div> <div class='relatedContent'> <ul class='globalRelated'> <li class='linkRelTopic_1'> <a href='#rel_1_tab'>Company News</a></li> <li class='linkRelatedRecs'> <a href='#rel_rec_tab'>Street Research </a></li> <li class='linkRelTopic_2'> <a href='#rel_2_tab'>Earnings</a></li> <li class='linkRelTopic_3'> <a href='#rel_3_tab'>Periodicals</a></li> <li class='linkRelTopic_4'> <a href='#rel_4_tab'>On The Fly</a></li></ul><div class='relTopic1' id='rel_1_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="$ECON">$ECON</span> <span class="infoCompany">Economic Data</span></section><section class="statsCompany"> <dl> <dt> / <p class="companyPrice gain">+</p></dt> </dl></section><section class='recsCompany'><dl class="hot related" data-id="3518967" data-sd="2022-05-19 11:04:04"> <dt> 05/19/22</dt> <dd>Could crypto crash be good for U.S. economy? Probably.</dd></dl><dl class="hot related" data-id="3514629" data-sd="2022-05-12 13:16:36"> <dt> 05/12/22</dt> <dd>Miller calls out Taylor Morrison, GM as names that may work in this environment</dd></dl><dl class="hot related" data-id="3497670" data-sd="2022-04-21 13:25:57"> <dt> 04/21/22</dt> <dd>Powell says 50 basis point hike on table for May meeting</dd></dl><dl class="hot related" data-id="3458072" data-sd="2022-02-11 12:59:13"> <dt> 02/11/22</dt> <dd>Gundlach thinks 10-year note yield can &#039;make a move toward 2.50&#039;</dd></dl></section></div><div id='rel_rec_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="$ECON">$ECON</span> <span class="infoCompany">Economic Data</span></section><section class="statsCompany"> <dl> <dt> / <p class="companyPrice gain">+</p></dt> </dl></section><section class="recsCompany"></div><div class='relTopic2' id='rel_2_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="$ECON">$ECON</span> <span class="infoCompany">Economic Data</span></section><section class="statsCompany"> <dl> <dt> / <p class="companyPrice gain">+</p></dt> </dl></section><section class='recsCompany'><dl class="ear related" data-id="3530836" data-sd="2022-06-14 15:50:37"> <dt> 06/14/22</dt> <dd>Ackman says 100 point hike tomorrow &#039;would be better&#039; than 75</dd></dl><dl class="ear related" data-id="3458062" data-sd="2022-02-11 12:43:26"> <dt> 02/11/22</dt> <dd>Gundlach sees five interest rate raises in 2022</dd></dl></section></div><div class='relTopic3' id='rel_3_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="$ECON">$ECON</span> <span class="infoCompany">Economic Data</span></section><section class="statsCompany"> <dl> <dt> / <p class="companyPrice gain">+</p></dt> </dl></section><section class='recsCompany'><dl class="period related" data-id="3530132" data-sd="2022-06-13 16:04:55"> <dt> 06/13/22</dt> <dd>Fed more likely to consider 0.75 point hike given recent data, WSJ says</dd></dl><dl class="period related" data-id="3511869" data-sd="2022-05-10 09:24:47"> <dt> 05/10/22</dt> <dd>Tepper says covered Nasdaq short, CNBC reports</dd></dl><dl class="period related" data-id="3474674" data-sd="2022-03-09 13:51:23"> <dt> 03/09/22</dt> <dd>U.S. funding bill hits snag over COVID-relief money, WSJ reports</dd></dl><dl class="period related" data-id="3462712" data-sd="2022-02-18 12:43:40"> <dt> 02/18/22</dt> <dd>U.S. officials see Russian invasion of Ukraine as &#039;imminent,&#039; WSJ says</dd></dl></section></div><div class='relTopic4' id='rel_4_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="$ECON">$ECON</span> <span class="infoCompany">Economic Data</span></section><section class="statsCompany"> <dl> <dt> / <p class="companyPrice gain">+</p></dt> </dl></section><section class='recsCompany'><dl class="otf related" data-id="3531632" data-sd="2022-06-15 16:23:54"> <dt> 06/15/22</dt> <dd>What You Missed On Wall Street On Wednesday</dd></dl><dl class="otf related" data-id="3514908" data-sd="2022-05-12 16:37:26"> <dt> 05/12/22</dt> <dd>What You Missed On Wall Street On Thursday</dd></dl><dl class="otf related" data-id="3507290" data-sd="2022-05-04 16:48:57"> <dt> 05/04/22</dt> <dd>What You Missed On Wall Street On Wednesday</dd></dl><dl class="otf related" data-id="3496921" data-sd="2022-04-20 16:25:36"> <dt> 04/20/22</dt> <dd>What You Missed On Wall Street On Wednesday</dd></dl></section></div> </div></div> </td></tr><tr id="news_3532701_20220617102720" data-id="3532701" data-timeOffset="8" data-storytype="" data-topic="hot_stocks" data-datetime="20220617102720" data-unlockdate="2022-06-17 10:37:20" class="tr_noticia hot_stocks Hot Stocks " data-unlockdateUTC="1655476640" data-datenews="2022-06-17 10:27:20"> <td class="story_type">
<span class="icon_story_type hot_stocks" data-name="Hot Stocks">
<div class="fpo_overlay_ticker">Hot Stocks</div>
</span>
</td> <td><div class="story_header">
<a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3532701/FERG-Ferguson-up--following-mention-of-rumor-in-Betaville'><span>Ferguson up 4% following mention of rumor in Betaville</span></a>&nbsp;<span class='flechitaflechita'>»</span>
<span class="time_date">
<small class="timeType"><span class="fpo_overlay soloHora">10:27<div class="fpo_overlay_ticker">06/17/22</div></span><span class="fpo_overlay fecha">06/17<div class="fpo_overlay_ticker">10:27</div></span><span class="fpo_overlay fechaConAnio">06/17/22<div class="fpo_overlay_ticker">10:27</div></span></small>
</span> <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='FERG'>FERG<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">Ferguson</p></section><section class="statsCompany"> <dl> <dt>$109.50 / <p class="companyPrice gain">+3.55<small class="smallWithoutIcon"> (+3.35%)</small></p></dt> </dl></section></div></span></div>
</div><div class='newsContent'><dd class='clickeable blocked'>
<p class='abstract'>A rumor related to&hellip; <div class="candado"><div id="free_promo"><p class="open_free_trial"><strong>Story temporarily locked.</strong><br>To read stories as they happen please subscribe, Login above, or return <span class='tiempo_faltante'> in 9 minutes</span></p><a href="#" class="button gold open_free_trial">Get Free Trial</a></div></div></p></dd></div><div class='elementosRelacionadosWrapper '> <div class='clickeable toggleRelated'> <span class='showWord'>Show</span><span class='hideWord'>Hide</span> Related Items&nbsp;<span class='showWord'>>></span><span class='hideWord'><<</span> </div> <div class='relatedContent'> <ul class='globalRelated'> <li class='linkRelTopic_1'> <a href='#rel_1_tab'>Company News</a></li> <li class='linkRelatedRecs'> <a href='#rel_rec_tab'>Street Research </a></li> <li class='linkRelTopic_2'> <a href='#rel_2_tab'>Options</a></li></ul><div class='relTopic1' id='rel_1_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="FERG">FERG</span> <span class="infoCompany">Ferguson</span></section><section class="statsCompany"> <dl> <dt>$109.50 / <p class="companyPrice gain">+3.55<small class="smallWithoutIcon"> (+3.35%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="hot related" data-id="3527036" data-sd="2022-06-07 06:57:33"> <dt> 06/07/22</dt> <dd>Ferguson releases ESG report</dd></dl><dl class="hot related" data-id="3515725" data-sd="2022-05-14 14:43:02"> <dt> 05/14/22</dt> <dd>Trian exits Comcast position, increases stake in Invesco</dd></dl><dl class="hot related" data-id="3513802" data-sd="2022-05-12 06:13:04"> <dt> 05/12/22</dt> <dd>Ferguson announces primary listing now on NYSE</dd></dl><dl class="hot related" data-id="3493503" data-sd="2022-04-13 09:18:11"> <dt> 04/13/22</dt> <dd>Trian Partners takes 5.2% passive stake in Ferguson</dd></dl></section></div><div id='rel_rec_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="FERG">FERG</span> <span class="infoCompany">Ferguson</span></section><section class="statsCompany"> <dl> <dt>$109.50 / <p class="companyPrice gain">+3.55<small class="smallWithoutIcon"> (+3.35%)</small></p></dt> </dl></section><section class="recsCompany"><dl class="no_change relatedRec" data-id="3532226" data-sd="2022-06-16 13:41:36"> <dt> 06/16/22 Societe Generale</dt> <dd>Ferguson price target lowered to 14,500 GBp from 19,000 GBp at Societe Generale</dd></dl><dl class="no_change relatedRec" data-id="3531831" data-sd="2022-06-16 07:13:24"> <dt> 06/16/22 Truist</dt> <dd>Ferguson price target lowered to $140 from $165 at Truist</dd></dl><dl class="no_change relatedRec" data-id="3531749" data-sd="2022-06-16 06:15:39"> <dt> 06/16/22 Barclays</dt> <dd>Ferguson price target lowered to $160 from $194 at Barclays</dd></dl><dl class="no_change relatedRec" data-id="3531544" data-sd="2022-06-15 14:10:45"> <dt> 06/15/22 RBC Capital</dt> <dd>Ferguson price target lowered to 9,800 GBp from 12,200 GBp at RBC Capital</dd></dl></div><div class='relTopic2' id='rel_2_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="FERG">FERG</span> <span class="infoCompany">Ferguson</span></section><section class="statsCompany"> <dl> <dt>$109.50 / <p class="companyPrice gain">+3.55<small class="smallWithoutIcon"> (+3.35%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="opt related" data-id="3496494" data-sd="2022-04-20 08:30:03"> <dt> 04/20/22</dt> <dd>Five new option listings and one option delisting on April 20th</dd></dl></section></div> </div></div> </td></tr><tr id="news_3532700_20220617102503" data-id="3532700" data-timeOffset="8" data-storytype="" data-topic="options" data-datetime="20220617102503" data-unlockdate="2022-06-18 10:25:03" class="tr_noticia options Options " data-unlockdateUTC="1655562303" data-datenews="2022-06-17 10:25:03"> <td class="story_type">
<span class="icon_story_type options" data-name="Options">
<div class="fpo_overlay_ticker">Options</div>
</span>
</td> <td><div class="story_header">
<a class='newsTitleLink' onclick='javascript:return false;' href='https://thefly.com/permalinks/entry.php/id3532700/X-US-Steel-call-volume-above-normal-and-directionally-bullish'><span>US Steel call volume above normal and directionally bullish</span></a>&nbsp;<span class='flechitaflechita'>»</span>
<span class="time_date">
<small class="timeType"><span class="fpo_overlay soloHora">10:25<div class="fpo_overlay_ticker">06/17/22</div></span><span class="fpo_overlay fecha">06/17<div class="fpo_overlay_ticker">10:25</div></span><span class="fpo_overlay fechaConAnio">06/17/22<div class="fpo_overlay_ticker">10:25</div></span></small>
</span> <div class="simbolos_wrapper"><span class='ticker fpo_overlay' data-ticker='X'>X<div class="fpo_overlay_img "><section class="infoCompany"><p class="infoCompany">U.S. Steel</p></section><section class="statsCompany"> <dl> <dt>$20.30 / <p class="companyPrice gain">+0.7<small class="smallWithoutIcon"> (+3.57%)</small></p></dt> </dl></section></div></span></div>
</div><div class='newsContent'><dd class='clickeable blocked'>
<p class='abstract'>Bullish option flow&hellip; <div class="candado"><div id="free_promo"><p class="open_free_trial"><strong>Story temporarily locked.</strong><br>To read stories as they happen please subscribe, Login above, or return <span class='tiempo_faltante'>tomorrow</span></p><a href="#" class="button gold open_free_trial">Get Free Trial</a></div></div></p></dd></div><div class='elementosRelacionadosWrapper '> <div class='clickeable toggleRelated'> <span class='showWord'>Show</span><span class='hideWord'>Hide</span> Related Items&nbsp;<span class='showWord'>>></span><span class='hideWord'><<</span> </div> <div class='relatedContent'> <ul class='globalRelated'> <li class='linkRelTopic_1'> <a href='#rel_1_tab'>Company News</a></li> <li class='linkRelatedRecs'> <a href='#rel_rec_tab'>Street Research </a></li> <li class='linkRelTopic_2'> <a href='#rel_2_tab'>Earnings</a></li> <li class='linkRelTopic_3'> <a href='#rel_3_tab'>Periodicals</a></li> <li class='linkRelTopic_4'> <a href='#rel_4_tab'>On The Fly</a></li> <li class='linkRelTopic_5'> <a href='#rel_5_tab'>Options</a></li></ul><div class='relTopic1' id='rel_1_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="X">X</span> <span class="infoCompany">U.S. Steel</span></section><section class="statsCompany"> <dl> <dt>$20.30 / <p class="companyPrice gain">+0.7<small class="smallWithoutIcon"> (+3.57%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="hot related" data-id="3532310" data-sd="2022-06-16 16:14:51"> <dt> 06/16/22</dt> <dd>U.S. Steel jumps 5.9% to $20.75 after Q2 earnings guidance</dd></dl><dl class="hot related" data-id="3532306" data-sd="2022-06-16 16:13:47"> <dt> 06/16/22</dt> <dd>U.S. Steel says $210M remaining under $800M buyback authorization</dd></dl><dl class="hot related" data-id="3530432" data-sd="2022-06-14 07:30:43"> <dt> 06/14/22</dt> <dd>U.S. Steel appoints Jessica Graziano as CFO</dd></dl><dl class="hot related" data-id="3510570" data-sd="2022-05-09 11:29:59"> <dt> 05/09/22</dt> <dd>United States temporarily suspends 232 tariffs on Ukrainian steel</dd></dl></section></div><div id='rel_rec_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="X">X</span> <span class="infoCompany">U.S. Steel</span></section><section class="statsCompany"> <dl> <dt>$20.30 / <p class="companyPrice gain">+0.7<small class="smallWithoutIcon"> (+3.57%)</small></p></dt> </dl></section><section class="recsCompany"><dl class="no_change relatedRec" data-id="3532603" data-sd="2022-06-17 08:27:09"> <dt>08:27 Today BMO Capital</dt> <dd>U.S. Steel price target lowered to $23 from $30 at BMO Capital</dd></dl><dl class="no_change relatedRec" data-id="3532527" data-sd="2022-06-17 07:08:08"> <dt>07:08 Today Credit Suisse</dt> <dd>U.S. Steel price target lowered to $44 from $49 at Credit Suisse</dd></dl><dl class="no_change relatedRec" data-id="3530557" data-sd="2022-06-14 08:42:05"> <dt> 06/14/22 JPMorgan</dt> <dd>U.S. Steel price target lowered to $28 from $34 at JPMorgan</dd></dl><dl class="no_change relatedRec" data-id="3523444" data-sd="2022-05-31 04:41:55"> <dt> 05/31/22 Goldman Sachs</dt> <dd>U.S. Steel price target lowered to $22 from $36 at Goldman Sachs</dd></dl></div><div class='relTopic2' id='rel_2_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="X">X</span> <span class="infoCompany">U.S. Steel</span></section><section class="statsCompany"> <dl> <dt>$20.30 / <p class="companyPrice gain">+0.7<small class="smallWithoutIcon"> (+3.57%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="ear related" data-id="3532302" data-sd="2022-06-16 16:13:01"> <dt> 06/16/22</dt> <dd>U.S. Steel sees Q2 EPS $3.83-$3.88, consensus $3.20</dd></dl><dl class="ear related" data-id="3502876" data-sd="2022-04-28 16:43:38"> <dt> 04/28/22</dt> <dd>U.S. Steel reports Q1 adjusted EPS $3.05, consensus $2.95</dd></dl><dl class="ear related" data-id="3479869" data-sd="2022-03-17 16:18:04"> <dt> 03/17/22</dt> <dd>U.S. Steel sees Q1 EPS $2.96-$3.00, consensus $3.77</dd></dl><dl class="ear related" data-id="3448397" data-sd="2022-01-27 16:18:10"> <dt> 01/27/22</dt> <dd>U.S. Steel reports Q4 adjusted EPS $3.64, consensus $4.41</dd></dl></section></div><div class='relTopic3' id='rel_3_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="X">X</span> <span class="infoCompany">U.S. Steel</span></section><section class="statsCompany"> <dl> <dt>$20.30 / <p class="companyPrice gain">+0.7<small class="smallWithoutIcon"> (+3.57%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="period related" data-id="3454231" data-sd="2022-02-07 10:25:09"> <dt> 02/07/22</dt> <dd>U.S., Japan reach deal to end steel tariffs, Bloomberg reports</dd></dl><dl class="period related" data-id="3448276" data-sd="2022-01-27 14:51:03"> <dt> 01/27/22</dt> <dd>WTO panel authorizes China to impose tariffs on U.S. imports, WSJ says</dd></dl></section></div><div class='relTopic4' id='rel_4_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="X">X</span> <span class="infoCompany">U.S. Steel</span></section><section class="statsCompany"> <dl> <dt>$20.30 / <p class="companyPrice gain">+0.7<small class="smallWithoutIcon"> (+3.57%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="otf related" data-id="3532625" data-sd="2022-06-17 08:52:05"> <dt>08:52 Today</dt> <dd>Fly Intel: Pre-market Movers</dd></dl><dl class="otf related" data-id="3532368" data-sd="2022-06-16 17:25:08"> <dt> 06/16/22</dt> <dd>Fly Intel: After-Hours Movers</dd></dl><dl class="otf related" data-id="3480425" data-sd="2022-03-18 16:07:09"> <dt> 03/18/22</dt> <dd>What You Missed On Wall Street On Friday</dd></dl><dl class="otf related" data-id="3480376" data-sd="2022-03-18 12:02:51"> <dt> 03/18/22</dt> <dd>What You Missed On Wall Street This Morning</dd></dl></section></div><div class='relTopic5' id='rel_5_tab'><section class="infoCompany"> <span class="ticker symbolInsideNews" data-ticker="X">X</span> <span class="infoCompany">U.S. Steel</span></section><section class="statsCompany"> <dl> <dt>$20.30 / <p class="companyPrice gain">+0.7<small class="smallWithoutIcon"> (+3.57%)</small></p></dt> </dl></section><section class='recsCompany'><dl class="opt related" data-id="3513226" data-sd="2022-05-11 09:40:03"> <dt> 05/11/22</dt> <dd>Unusually active option classes on open May 11th</dd></dl><dl class="opt related" data-id="3502561" data-sd="2022-04-28 13:49:03"> <dt> 04/28/22</dt> <dd>US Steel options imply 6.7% move in share price post-earnings</dd></dl><dl class="opt related" data-id="3494402" data-sd="2022-04-14 10:45:03"> <dt> 04/14/22</dt> <dd>US Steel call volume above normal and directionally bullish</dd></dl><dl class="opt related" data-id="3483137" data-sd="2022-03-24 11:05:03"> <dt> 03/24/22</dt> <dd>US Steel call volume above normal and directionally bullish</dd></dl></section></div> </div></div> </td></tr>
</tbody>
</table><div class='ad_wrapper wrapper_ad_entre_noticias'><div id='ic_728x90_3' class='ad_individual_entre_noticia ad_AdInvestigatingChannelLeaderboard'></div></div>
<table class="today news_table first_table">
<tbody>
</tbody>
</table>
</div>
<div class="moreNewsTriggers">
<a class="storiesEarlier" href="#" id="see_older_stories"></a>
</div>
</div>
</div>
<aside id="main_sidebar" style="display:none;">
<div class='ad_wrapper wrapper_ad_columna_derecha'><div id='ic_300x250_1' class='ad_individual_columna_derecha ad_AdInvestigatingChannelSquare'></div></div>
<section id="on_the_fly_sidebar">
<h3 class="logged_out"><a href='news.php?onthefly=on&h=6' class='link'>On The Fly</a></h3>
<p>News and insights, exclusive to thefly.com</p>
<table>
<tbody>
<tr><td>No On The Fly News for your search</td></tr>
</tbody>
</table>
<p><a href='news.php?onthefly=on&h=6' class='view_all'>View all On The Fly Stories &raquo;</a></p>
</section><div class='ad_wrapper wrapper_ad_columna_derecha'><div id='ic_300x250_2' class='ad_individual_columna_derecha ad_AdInvestigatingChannelSquare'></div></div>  <section id="todays_events">
<h3>Upcoming<br>Events (10)</h3>
<table>
<tbody>
<tr class="event_opener" data-id-tipo-evento="4" data-id-evento="51083"> <th scope="row"><div class="symbol_wrapper"><a href="news.php?symbol=HSBC">HSBC</a></div></th> <td>Inaugural Conference on the International Roles of the U.S. Dollar</td></tr><tr class="event_opener" data-id-tipo-evento="4" data-id-evento="51015"> <th scope="row"></th> <td>EHA 2022</td></tr><tr class="event_opener" data-id-tipo-evento="2" data-id-evento="224299"> <th scope="row"><div class="symbol_wrapper"><a href="news.php?symbol=FSFG">FSFG</a></div></th> <td>First Savings Financial Group</td></tr><tr class="event_opener" data-id-tipo-evento="2" data-id-evento="224388"> <th scope="row"><div class="symbol_wrapper"><a href="news.php?symbol=IRTC">IRTC</a></div></th> <td>iRhythm</td></tr><tr class="event_opener" data-id-tipo-evento="2" data-id-evento="222689"> <th scope="row"><div class="symbol_wrapper"><a href="news.php?symbol=UNFI">UNFI</a></div></th> <td>United Natural Foods</td></tr><tr class="event_opener" data-id-tipo-evento="2" data-id-evento="224213"> <th scope="row"><div class="symbol_wrapper"><a href="news.php?symbol=GWRE">GWRE</a></div></th> <td>Guidewire</td></tr><tr class="event_opener" data-id-tipo-evento="1" data-id-evento="126249"> <th scope="row"></th> <td>Homebuilding</td></tr><tr class="event_opener" data-id-tipo-evento="0" data-id-evento="419947"> <th scope="row"><div class="symbol_wrapper"><a href="news.php?symbol=JT">JT</a></div></th> <td>Jianpu Technology - JT</td></tr><tr class="event_opener" data-id-tipo-evento="2" data-id-evento="223647"> <th scope="row"><div class="symbol_wrapper"><a href="news.php?symbol=CDAK">CDAK</a></div></th> <td>Codiak BioSciences, Inc.</td></tr><tr class="event_opener" data-id-tipo-evento="2" data-id-evento="224710"> <th scope="row"><div class="symbol_wrapper"><a href="news.php?symbol=CNC">CNC</a></div></th> <td>Centene</td></tr>
</tbody>
</table>
<p><a href='events.php' class='view_all'>View all of today&rsquo;s events &raquo;</a></p>
</section> <section id="todays_syndicate">
<h3>Today&rsquo;s<br>Syndicate (1)</h3>
<table>
<tbody>
<tr class="syndicate_opener" data-id-syndicate="21705"><th scope="row"><a href="news.php?symbol=ACLX">ACLX</a></th><td>Secondary</td></tr>
</tbody>
</table>
<p><a href='syndicate.php' class='view_all'>View this week&rsquo;s syndicate &raquo;</a></p>
</section><div class='ad_wrapper wrapper_ad_columna_derecha'><div id='ic_120x750_1' class='ad_individual_columna_derecha ad_AdInvestigatingChannelContentPack'></div></div>
</aside>
</div>
<div class='ad_wrapper ad_footer'><div id='ic_728x90_4'></div></div>

<footer id="site_footer">
<nav class="site_nav">

<div class="footer_section">
<div class="footer_title"><span class="title">ABOUT THE FLY</span></div>
<ul>
<li><a href="services.php">Services</a></li>
<li><a href="about_the_fly.php">About Us</a></li>
<li><a href="faq.php">Help/FAQ</a></li>
<li><a href="careers.php">Careers</a></li>
<li><a href="/overlays/disclaimer.php" class='open_disclaimer_overlay'>Disclaimer and Terms of Use</a></li>
<li><a href="/overlays/disclaimer.php?h=Privacy%20Policy&#priv" class='open_disclaimer_overlay'>Privacy Policy</a></li>
<li><a href="/overlays/cancellationPolicy.php" class='open_overlay'>Cancellation Policy</a></li>

<li><a href="/ads_app.php" class='open_donotsellinfo'>Do Not Sell My Personal Information</a></li>

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
<li><a href="events.php">Events</a></li>
<li><a href="syndicate.php">Syndicate</a></li>
<li><a href="streetResearch.php">Street Research</a></li>
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
Copyright ©1998-2022 Thefly.com LLC </div>
</nav>
</footer>
<footer id="fixed_footer" class="gradient">
<div class="container">
<ul>
<li><a href="#why_the_fly" class="slider_control">Why the Fly?</a></li>
<li><a href="#" class="gold open_free_trial">Get Free Trial</a></li>
<li class="pop_out_button"><a id="open_popup_button" href="#" class="open_popup_link slider_control pop_out_button">Breaking News Pop-out</a></li>
</ul>

<div class="fly_cast">

<div id="jquery_jplayer_1_deshabilitado" class="jp-jplayer"></div>
<div id="jp_container_1" class="jp-audio">
<div class="jp-type-single">
<div class="jp-gui jp-interface">
<div class="jp-controls-div">
<ul class="jp-controls">
<li><p>Fly Cast</p></li>
<li><img style='margin-top:3px;' src='/images/backgrounds/flecha_negra.png' alt='Launch Fly Cast' /></li>
</ul>
</div>
<div class="jp-no-solution">
<span>Update Required</span>
To play the media you will need to either update your browser to a recent version or update your <a href="https://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>. </div>
</div>
</div>

</div>
<div class="fly small_fly"></div>
</div>
</footer>
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
14 Day Free Trial
</a>
<p class="learn_more"><a href="about_the_fly.php">Learn more &raquo;</a></p>
</div>
<a href="#" class="close_slider"></a>
<div class="fly big_fly"></div>
</div>
</div>
<script type="text/javascript">var texts = {"busqueda":{"validadorSimbolos":{"oneRepeated":"This symbol is repeated: ","manyRepeated":"These symbols are repeated: ","oneInexistent":"This symbol is non-existent: ","manyInexistent":"These symbols are non-existent: "},"agregarSimbolosABusqueda":{"alert":"The input is empty."}},"dinamizarNoticia":{"cambiarTextoRecsDeshabilitadas":{"textoRecs":"To see Analyst Recommendations, <a href=# class=\\"open_free_trial\\">subscribe to Full Access Plan<\\/a>."},"actualizarNoticiaAbierta":{"msg":"<div class='mostrarContenidoEscondidoActualizado'>This article is now available. <span class='gold linkActualizarContenido'>Update Content<\\/span><\\/div>"}},"fotw":{"calcularTimeAgo":{"overHour":"Over an hour ago","overMin":"Over a minute ago","overManyMins":"Over %time mins ago","overDay":"Over a day ago"},"radioStream":{"title":"The Fly Radio"},"hayAlMenosUnoChequeado":{"alert":"At least one checkbox must be checked."},"clickAdvancedSearch":{"showAdvanceSearch":"Show advanced search","hideAdvanceSearch":"Hide advanced search"},"validarFormSearchNews":{"alert":"Check market commentary or Recommendation. Or select a portfolio (if logged in)."},"setearCambiosFiltros":[],"groupSelectorsFilters":{"mousedown":{"alert":"At least one filter must be checked."}},"profileSettings":{"noty":{"text":"To apply the changes on the site, we will refresh the page after the popup close"}}},"news":{"ponerNewsPagNews":{"noMoreNews":"No more news for the last year."},"moreNews":{"earlierStories":"Loading earlier stories","storiesSinceClose":"Loading stories since yesterday's close"}},"login":{"respuestaLogin":{"msg":"There was an error processing your request. Please try again"}},"portfolio":{"agregarSimbolosAPortfolio":{"alert":"Symbols field is empty."},"grabarPortfolio":{"alert":"You need to add a symbol to the portfolio to save it."},"borrarSimboloPortfolio":{"alert":"borrar simbolo => %simbolo \\n id_port %id_portfolio"}},"settings":{"settingsCheckUnsavedPortfolios":{"noty":{"text":"Do you want save your changes before leaving?"}},"settingsCheckUnsavedBilling":{"noty":{"text":"Your Subscription was not saved. Do you want to leave without saving?"}},"ready":{"delete_portfolio_button":{"click":{"noty":{"text":"Are you sure you want to delete your Portfolio %portName ?"}}},"delete_symbol_button":{"click":{"noty":{"text":"The portfolio should have at least one symbol"}}}},"portfolioInputValidate":{"portNameEmpty":{"noty":{"text":"Please complete portfolio's name"}},"portSymbolsEmpty":{"noty":{"text":"Please complete at least one symbol"}}},"actionSavePortfolio":[],"validarExistenciaSimbolos":{"invalidSymbol":"This symbol is invalid => %symbols","invalidSymbols":"These symbols are invalid => %symbols","dimissMsg":"<br>Click this message to dismiss."},"addSymbolAction":{"portfolioRow_new":{"noty":{"text":"Please type one or more symbols"}},"symbolInputValidate":{"noty":{"text":"Could not add more symbols. You've reached the maximum limit of %maxCantSimbolosPort symbols per portfolio"}}},"portfolioAjaxOK":{"portfolioAdded":"New portfolio was added","portfolioDeleted":"Portfolio was deleted","saveAlertSettings":"Alert's settings were modified"},"symbolInputValidate":{"noty":{"text":"The symbol %symbol is already in the list"}},"notificationsAjaxOK":{"notificationsSaved":"Notifications saved"},"updateSubscriptions":{"savingError":"Error saving the subscriptions changes, please try again"},"otroReady":{"noty":{"text":"Please fill all inputs. The new password and repeat password must be the same."}},"otroReadyMas":{"noty":{"text":"Please complete with a new email address"}},"changeEmailAjaxOK":{"reqError":"Request error. Please try again"}},"update":{"procesarActualizacion_q":{"mostrarMensajeFancy":{"title":"Sorry...","msg":"You have been disconnected because someone has logged in from another location."}},"procesarActualizacion":[]},"buttons":{"subscribe":"Subscribe","save":"Save","discard":"Discard","ok":"Ok","cancel":"Cancel","stay":"Stay"},"popups":{"radio":{"title":"TheFly Radio"}},"fancy":{"title":"The Fly"}};

var ult_modifiedNews = '5042359';

var wid_versions = {"1":"10297"};

var cookieConsentCfg = {"active":true,"cookie":{"name":"cookie_consent","expiry":30}};

</script><script type="text/javascript" src="/js/todosE.js?lastUpdate=202206173423888144"></script><script type="text/javascript" src="/js/todosM.js?lastUpdate=202206173423888144"></script><script type="text/javascript" src="/js/todosN.js?lastUpdate=202206173423888144"></script><div id="searchAutocompleteWrapper" class="search_autocomplete_wrapper"></div>
<script type="text/javascript">
\t$(document).ready(function() {
\t\tinitSymbolAutocomplete ("#input_nav_search");
\t\tinitSymbolAutocomplete ("#symbol_search_news_home");
\t\tinitSymbolAutocomplete ("#input_symbol_search_news");
\t\tinitSymbolAutocomplete ("#agregarSimbolosInput");\t
\t\tinitSymbolAutocomplete ("div#search_events_n input:[name='symbol']");
\t\tinitOnlyOneSymbolAutocomplete ("#symbol1");
\t\tinitOnlyOneSymbolAutocomplete ("#symbol2");
\t\tinitOnlyOneSymbolAutocomplete ("#symbol3");
\t\tinitOnlyOneSymbolAutocomplete ("#symbol4");
\t\tinitOnlyOneSymbolAutocomplete ("#symbol5");
\t});
</script><script>
\ttrackTiming('Page Requests', '/news.php', '122', 'Request /news.php')
</script>
</body>
</html>
<div class="pop_up_promo" style="display: none;">
</div>
<script type="text/javascript">
\tvar buscaPorCalendario=0;

\tsetearUltimos(1655462142);
\t
\t\t\t//#653 Make ad Fixed
\t\tvar fixmeTop = 0;
\t

\t//Filtros dinamicos
    $(document).ready(function() {
\t\tsetearCambiosFiltros("#search_filter_stories_news input[type='checkbox']");
\t\t
\t//TODO esto es copia de fotw.js linea 487 para actualizar
\t// los checks grupales. Es muy parecido salvo que la seleccion
\t// de las variables de los elementos ($groupElem, $elems) se hacen
\t// en el fotw relativo al elemento que hace click.

\t// Rta TODO Me parece que eso a lo que se refeire el todo ya no está
\t// mas en el fotw.js. Copio todo para ese archivo para reutilizarlo
\t// en el news popOut.
\t
\t\tinicializarBotonesShowHideFullStories();

\t\tprepararFiltros();
    \t
    \tfixDateRow();
    \t
    \tprepararAutoload(getParametrosNews);

    \t//Eventos busqueda: le pone el on click para que muestre la info
    \t$("div.eventDateCalendar:not(.syndDateCalendar)", "div.search_results_bar").click(function (){abrirEventInfo($(this), "ev"); return false;});

\t\t//Syndicate busqueda: le pone el onclick
    \t$("div.search_results_bar div.syndDateCalendar").click(function (){abrirEventInfo($(this),"sy"); return false;});
\t\t
\t\t//Overlay de las recommendations en el header del resultado de busqueda
\t\t$("div.search_results_bar .story_details dl").hover(
\t\t\tfunction(){
\t\t\t\t$(".fpo_overlay_img", this).each(function() {
\t\t\t\t\tvar padre = $(this).parents("span.ticker");
\t\t\t\t\t$(this).css("left",padre.width()+12);
\t\t\t\t});
\t\t\t\tvar overlay = $(".overlayRecNews", this);
\t\t\t\tif(overlay.length > 0){
\t\t\t\t\toverlay.show();
\t\t\t\t\t//se fija que esté dentro de la pantalla en el pop
\t\t\t\t\tacomodarEnPop(overlay);
\t\t\t\t}
\t\t\t}, //mouseover
\t\t\tfunction(){
\t\t\t\tvar overlay = $(".overlayRecNews", this);
\t\t\t\tif(overlay.length > 0){
\t\t\t\t\treestablecerEnPop(overlay);
\t\t\t\t\toverlay.hide();
\t\t\t\t}
\t\t\t} //mouseout
\t\t);

\t\t$('#show_full_stories_bloqueado').click(
\t\t\t\tfunction () { // mouseover
\t\t\t\t\tif (loggedin){
\t\t\t\t\t\t//TODO esto es temporal, si el usuario no está subscripto a news_feed
\t\t\t\t\t\t//Show full stories está deshabilitado y mandaría a subscibirse a
\t\t\t\t\t\t//news_feed.
\t\t\t\t\t\tcambiarOpenFreeTrialASubscribe($(this).siblings('div'));
\t\t\t\t\t}
\t\t\t\t\t$(this).siblings('div').show();
\t\t\t\t}
\t\t\t);
\t\t$('#show_full_stories_not_logged').click(function (){$(this).hide()});

\t\tvar widNF = new WidgetNewsFeed("#search_news");


\t\t// Esto es para las related de las busquedas
\t\t// Funciones para abrir lo pops cuando
\t\t// los related recs estan bloqueadas
\t\t$('div.linked dl.relatedRec').click(function (){
\t\t\tvar id = $(this).attr("data-id");
\t\t\tvar sd = $(this).attr("data-sd");
\t\t\t
\t\t\t//window.location.href ="landingPageNews.php?id="+id+"&sch_date="+sd;
\t\t\twindow.location.href ="n.php?id="+id+"&sch_date="+sd;
\t\t});
\t\t
\t\t$('div.open_subs dl.relatedRec').click(function(){abrirRelPopUpSubscribed(this)});

\t\t$('div.open_free dl.relatedRec').click(function(){abrirRelPopUpNotLoggedIn(this)});

\t\t//Chequeo si hay que obtener los datos del simbolo diferido.
\t\tif($('#uniq_sym_search.dlyd').length && $(".simboloBuscando.simboloUnico>section.ticker").length){
\t\t\tvar sym = "symbol="+$(".simboloBuscando.simboloUnico>section.ticker").text();
\t\t\thacerAjaxSolamente("/ajax/get_q.php", sym, function(res){  ret = JSON.parse(res); if(ret.return){$('#uniq_sym_search.dlyd').html(ret.data)} }, {"type":"post"}, function(){});
\t\t}
\t\t
\t\t//#653 Make ad Fixed
\t\tvar fixeableAdSelector = "div.wrapper_ad_fixed";
\t\tif ($(fixeableAdSelector).length != 0){
\t\t\tfixmeTop = 123+$(fixeableAdSelector).offset().top;   // get initial position of the element\t\t
\t\t\tfixAds();
\t\t}
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
      /data-topic="(.+?)"[\s\S]+<a[\s\S]+href='([\s\S]+?)'><span>([\s\S]+?)<\/span>/i
    );
  const [__, time, date] = story.match(
    /soloHora">([\s\S]+?)<div class="fpo_overlay_ticker">([\s\S]+?)<\/div>/i
  );

  const tickers = [...story.matchAll(/data-ticker='([\s\S]+?)'/gi)].map(
    (i) => i[1]
  );

  if (tickers.some((t) => true))
    stories.push({
      date: `${date} ${time} GMT-${isDST() ? '4' : '5'}`,
      tickers: tickers.join(','),
      priority,
      topic,
      link,
      title: title.replace(/&#039;/g, "'").replace(/&amp;#39;/g, "'")
    });
}

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
