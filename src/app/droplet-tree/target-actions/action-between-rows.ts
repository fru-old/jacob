import { Generator } from '../generator-abstract'
import { Coordinate, BoundingBox, Direction } from '../_interfaces/geometry'
import { RowContainer } from '../_interfaces/container'
import { Target, TargetActions } from '../_interfaces/target'

export class TreeTargetActionBetween implements TargetActions {

  constructor(private generator: Generator, private before: RowContainer, private after:  RowContainer)
  { /*empty*/ }

  private getLevel(start: Coordinate, now: Coordinate) {
    if (!this.before) return 0;
    let afterLevel = this.after ? this.after.level : 0;
    return this.generator.getLevel(this.before.level, afterLevel, now.x - start.x);
  }

  private firstNode(row: RowContainer) {
    return row && row.nodesOriginal[0];
  }

  hover(start: Coordinate, now: Coordinate): BoundingBox {
    let level = this.getLevel(start, now);
    if (this.before) {
      return this.generator.getHoverBox(this.before.nodesOriginal[0], Direction.DOWN, level);
    } else {
      return this.generator.getHoverBox(this.after.nodesOriginal[0], Direction.TOP, level);
    }
  }

  drop(start: Coordinate, now: Coordinate): void {
    if (this.before) this.generator.dropAfterAndDetach(this.before, now.x - start.x);
    return this.generator.dropBeforeAllAndDetach(this.after);
  }
}
