class KDNode {
  constructor(item, axis = 0) {
    this.item = item;
    this.axis = axis;
    this.left = null;
    this.right = null;
  }
}

export default KDNode;