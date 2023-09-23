import {
  stdout
} from 'node:process';
import {
  TypeHelper
} from 'dcsm-type-helper';

/**
 * @description Get the type of a value
 * @param {any} valuesToCheck
 * @returns {string} - The type of the value as a string or array of strings
 * @example
 * getTypeof('foo');
 * //=> 'string'
 * @example
 * getTypeof(['foo']);
 * //=> 'array'
 **/
function getTypeof(...valuesToCheck) {
  const typeHelper = new TypeHelper(...valuesToCheck);
  return typeHelper.getTypeof({
    enablePrettyTypeNames: true
  });
}

/**
 * @description Check if a value is an array or object
 * @param {any} value
 * @returns {boolean}
 * @example
 * isArrayOrObject('foo');
 * //=> false
 * @example
 * isArrayOrObject(['foo']);
 * //=> true
 * @example
 * isArrayOrObject({foo: 'bar'});
 * //=> true
 **/
function isArrayOrObject(value) {
  return ['[object Array]', '[object Object]'].includes(Object.prototype.toString.call(value));
}

/**
 * @description Get all paths from an object
 * @param {object} obj
 * @returns {object}
 * @example
 * getObjectPaths({foo: 'bar', baz: {qux: 'quux'}});
 * //=> {foo: 3, baz: 0, 'baz.qux': 5}
 * @example
 * getObjectPaths({foo: 'bar', baz: {qux: 'quux', quuz: {corge: 'grault'}}});
 * //=> {foo: 3, baz: 0, 'baz.qux': 5, 'baz.quuz': 0, 'baz.quuz.corge': 6}
 **/
function getObjectPaths(obj) {
  const keys = {};
  for (const key in obj) {
    keys[key.replace(/\./gmi, ' ')] = (typeof obj[key] === 'string' ? obj[key].length : 0);
    if (isArrayOrObject(obj[key])) {
      const newKeys = getObjectPaths(obj[key]);
      Object.keys(newKeys).forEach(newKey => {
        keys[`${key}.${newKey}`] = newKeys[newKey];
      });
    }
  }
  return keys;
}

/**
 * @description Get the longest path and value length from an object
 * @param {object} pathsObject
 * @returns {object}
 * @example
 * longestPathInfo({foo: 'bar', baz: {qux: 'quux'}});
 * //=> {cols: 12, valueLength: 3}
 * @example
 * longestPathInfo({foo: 'bar', baz: {qux: 'quux', quuz: {corge: 'grault'}}});
 * //=> {cols: 24, valueLength: 6}
 **/
function longestPathInfo(pathsObject = {}) {
  let longestPath = '';
  let longestPathValueLength = 0;
  Object.entries(pathsObject).forEach(([path, value]) => {
    if (`${path.length}` > longestPath.length) {
      longestPath = `${path}`;
      longestPathValueLength = value;
    }
  });
  let longestPathKeys = longestPath.split('.');
  let lastKeyInPath = longestPathKeys[longestPathKeys.length - 1];
  let numbIndents = longestPathKeys.length - 1;
  let indentLength = (numbIndents * 2) + 2; // Add 2 for the colon and space after the last key in the path
  return {
    cols: indentLength + lastKeyInPath.length + 2, // Add 2 for the colon and space
    valueLength: longestPathValueLength
  }
}

/**
 * @description Get the longest path and value length from an object
 * @param {any} object
 * @returns {object}
 * @example
 * getObjectLogMaxNumbCols({foo: 'bar', baz: {qux: 'quux'}});
 * //=> {cols: 12, valueLength: 3}
 **/
function getObjectLogMaxNumbCols(obj = {}) {
  const pathsObject = getObjectPaths(obj);
  return longestPathInfo(pathsObject);
}

// https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
/**
 * @description Wrap a string in an ANSI 256 color code
 * @param {string} text
 * @param {number} code
 * @returns {string}
 * @example
 * wrapAnsi256('foo', 190);
 * //=> '\u001B[0m\u001B[38;5;190mfoo\u001B[0m'
 * @example
 * wrapAnsi256('foo', 255);
 * //=> '\u001B[0m\u001B[38;5;255mfoo\u001B[0m'
 **/
function wrapAnsi256(text, code) {
  if (Number.isInteger(code) && code >= 0 && code <= 255) {
    return `\u001B[0m\u001B[38;5;${code}m${text}\u001B[0m`;
  }
  return text;
}
/**
 * @description Wrap a string in yellow ANSI 256 color code
 * @param {string} text
 * @returns {string}
 * @example
 * toYellowString('foo');
 * //=> '\u001B[0m\u001B[38;5;190mfoo\u001B[0m'
 **/
function toYellowString(text) {
  return wrapAnsi256(text, 190);
}
/**
 * @description Wrap a string in grey ANSI 256 color code
 * @param {string} text
 * @returns {string}
 * @example
 * toGreyString('foo');
 * //=> '\u001B[0m\u001B[38;5;245mfoo\u001B[0m'
 **/
function toGreyString(text) {
  return wrapAnsi256(text, 245);
}
/**
 * @description Wrap a string in white ANSI 256 color code
 * @param {string} text
 * @returns {string}
 * @example
 * toWhiteString('foo');
 * //=> '\u001B[0m\u001B[38;5;255mfoo\u001B[0m'
 **/
