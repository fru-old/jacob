import assert from 'assert';

// options:
// - levelWidth

class Path {
  constructor(hierarchy, positionInRow) {
    assert(hierarchy && hierarchy.length);
    this.hierarchy = hierarchy;
    this.positionInRow = positionInRow;
  }

  private getLevel() { return this.hierarchy.length; }
  private getIndex() { return this.hierarchy[this.hierarchy.length - 1]; }
  private getParentRow() {
    return this.getAncestorRow(this.getLevel() - 1);
  }

  private getAncestorRow(level) {
    if (level === 0) return null;
    return new Path(this.hierarchy.slice(0, level));
  }

  private getIndicatedLevel(offset, options) {
    return this.getLevel() + Math.round(offset / options.levelWidth);
  }
}

class TreeIterator {
  constructor(tree) {
    this.tree = tree;
  }

  iterate(visitor, options, context) {
    if (!context) context = this.tree;
    for (var row of context) {
      let selected = true;
      visitor(row)
    }
  }
}

class TreeTransformer {
  insertAtIndex(path, index) {

  }
  insertIntoRow(path, index) {

  }
  moveChildren(path, index) {

  }
}

function getHoverInfo(hoverPath, beforePath, afterPath, offset, options) {
  if (!hoverPath || !beforePath) return { level: 0 };

  // Does the positon of 'after' affect the possible hover range?
  let isAfterRestrictive = afterPath && afterPath.getLevel() > 0;

  let maxLevel  = beforePath.getLevel() + 1;
  let minLevel  = 0:
  if (isAfterRestrictive) minLevel = afterPath.getLevel() - 1;

  let indicated = hoverPath.getIndicatedLevel(offset, options);
  let level = Math.max(Math.min(indicated, maxLevel), minLevel);

  return {
    level,
    isFirstChildOfBefore: level === maxLevel,
    isDirectParentOfAfter: level === minLevel && isAfterRestrictive
  };
}

function drop(hoverInfo, hoverPath, beforePath, afterPath) {
  if (hoverInfo.isFirstChildOfBefore) {
    insertAtIndex(beforePath, 0);

  } else if (hoverInfo.isDirectParentOfAfter) {
    moveChildrenIntoLastSelected(afterPath.getParentRow(), afterPath.getIndex());
    let parent = afterPath.getParentRow();
    insertAtIndex(parent.getParentRow(), parent.getIndex());
    // -> split children before after, insert after parent of after

  } else {
    let parent = beforePath.getAncestorRow(hoverInfo.level);
    insertAtIndex(parent.getParentRow(), parent.getIndex());
  }
}

function buildTargets(nodeRect, extraSpacing, extraLeft) {

  return {top: null, bottom: null, left: null, right: null};
}
