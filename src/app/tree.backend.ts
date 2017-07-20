export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Target {
  readonly priority: number;
  readonly area: BoundingBox;
  readonly actions: TargetActions;
}

export interface TargetActions {
  hover(start: Coordinate, now: Coordinate): BoundingBox;
  drop(start: Coordinate, now: Coordinate);
}

export abstract class TargetGenerator {
  abstract generate(data): Target[];
  abstract isSource(item): boolean;

  private getOrInitDropletProperty(context: any) {
    if (!context.__droplet) context.__droplet = {};
    return context.__droplet;
  }

  getHidden(name: string, context: any): any {
    return this.getOrInitDropletProperty(context)[name];
  }

  setHidden(name: string, context: any, data: any) {
    var droplet = this.getOrInitDropletProperty(context);
    if (droplet[name]) throw 'Only one ' + name + ' can be attached to the same context.';
    droplet[name] = data;
    return () => { delete droplet[name]; };
  }

  private getHighestPriority(matches: Target[]) {
    // TODO
    return matches[0];
  }

  hover(matches: Target[], start: Coordinate, now: Coordinate): BoundingBox {
    let highest = this.getHighestPriority(matches);
    return highest && highest.actions.hover(start, now);
  }

  drop(matches: Target[], start: Coordinate, now: Coordinate) {
    let highest = this.getHighestPriority(matches);
    if (highest) highest.actions.drop(start, now);
  }
}

// Tree logic: Generator

export abstract class TreeGenerator extends TargetGenerator {
  public static readonly SOURCE = 'source';
  public static readonly PREVIEW = 'preview';

  // TODO implement target generator

  // Are these needed?
  //getBounds(node, includeChildren: boolean): BoundingBox;
  //getMargin(node, includeChildren: boolean): BoundingBox;
  //getLevelWidth(): number;
  //Inline nodes don't have children but multiple can be in same row
  //isInline(node) { return false; }


  // generate: flatten, build targets, map+concat

  // !!!!!!!!!!!!!!!!!
  // First implement:

  abstract setLevel(source, offset);
  abstract dropAfterAndDetach(relative: TreeSourceRow, offset: number);
  abstract dropBeforeAllAndDetach(relative: TreeSourceRow);
  abstract dropAtIndexAndDetach(relative: TreeSourceRow, index: number);



}

// Tree logic: Sources

export interface TreeSourceRow {
  readonly items: any[];
  readonly itemsIndex: number;
  readonly level: number;
  readonly previousOnLevel: TreeSourceRow[];
  readonly resultsIndex: number;
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

  // TODO fix genrator typing
  constructor(private generator: any, private before: TreeSourceRow, private after: TreeSourceRow) {}

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

  // TODO fix genrator typing
  constructor(private generator: any, private row: TreeSourceRow, private index: number) {}

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
