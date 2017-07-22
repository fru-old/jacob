import { BoundingBox, Coordinate } from './_interfaces/geometry'
import { Target } from './_interfaces/target'
import { FlatTreeContainer } from './flat-tree-container'
import { FlatTreeTransformer } from './flat-tree-transformer'

export abstract class Generator {

  constructor (public tree: FlatTreeContainer) { /*empty*/ }
  public transformer = new FlatTreeTransformer(this);

  abstract generate(data): Target[];
  abstract isInline(item): boolean;
  abstract isSelected(item): boolean;
  abstract getChildren(item, create?: boolean): any[][];

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
