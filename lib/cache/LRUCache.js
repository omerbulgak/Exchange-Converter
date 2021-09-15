var {Node} = require('./Node');

class LRUCache {
  constructor(maxCacheSize = 4) {
    this.head = null;
    this.tail = null;
    this.size = 0;
    // this.maxSize = 4;
    this.maxSize = maxCacheSize;
    this.cache = {};
  }

  put(key, value) {
    let newNode

    if (this.cache[key] === undefined) {
      newNode = new Node(key, value);
    }

    if (this.size === 0) {
      this.head = newNode;
      this.tail = newNode;
      this.size++;
      this.cache[key] = newNode;
      return this;
    }

    if (this.size === this.maxSize) {
      delete this.cache[this.tail.key]

      this.tail = this.tail.prev;
      this.tail.next = null;
      this.size--;
    }

    this.head.prev = newNode;
    newNode.next = this.head;
    this.head = newNode;
    this.size++;

    this.cache[key] = newNode;
    return this;

  }

  get(key) {
    if (!this.cache[key]) {
      return undefined
    }

    let foundNode = this.cache[key];

    if (foundNode === this.head) {
      return foundNode;
    }

    let previous = foundNode.prev;
    let next = foundNode.next;

    if (foundNode === this.tail) {
      previous.next = null;
      this.tail = previous;
    } else {
      previous.next = next;
      next.prev = previous;
    }

    this.head.prev = foundNode;
    foundNode.next = this.head;
    foundNode.prev = null;
    this.head = foundNode;

    return foundNode;
  }
}

module.exports = {
  LRUCache
}
