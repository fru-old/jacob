import { Generator } from '../generator-abstract'
import { Coordinate, BoundingBox, Direction } from '../_interfaces/geometry'
import { RowContainerFull } from '../_interfaces/container'
import { Target, TargetActions } from '../_interfaces/target'
import { TargetActionBetweenRows } from './action-between-rows'

export class TargetActionOnSelected extends TargetActionBetweenRows {

  constructor(generator: Generator, current: RowContainerFull)
  {
    super(generator,
      generator.tree.searchFlatForUnselected(current, false),
      generator.tree.searchFlatForUnselected(current, true));
    this.current = current;
  }

  private getFirstNode() {
    let node = this.current.shared.rowsRaw[this.current.rowsRawIndex];
    if (this.generator.getMultiRow(node)) return this.generator.getMultiRow(node)[0];
    return node;
  }

  hover(start: Coordinate, now: Coordinate): BoundingBox {
    let level = this.getLevel(start, now);
    return this.generator.getHoverBoxOnSelected(this.getFirstNode(), level);
  }

  drop(start: Coordinate, now: Coordinate): void {
    let level = this.getLevel(start, now);
    if (level === this.current.level) return;
    return super.drop(start, now);
  }
}
