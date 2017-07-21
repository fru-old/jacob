import { BoundingBox, Coordinate, Target, TargetActions } from '../core/generator.interfaces'
import { TreeGenerator } from './generator'
import { TreeRowContainer } from './container'

export class TreeTargetActionBetween implements TargetActions {

  private getSingleAndSource(row: TreeRowContainer): TreeRowContainer {
    return row && this.generator.flattened.isSingleAndSource(row.nodesOriginal) && row;
  }
  private source = this.getSingleAndSource(this.before) || this.getSingleAndSource(this.after);

  constructor(
    private generator: TreeGenerator,
    private before: TreeRowContainer,
    private after:  TreeRowContainer
  ) { /*empty*/ }
  
  hover(start: Coordinate, now: Coordinate) {
    if (this.source) return this.generator.hoverOnSource(this.source, now.x - start.x);
    if (this.before) return this.generator.hoverAfter(this.before, now.x - start.x);
    return this.generator.hoverBeforeAll(this.after);
  }

  drop(start: Coordinate, now: Coordinate): void {
    if (this.source) return this.generator.setLevel(this.source, now.x - start.x);
    if (this.before) this.generator.dropAfterAndDetach(this.before, now.x - start.x);
    return this.generator.dropBeforeAllAndDetach(this.after);
  }
}

export class TreeTargetActionAtIndex implements TargetActions {

  constructor(private generator: TreeGenerator, private row: TreeRowContainer, private index: number) {}

  private source = this.generator.flattened.getSourceAt(this.row.nodesOriginal, this.index)
                || this.generator.flattened.getSourceAt(this.row.nodesOriginal, this.index - 1);

  hover(start: Coordinate, now: Coordinate) {
    if (this.source) return this.generator.hoverOnSource(this.source, 0);
    if (this.index === 0) return this.generator.hoverBeforeFirst(this.row);
    return this.generator.hoverAfterIndex(this.row, this.index);
  }

  drop(start: Coordinate, now: Coordinate) {
    if (!this.source) this.generator.dropAtIndexAndDetach(this.row, this.index);
  }
}
