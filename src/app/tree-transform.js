// options:
// - isSelected()
// - getChildList(item)
// - getMultiList(item)
class ReverseIterator {

  isSelected(node, options) {
    return options.isSelected(options.getIndex(node));
  }

  private iterateReverse(rows, parentPath, options) {
    if (!rows) return;
    for(let i = rows.length - 1; i >= 0; i--) {
      let row = rows[i];
      let rowPath = Path.getChild(parentPath, i);

      let nodes    = options.getMultiList(row);
      let children = options.getChildList(row);
      let selected = nodes.every(n => this.isSelected(n, options));

      if (!selected) {
        this.iterateReverse(children, rowPath, options);
      }

      if (this.enterRow) this.enterRow(row, rowPath, selected);
      for(let j = nodes.length - 1; j >= 0; j--) {
        let node = nodes[j];
        let path = Path.getChild(parentPath, i, j);

        this.visitNode(node, path, this.isSelected(node, options), options);
      }
      if (this.exitRow) this.exitRow(row, rowPath, selected);
    }
  }
}

class BuildTargetAreas extends ReverseIterator {

  targets = [];
  start(tree, options) {
    this.iterateReverse(tree, null, options);
    return this.targets;
  }

  notSetBefore = [];
  enterRow(row, path, selected) {
    if (selected) return;
    this.notSetBefore.forEach(c => c.beforePath = path);
    this.notSetBefore = [];
  }

  previous = null;
  exitRow(row, path, selected) {
    if (!selected) this.previous = path;
  }

  visitNode(node, path, selected, options) {
    let targets = []; // Generated with buildTargets from options.getBoundBox(node);

    this.notSetBefore = this.notSetBefore.concat(targets);
    targets.forEach(c => c.afterPath = this.previous);
    this.targets = this.targets.concat(targets);
  }
}


class TreeTransformer {
  insertPath, insertIndex, insertInline: true, movePath, moveIndex
}

class TransformTree extends ReverseIterator {

  start(tree, options, transformation) {
    this.iterateReverse(tree, null, options);
  }

  visitNode(node, path, selected, options) {

  }
}
