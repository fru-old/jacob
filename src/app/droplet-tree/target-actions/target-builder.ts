import { Generator } from '../generator-abstract'
import { Direction } from '../_interfaces/geometry'
import { RowContainerFull } from '../_interfaces/container'
import { Target, TargetActions } from '../_interfaces/target'

export class TargetBuilder {
  constructor(private generator: Generator) { /*empty*/ }

  private buildTopAndDownTargets(row: RowContainerFull, node: object, before: boolean, targets: Target[]) {
    let actionTop  = null;
    let actionDown = null;
    targets.push(this.buildTarget(node, Direction.TOP, before, actionTop));
    targets.push(this.buildTarget(node, Direction.DOWN, before, actionDown));
  }

  private buildLeftAndRightTargets(row: RowContainerFull, node: object, targets: Target[]) {
    let actionLeft  = null;
    let actionRight = null;
    targets.push(this.buildTarget(node, Direction.LEFT, false, actionLeft));
    targets.push(this.buildTarget(node, Direction.RIGHT, false, actionRight));
  }

  private buildTarget(node: object, direction: Direction, before: boolean, actions: TargetActions ) {
    let area = this.generator.getTargetBox(node, direction, before);
    let isLeftOrRight = direction === Direction.LEFT || direction === Direction.RIGHT;
    return { area, actions, priority: isLeftOrRight ? 2 : 1 };
  }

  build(row: RowContainerFull): Target[] {
    let targets: Target[] = [];
    let original = row.shared.rowsRaw[row.rowsRawIndex];
    let multi: object[] = this.generator.getMultiRow(original);
    if (multi) {
      for (let i = 0; i < multi.length; i++) {
        if (i === 0) this.buildTopAndDownTargets(row, multi[i], true, targets);
        this.buildTopAndDownTargets(row, multi[i], false, targets);
        this.buildLeftAndRightTargets(row, multi[i], targets);
      }
    } else {
      this.buildTopAndDownTargets(row, original, true, targets);
      this.buildTopAndDownTargets(row, original, false, targets);
    }
    return targets;
  }
}
