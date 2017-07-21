import { BoundingBox, Coordinate, Target, TargetActions } from '../core/generator.interfaces'
import { TreeGenerator } from './generator'
import { TreeRowContainer } from './container'

export class TreeTargetActionBetween implements TargetActions {

  constructor(private generator: TreeGenerator, private before: TreeRowContainer, private after: TreeRowContainer) {}

  private source = (this.generator.flattened.isSingleAndSource(this.before.nodesOriginal) && this.before)
                || (this.generator.flattened.isSingleAndSource(this.after.nodesOriginal)  && this.after);

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
