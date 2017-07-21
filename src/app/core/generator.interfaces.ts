export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface Target {
  readonly priority: number;
  readonly area: BoundingBox;
  readonly actions: TargetActions;
}

export interface TargetActions {
  hover(start: Coordinate, now: Coordinate): BoundingBox;
  drop(start: Coordinate, now: Coordinate);
}
