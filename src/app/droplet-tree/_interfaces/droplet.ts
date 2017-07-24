import { BoundingBox } from './geometry';
import { Generator } from '../generator-abstract';
import { DragBackend } from '../drag-backend';

export interface DropletRoot {
  getNativeElement(): HTMLElement;
  setHover(box: BoundingBox);
  context: any;
  readonly backend: DragBackend;
}

export interface DropletSource {
  getNativeElement(): HTMLElement;
  getId(): string;
}

export interface DropletPreview {
  getNativeElement(): HTMLElement;
}
