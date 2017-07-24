import { BoundingBox } from './geometry'

export interface DropletRoot {
  getNativeElement(): HTMLElement;
  setHover(box: BoundingBox);
}

export interface DropletSource {
  getNativeElement(): HTMLElement;
  getId(): string;
}

export interface DropletPreview {
  getNativeElement(): HTMLElement;
}
