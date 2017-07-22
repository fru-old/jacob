import { BoundingBox, Coordinate, Direction } from './_interfaces/geometry'
import { Target } from './_interfaces/target'
import { FlatTreeContainer } from './flat-tree-container'
import { FlatTreeTransformer } from './flat-tree-transformer'

export abstract class Generator {

  constructor (public tree: FlatTreeContainer) { /*empty*/ }
  public transformer = new FlatTreeTransformer(this);

  abstract generate(): Target[];
  abstract isSelected(node): boolean;
  abstract getChildren(node, create?: boolean): object[][];
  abstract getTargetBox(node, direction: Direction, before: boolean): BoundingBox;
  abstract getHoverBox(node, direction: Direction, level?: number): BoundingBox;

  abstract getLevelWidth(): number;
  getLevel(beforeRowLevel, afterRowLevel, offset): number {
    let indicatedLevel = beforeRowLevel + Math.floor(offset / this.getLevelWidth());
    let maxLevel = beforeRowLevel + 1;
    let minLevel = afterRowLevel  - 1;
    return Math.max(Math.min(indicatedLevel, maxLevel), minLevel, 0);
  }

  private getHighestPriority(matches: Target[]) {
    let highest = null;
    for (let current of matches || []) {
      if(!highest || highest.priority < current.priority) highest = current;
    }
    return highest;
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
