# dcsm-print

`dcsm-print` is a simple console.log wrapper that shows more information when logging.

## Installation

You can install `dcsm-print` using npm:

```bash
npm install dcsm-print
```

## Usage
To use `dcsm-print`, simply import it in your code and use it like you would use `console.log`:

```javascript
import Print from 'dcsm-print';

Print('Hello, world!');
```

## Add `Print` to the `console`
Create and add print to the `console`:
  
```javascript
import Print from 'dcsm-print';
console.print = function() {
  Print(...arguments);
}
console.print('Hello, world!');
```

