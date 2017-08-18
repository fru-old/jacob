// options:
// - isSelected()
// - getChildList(item)
// - getMultiList(item)
class ReverseIterator {
  constructor(tree, options) {
    this.tree = true;
    this.options = options;
  }

  isSelected(node) {
    return this.options.isSelected(this.options.getIndex(node));
  }

  private iterateReverse(rows, parentPath) {
    if (!rows) return;
    for(let i = rows.length - 1; i >= 0; i--) {
      let row = rows[i];
      let rowPath = Path.getChild(parentPath, i);

      let nodes = this.options.getMultiList(row);
      let children = this.options.getChildList(row);
      let selected = nodes.every(n => this.isSelected(n));

      if (!selected) {
        this.iterateReverse(children, rowPath);
      }

      this.enterRow(row, rowPath, selected);
      for(let j = nodes.length - 1; j >= 0; j--) {
        let node = nodes[j];
        let path = Path.getChild(parentPath, i, j);

        this.visitNode(node, path, this.isSelected(node));
      }
      this.exitRow(row, rowPath, selected);
    }
  }
}

class BuildTargetAreas extends ReverseIterator {
  constructor(tree, options) { super(tree, options); }

  targets = [];
  start() {
    this.iterateReverse(this.tree, null);
    return this.targets;
  }

  notSet = [];
  enterRow(row, path, selected) {
    if (!selected) {
      this.notSet.forEach(c => c.beforePath = path);
      this.notSet = [];
    }
  }

  exitRow(row, path, selected) {
    if (!selected) {
      this.justAdded.forEach(c => c.afterPath = path);
    }
  }

  visitNode(node, path, selected) {
    let targets = []; // Generated with buildTargets from options.getBoundBox(node);
    this.beforeNotSet = this.beforeNotSet.concat(targets);
    this.targets = this.targets.concat(targets);
  }
}



var afterPath = null;
var beforeNotSet = [];

iterateRowsReverse(function (node, path, options, selected) {

  if(afterPath != rowPath && !selected) {
    beforeNotSet.forEach(c => c.beforePath = rowPath);
    beforeNotSet = [];
  }
  var targets = []; // Generated with buildTargets from options.getBoundBox(node);

  targets.forEach(c => c.afterPath = rowPath);
  beforeNotSet = beforeNotSet.concat(targets);
  afterPath = row;
});
