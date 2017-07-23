import { Generator } from '../generator-abstract'
import { Coordinate, BoundingBox, Direction } from '../_interfaces/geometry'
import { RowContainerFull } from '../_interfaces/container'
import { Target, TargetActions } from '../_interfaces/target'
import { TargetActionBetweenRows } from './action-between-rows'

export class TargetActionOnSelected extends TargetActionBetweenRows {

  constructor(generator: Generator, current: RowContainerFull, private index: number)
  {
    super(generator,
      generator.tree.searchFlatForUnselected(current, false),
      generator.tree.searchFlatForUnselected(current, true));
    this.current = current;
  }

  hover(start: Coordinate, now: Coordinate): BoundingBox {
    let level = this.getLevel(start, now);
    let node = this.getNode(this.current, this.index);
    return this.generator.getHoverBoxOnSelected(node, level);
  }

  drop(start: Coordinate, now: Coordinate): void {
    let level = this.getLevel(start, now);
    if (level === this.current.level) return;
    return super.drop(start, now);
  }
}
