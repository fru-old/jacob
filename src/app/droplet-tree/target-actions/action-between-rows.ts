import { Generator } from '../generator-abstract'
import { Coordinate, BoundingBox, Direction } from '../_interfaces/geometry'
import { RowContainerFull, RowContainerShared } from '../_interfaces/container'
import { Target, TargetActions } from '../_interfaces/target'

export class TargetActionBetweenRows implements TargetActions {

  constructor(protected generator: Generator, private before: RowContainerFull, private after: RowContainerFull)
  { /*empty*/ }

  protected current: RowContainerFull = null;

  protected getLevel(start: Coordinate, now: Coordinate) {
    if (!this.before) return 0;
    if (this.current) {
      let raw: object = this.current.shared.rowsRaw[this.current.rowsRawIndex];
      let multi: object[] = this.generator.getMultiRow(raw);
      if (multi && multi.length > 1) return this.current.level;
    }
    let afterLevel = this.after ? this.after.level : 0;
    let currentLevel = this.current ? this.current.level : this.before.level;
    return this.generator.getLevel(this.before.level, afterLevel, currentLevel, now.x - start.x);
  }

  protected getNode(row: RowContainerFull, index: number) {
    let raw: object = row.shared.rowsRaw[row.rowsRawIndex];
    let multi: object[] = this.generator.getMultiRow(raw);
    return multi ? multi[index] : (index > 0 ? null : raw);
  }

  hover(start: Coordinate, now: Coordinate): BoundingBox {
    let level = this.getLevel(start, now);
    if (this.before) {
      return this.generator.getHoverBox(this.getNode(this.before, 0), Direction.DOWN, level);
    } else {
      return this.generator.getHoverBox(this.getNode(this.after, 0), Direction.TOP, level);
    }
  }

  drop(start: Coordinate, now: Coordinate): void {
    let level = this.getLevel(start, now);

    let rows: RowContainerShared;
    let index: number;
    let firstMoved: RowContainerFull = null;
    let target = this.generator.tree.selected[this.generator.tree.selected.length - 1];

    // The order of these instructions is important
    if (this.after && level === this.after.level) {
      rows = this.after.shared;
      index = this.after.rowsRawIndex;

    } else if (this.before && level === this.before.level + 1) {
      rows = this.generator.tree.getChildrenSharedContainer(this.before);
      index = 0;

    } else if (this.after && level === this.after.level + 1) {
      firstMoved = this.after;
      let parent = this.after.parentOnLevel[level];
      rows = parent.shared;
      index = parent.rowsRawIndex + 1;

    } else if (this.before && level === this.before.level) {
      rows = this.before.shared;
      index = this.before.shared.rowsRaw.length;

    } else {
      let parent = this.after.parentOnLevel[level];
      rows = parent.shared;
      index = parent.shared.rowsRaw.length;
    }

    this.generator.transformer.copySelectedInto(rows, index);
    if (firstMoved) this.generator.transformer.moveChildren(target.shared, firstMoved);
    this.generator.transformer.removeSelected();
  }
}
