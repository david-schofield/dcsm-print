/**
 * @file dcsm-print/index.js
 * @module dcsm-print
 * @description The default export is the Print class, which is a wrapper for the console.log method.
 **/
import {
  default as Print
}
from './src/dcsm-console-print.js';

// Example usage
/**
Print({
  example: 'Hello World!',
  example2: 'Hello World!',
  example3: {
    verryLongString: 'Long String! '.repeat(1000)
  }
}, 'Hello World!');

Print(['one', 'two', 'three'], /hello RegExp example/);
function exampleFunction() {
  Print(arguments);
  return 'Hello From Example Function!';
}
Print(exampleFunction('An Argument', 'Another Argument', 'A Third Argument'));
**/

// Export the Print class as a named export
export {
  Print
}
// Export the Print class as the default export
export default Print;