function toWhiteString(text) {
  return wrapAnsi256(text, 255);
}
/**
 * @description Return a string containing the row, col, file, type, and caller of a log statement styled with ANSI 256 color codes
 * @param {number} row
 * @param {number} col
 * @param {string} file
 * @param {string} type
 * @param {string} caller
 * @returns {string}
 * @example
 * getRowColFileTypeCaller(27, 1, 'index.js', 'boolean', 'functionName');
 * //=> '27:1 [index.js] ~> {boolean} (functionName)'
 **/
function toRowColFileTypeCallerString(row, col, file, type, caller) {
  return `${toYellowString(`${row}:${col}`)}${toGreyString(` [`)}${toWhiteString(`${file}`)}${toGreyString(`] ~> {`)}${toWhiteString(`${type}`)}${toGreyString(caller ? `} (${toWhiteString(`${caller}`)})` : `}`)}`.trim();
}

/**
 * @param {RegExp} regex
 * @param {string} str
 * @returns {Generator}
 * @example
 * RegExpGenerator(/foo/g, 'foobarbaz');
 * //=> Generator
 **/
function* RegExpGenerator(regex, str = '') {
  if (RegExp(regex) === regex && typeof str === 'string') {
    let match;
    while (match = regex.exec(str)) {
      yield match;
    }
  } else {
    return [];
  }
}

/**
 * @description Get all matches from a string using a regular expression
 * @param {RegExp} regex
 * @param {string} str
 * @param {boolean} showLogs
 * @returns {Array}
 * @example
 * RegExpAll(/foo/g, 'foobarbaz');
 * //=> [{...}, {...}, {...}]
 * @example
 * RegExpAll(/foo/g, 'foobarbaz', true);
 * //=> [{...}, {...}, {...}]
 * //=> {foo: 'foo', index: 0, input: 'foobarbaz', groups: {...}}
 **/
function RegExpAll(regex, str, showLogs = false) {
  const result = [];
  if (RegExp(regex) === regex && typeof str === 'string') {
    for (const {
        groups: {
          ...groups
        }
      }
      of RegExpGenerator(regex, str)) {
      result.push(groups);
      if (typeof showLogs === 'boolean' && showLogs === true) {
        console.dir(groups, {
          showHidden: false,
          depth: null,
          colors: true,
          compact: false
        });
      }
    }
  }
  return result;
}

/**
 * @description Print logs to the console with row, col, file, type, and caller information
 * @param {any} logs
 * @returns {void}
 * @example
 * dcsmConsolePrint('foo', 'bar', 'baz');
 * //=> 27:1 [index.js] ~> {string} (dcsmConsolePrint)
 * //=> 'foo'
 **/
function dcsmConsolePrint(...logs) {

  const logInfo = {
    name: '',
    file: '',
    row: '',
    col: ''
  };

  const Stack = RegExpAll(/at ?(?<name>[^\/]*?) \(?[^]+?\/(?<file>[a-zA-Z0-9\-\_\.]+\.[a-zA-Z]+)\:(?<row>[0-9]+)\:(?<col>[0-9]+)\)?/g, `${new Error().stack}`);
  Stack.forEach((found, index) => {
    if (found?.file === 'dcsm-console-print.js' && found?.name === 'dcsmConsolePrint') {
      // Skip over dcsmConsolePrint calls
      let logIndex = index + 1;
      // Skip over any console.print calls
      if (Stack[logIndex]?.name === 'console.print') {
        logIndex += 1;
        // Since console.print was used, the col will be off by 8
        if (Stack[logIndex]?.col) { // Check if col exists
          // console.print will add 8 to the col number, so we need to subtract 8 to get back to the correct row number
          Stack[logIndex].col = `${Number(`${Stack[logIndex].col}`) - 8}`;
        }
      }
      logInfo.name = Stack[logIndex]?.name ? `${Stack[logIndex]?.name}` : '';
      logInfo.file = Stack[logIndex]?.file ? `${Stack[logIndex]?.file}` : '';
      logInfo.row = Stack[logIndex]?.row ?? '';
      logInfo.col = Stack[logIndex]?.col ?? '';
    }
  });

  logs.forEach((log, i) => {
    console.log(toRowColFileTypeCallerString(logInfo.row, logInfo.col, logInfo.file, getTypeof(log), logInfo.name));
    let terminalOverflow = stdout.columns - 4;
    if (typeof log === 'object') {
      const objInfo = getObjectLogMaxNumbCols(log);
      terminalOverflow = terminalOverflow - objInfo.cols - `... ${objInfo.valueLength} more characters`.length;
    }
    if (typeof log === 'string') {
      if (log.length > terminalOverflow) {
        terminalOverflow = terminalOverflow - `... ${(log.length - stdout.columns)} more characters`.length;
      }
    }
    if (terminalOverflow < 0) terminalOverflow = 0;
    console.dir(log, {
      showHidden: false,
      depth: null,
      colors: true,
      maxStringLength: terminalOverflow,
      compact: false
    });
    // Add a new line after each log, except the last one
    if (i !== logs.length - 1) console.log('');
  });

  console.log(); // Add some space at the end
}

/**
 * @param {any} logs
 * @returns {void}
 **/
export default dcsmConsolePrint;