class PriorityQueue {
  constructor(compare) {
    this.data = [];
    this.compare = compare;
  }

  push(item) {
    this.data.push(item);
    this.data.sort(this.compare);
  }

  pop() {
    return this.data.shift();
  }

  top() {
    return this.data[0];
  }

  size() {
    return this.data.length;
  }

  empty() {
    return this.data.length === 0;
  }

  toArray() {
    return [...this.data];
  }

  clear() {
    this.data = [];
  }
}

export default PriorityQueue;