import { Component, Input, ElementRef, Inject } from '@angular/core';
import { DragBackend } from '../drag-backend';
import { DropletRoot } from '../_interfaces/droplet';
import { BoundingBox } from '../_interfaces/geometry';
import { Generator } from '../generator-abstract';

@Component({
  selector: '[droplet-tree-root]',
  template: `
    <ng-content></ng-content>
    <div class="highlight" *ngIf="preview"
      [style.left.px]="x" [style.top.px]="y" [style.width.px]="width" [style.height.px]="height">
  `
})
export class DropletTreeRoot implements DropletRoot {
  @Input() context: any;

  readonly backend: DragBackend;
  readonly generator: Generator;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private preview: boolean = false;

  constructor (@Inject(ElementRef) private reference: ElementRef) {
    // TODO use backend
  }
  
  getNativeElement() {
    return this.reference.nativeElement;
  }

  setHover(box: BoundingBox) {
    this.preview = !!box;
    if (box) {
      this.x = box.x;
      this.y = box.y;
      this.width = box.width;
      this.height = box.height;
    }
  }
}
