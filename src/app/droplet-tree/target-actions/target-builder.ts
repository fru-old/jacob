import { Generator } from '../generator-abstract'
import { Direction } from '../_interfaces/geometry'
import { RowContainerFull } from '../_interfaces/container'
import { Target, TargetActions } from '../_interfaces/target'
import { TargetActionBetweenRows } from './action-between-rows'
import { TargetActionOnSelected } from './action-on-selected'

export class TargetBuilder {
  constructor(private generator: Generator) { /*empty*/ }

  private buildTopAndDownTargets(row: RowContainerFull, node: object, isFirst: boolean, targets: Target[]) {

    let beforeRow = this.generator.tree.flat[row.flatIndex - 1];
    let afterRow  = this.generator.tree.flat[row.flatIndex + 1];

    let hasSelectedRow = this.generator.tree.hasSomeSelected(row);
    let hasSelectedBefore = this.generator.tree.hasSomeSelected(beforeRow);
    let hasSelectedAfter  = this.generator.tree.hasSomeSelected(afterRow);

    let actionTop  = null, actionDown = null;

    if (hasSelectedRow) {
      actionTop  = new TargetActionOnSelected(this.generator, row);
      actionDown = new TargetActionOnSelected(this.generator, row);
    } else {
      if (hasSelectedBefore) {
        actionTop = new TargetActionOnSelected(this.generator, beforeRow);
      } else {
        actionTop = new TargetActionBetweenRows(this.generator, beforeRow, row);
      }

      if(hasSelectedAfter) {
        actionDown = new TargetActionOnSelected(this.generator, afterRow);
      } else {
        actionDown = new TargetActionBetweenRows(this.generator, row, afterRow);
      }
    }

    targets.push(this.buildTarget(node, Direction.TOP, isFirst, actionTop));
    targets.push(this.buildTarget(node, Direction.DOWN, isFirst, actionDown));
  }

  private buildLeftAndRightTargets(row: RowContainerFull, node: object, targets: Target[]) {
    let actionLeft  = null;
    let actionRight = null;
    targets.push(this.buildTarget(node, Direction.LEFT, false, actionLeft));
    targets.push(this.buildTarget(node, Direction.RIGHT, false, actionRight));
  }

  private buildTarget(node: object, direction: Direction, isFirst: boolean, actions: TargetActions ) {
    let area = this.generator.getTargetBox(node, direction, isFirst);
    let isLeftOrRight = direction === Direction.LEFT || direction === Direction.RIGHT;
    return { area, actions, priority: isLeftOrRight ? 2 : 1 };
  }

  build(row: RowContainerFull): Target[] {
    let targets: Target[] = [];
    let original = row.shared.rowsRaw[row.rowsRawIndex];
    let multi: object[] = this.generator.getMultiRow(original);
    if (multi) {
      for (let i = 0; i < multi.length; i++) {
        this.buildTopAndDownTargets(row, multi[i], i === 0, targets);
        this.buildLeftAndRightTargets(row, multi[i], targets);
      }
    } else {
      this.buildTopAndDownTargets(row, original, true, targets);
    }
    return targets;
  }
}
