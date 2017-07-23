import { Generator } from '../generator-abstract'
import { Coordinate, BoundingBox, Direction } from '../_interfaces/geometry'
import { RowContainer } from '../_interfaces/container'
import { Target, TargetActions } from '../_interfaces/target'
import { TargetActionBetweenRows } from './action-between-rows'

export class TargetActionOnSelected extends TargetActionBetweenRows {

  constructor(private generator: Generator, private current: RowContainer)
  {
    // Search tree for before and after
    
  }

}
