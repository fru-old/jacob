import { Component, Input, ElementRef, Inject } from '@angular/core';
import { ContentChild, ViewChild, TemplateRef } from '@angular/core';
import { DragBackend } from '../drag-backend';
import { DropletRoot } from '../_interfaces/droplet';
import { BoundingBox } from '../_interfaces/geometry';
import { Generator } from '../generator-abstract';
import { DropletTreePreview } from './droplet-tree-preview';

@Component({
  selector: '[droplet-tree-root]',
  template: `
  <ng-template #itemDefault let-item let-index="index">
    <li>{{item.title}}!!</li>
  </ng-template>

    <ng-container
      *ngTemplateOutlet="rowTemplate; context: {recurse: childrenTemplate}"
      ></ng-container>
    <ng-container *ngFor="let item of ['test', 2]; let index = index">
      <ng-container
        *ngTemplateOutlet="itemTemplate2 || itemDefaultTemplate; context: {$implicit: item, index: index}">
      </ng-container>
    </ng-container>
    <div class="highlight" *ngIf="preview"
      [style.left.px]="x" [style.top.px]="y" [style.width.px]="width" [style.height.px]="height">
  `
})
export class DropletTreeRoot implements DropletRoot {
  @Input('droplet-tree-root') context: any;

  @ContentChild('item') public itemTemplate: TemplateRef<any>;
  @ContentChild('row') public rowTemplate: TemplateRef<any>;
  @ContentChild('children') public childrenTemplate: TemplateRef<any>;

  @ViewChild('itemDefault') public itemDefaultTemplate: TemplateRef<any>;

  readonly backend: DragBackend;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private preview: boolean = false;

  constructor (@Inject(ElementRef) private reference: ElementRef) {
    this.backend = new DragBackend(this);
    console.log(this);
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
