import { PROTOCOL, DISCORD_CDN_AVATARS_URL } from './rest/routes';

export function compareDifferences (obj1: any, obj2: any): string[] | null {
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return null;
  }
  const differences: string[] = [];
  Object.getOwnPropertyNames(obj1).forEach((property) => {
    const obj1Property = obj1[property];
    const obj2Property = obj2[property];
    if (obj1Property !== obj2Property) {
      differences.push(property);
    }
  });
  return differences;
}

export function getAvatarUrl (avatarHash: string | null, id: string) {
  if (!avatarHash) return 'https://cdn.discordapp.com/avatars/660184868772249610/cb8f1853728403ef77590cd967d3b4c4.webp';
  return `${PROTOCOL}${DISCORD_CDN_AVATARS_URL}/${id}/${avatarHash}.png`;
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

export function snakeToCamelCase (input: string) {
  return input.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
}
