import { Generator } from '../generator-abstract'
import { Coordinate, BoundingBox, Direction } from '../_interfaces/geometry'
import { RowContainer } from '../_interfaces/container'
import { Target, TargetActions } from '../_interfaces/target'

export class TargetActionBetweenRows implements TargetActions {

  constructor(private generator: Generator, private before: RowContainer, private after:  RowContainer)
  { /*empty*/ }

  protected getLevel(start: Coordinate, now: Coordinate) {
    if (!this.before) return 0;
    let afterLevel = this.after ? this.after.level : 0;
    let currentLevel = this.before.level || afterLevel;
    return this.generator.getLevel(this.before.level, afterLevel, currentLevel, now.x - start.x);
  }

  private firstNode(row: RowContainer) {
    return row && row.nodesOriginal[0];
  }

  hover(start: Coordinate, now: Coordinate): BoundingBox {
    let level = this.getLevel(start, now);
    if (this.before) {
      return this.generator.getHoverBox(this.firstNode(this.before), Direction.DOWN, level);
    } else {
      return this.generator.getHoverBox(this.firstNode(this.after), Direction.TOP, level);
    }
  }

  drop(start: Coordinate, now: Coordinate): void {
    let level = this.getLevel(start, now);

    // The order of these instructions is important

    if (this.after && level === this.after.level) {
      // insert in same rowlist as after, before after

    } else if (this.before && level > this.before.level) {
      // become first child of before

    } else if (this.after && level < this.after.level) {
      // split rowList of after, insert into previousOnLevel[level] rowlist

    } else if (this.before && level === this.before.level) {
      // append to same rowlist as before

    } else {
      // append to same rowlist as previousOnLevel[level]

    }
  }
}
