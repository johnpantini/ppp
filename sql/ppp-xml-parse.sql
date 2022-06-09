drop function if exists ppp_xml_parse(data text, options json);
create or replace function ppp_xml_parse(data text, options json default '{}')
returns json as
$$
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
              }
              else if (this.options.unpairedTags.indexOf(tagName) !== -1) {
                i = result.closeIndex;
              }
              else {
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
              }
              else {
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

  return parseXml(data, options);
$$ language plv8;
