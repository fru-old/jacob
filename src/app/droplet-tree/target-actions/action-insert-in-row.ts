import { Generator } from '../generator-abstract'
import { Coordinate, BoundingBox, Direction } from '../_interfaces/geometry'
import { RowContainerFull, RowContainerShared } from '../_interfaces/container'
import { Target, TargetActions } from '../_interfaces/target'

export class TargetActionInsertInRow implements TargetActions {

  constructor(protected generator: Generator, private before: RowContainerFull, private after: RowContainerFull)
  { /*empty*/ }

  hover(start: Coordinate, now: Coordinate): BoundingBox {
    return null;
  }

  drop(start: Coordinate, now: Coordinate): void {
    
  }
}
