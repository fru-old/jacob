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
    <!-- Preview -->
    <div class="highlight" *ngIf="preview"
      [style.left.px]="x" [style.top.px]="y"
      [style.width.px]="width" [style.height.px]="height"></div>

    <!-- Default templates -->
    <ng-template #itemDefault let-item let-index="index">{{item.title}}</ng-template>
    <ng-template #rowDefault let-template="template" let-context="context">
      <li><ng-container *ngTemplateOutlet="template; context: context"></ng-container></li>
    </ng-template>
    <ng-template #childrenDefault let-template="template" let-context="context">
      <ul><ng-container *ngTemplateOutlet="template; context: context"></ng-container></ul>
    </ng-template>

    <!-- Children content -->
    <ng-template #childrenContent let-c let-r="r">
      <ng-container *ngFor="let row of c; let index = index">
        <li>
          <ng-container *ngTemplateOutlet="itemContent; context: r.getSubContext(row)"></ng-container>
        </li>
      </ng-container>
    </ng-template>

    <!-- Item content -->
    <ng-template #itemContent let-c let-r="r">
      <span droplet-tree-preview [context]="c" [root]="r">
        <span class="tree-element" droplet-tree-node [context]="c" [root]="r">
        <ng-container
          *ngTemplateOutlet="r.itemTemplate || r.itemDefaultTemplate; context: r.getItemContext(c)">
        </ng-container>
        </span>
        <ul *ngIf="getChildren(c) && getChildren(c).length">
          <ng-container *ngTemplateOutlet="childrenContent; context: r.getSubContext(getChildren(c))"></ng-container>
        </ul>
      </span>
    </ng-template>

    <ng-container *ngTemplateOutlet="childrenContent; context: getRootContext()"></ng-container>

    <!--<ng-container
      *ngTemplateOutlet="rowLoop; context: {recurse: childrenTemplate}">
    </ng-container>-->

    <!--
    <ng-container
      *ngTemplateOutlet="rowTemplate; context: {recurse: childrenTemplate}"
      ></ng-container>
    <ng-container *ngFor="let item of ['test', 2]; let index = index">
      <ng-container
        *ngTemplateOutlet="itemTemplate2 || itemDefaultTemplate; context: {$implicit: item, index: index}">
      </ng-container>
    </ng-container>
    -->
  `
})
export class DropletTreeRoot implements DropletRoot {
  @Input('droplet-tree-root') context: any;

  @ContentChild('item') public itemTemplate: TemplateRef<any>;
  @ContentChild('row') public rowTemplate: TemplateRef<any>;
  @ContentChild('children') public childrenTemplate: TemplateRef<any>;

  @ViewChild('itemDefault') public itemDefaultTemplate: TemplateRef<any>;
  @ViewChild('rowDefault') public rowDefaultTemplate: TemplateRef<any>;
  @ViewChild('childrenDefault') public childrenDefaultTemplate: TemplateRef<any>;

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

  getRootContext() { return this.getSubContext(this.context); }
  getSubContext(item, template?) { return { $implicit: item, r: this, template }; }
  getItemContext(item, index) { return { $implicit: item, index }; }

  getNativeElement() {
    return this.reference.nativeElement;
  }

  getChildren(c) {
    return c.children;
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
