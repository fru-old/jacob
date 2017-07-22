import { BoundingBox, Coordinate } from './geometry'

export interface Target {
  readonly priority: number;
  readonly area: BoundingBox;
  readonly actions: TargetActions;
}

export interface TargetActions {
  hover(start: Coordinate, now: Coordinate): BoundingBox;
  drop(start: Coordinate, now: Coordinate);
}
