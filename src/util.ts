export function snakeToCamelCase (input: string) {
  return input.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
}

export function getEventEmitter () {
  let emitter;
  try {
    emitter = require('eventemitter3');
  } catch (e) {
    emitter = require('events').EventEmitter;
  }
  return emitter;
}
