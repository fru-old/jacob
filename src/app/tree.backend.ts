



// Tree logic: Sources

export interface TreeSourceRow {
  readonly items: any[];
  readonly itemsIndex: number;
  readonly level: number;
  readonly previousOnLevel: TreeSourceRow[];
  readonly list: TreeSourceRow[];
  readonly listIndex: number;
}

export function flattenTree (items, source, skipChildren, results = [], level = 0, previousOnLevel = []): TreeSourceRow[] {
  items.forEach((item, itemsIndex) => {
    let row: TreeSourceRow = {
      items: items,
      itemsIndex: itemsIndex,
      level: level,
      previousOnLevel: previousOnLevel.slice(), // copy
      resultsIndex: results.length
    };

    previousOnLevel[level] = row;
    results.push(row);

    if (item.children && !skipChildren(item)) {
      flattenTree(item.children, source, skipChildren, results, level + 1, previousOnLevel);
    }
  });
  return results;
};



// Tree logic: Targets

export class TreeTargetActionBetween implements TargetActions {

  constructor(private generator: TreeGenerator, private before: TreeSourceRow, private after: TreeSourceRow) {}

  private source = (this.generator.isSingleAndSource(this.before) && this.before)
                || (this.generator.isSingleAndSource(this.after)  && this.after);

  hover(start: Coordinate, now: Coordinate) {
    if (this.source) return this.generator.hoverOnSource(this.source, now.x - start.x);
    if (this.before) return this.generator.hoverAfter(this.before, now.x - start.x);
    return this.generator.hoverBeforeAll(this.after);
  }

  drop(start: Coordinate, now: Coordinate): void {
    if (this.source) return this.generator.setLevel(this.source, now.x - start.x);
    if (this.before) this.generator.dropAfterAndDetach(this.before, now.x - start.x);
    return this.generator.dropBeforeAllAndDetach(this.after);
  }
}

export class TreeTargetActionAtIndex implements TargetActions {

  constructor(private generator: TreeGenerator, private row: TreeSourceRow, private index: number) {}

  private source = this.generator.getSourceAt(this.row, this.index)
                || this.generator.getSourceAt(this.row, this.index - 1);

  hover(start: Coordinate, now: Coordinate) {
    if (this.source) return this.generator.hoverOnSource(this.source, 0);
    if (this.index === 0) return this.generator.hoverBeforeFirst(this.row);
    return this.generator.hoverAfterIndex(this.row, this.index);
  }

  drop(start: Coordinate, now: Coordinate) {
    if (!this.source) this.generator.dropAtIndexAndDetach(this.row, this.index);
  }
}
