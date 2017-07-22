import { Generator } from '../generator-abstract'
import { Direction } from '../_interfaces/geometry'
import { RowContainer } from '../_interfaces/container'
import { Target, TargetActions } from '../_interfaces/target'

export class TargetBuilder {
  constructor(private generator: Generator) { /*empty*/ }

  private buildTopAndDownTargets(row: RowContainer, node: object, before: boolean, targets: Target[]) {
    let actionTop  = null;
    let actionDown = null;
    targets.push(this.buildTarget(node, Direction.TOP, before, actionTop));
    targets.push(this.buildTarget(node, Direction.DOWN, before, actionDown));
  }

  private buildLeftAndRightTargets(row: RowContainer, node: object, targets: Target[]) {
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

  build(row: RowContainer): Target[] {
    let targets: Target[] = [];

    for (let i = 0; i < row.nodesContainer.length; i++) {
      let node = row.nodesContainer[i];
      if (i === 0) this.buildTopAndDownTargets(row, node, true, targets);
      this.buildTopAndDownTargets(row, node, false, targets);
      this.buildLeftAndRightTargets(row, node, targets);
    }
    return targets;
  }
}
