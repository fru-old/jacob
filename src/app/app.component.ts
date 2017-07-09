import { Component, ViewChildren, QueryList, Input, ContentChildren } from '@angular/core';
import { ElementRef, Inject, ViewEncapsulation, SimpleChange } from '@angular/core';
import { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { GridElement } from './elements/grid.element';
import { InputElement } from './elements/input.element';
import { DropletBackend, DropletRoot, DropletSource, DropletTarget } from './drag.backend';
import { DropletPreview, DropletPosition, DropletCoordinate, DropletHelper } from './drag.backend';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  tree : any = [
    {title: '1'},
    {title: '2', children: [
      {title: '2.1'}
    ]}
  ]
}

// most of this should be in backend

class TreeTarget implements DropletTarget {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: number;

  prevLevel: number;
  thisLevel: number;
  nextLevel: number;

  constructor(bounds: any) {
    this.x = bounds.left;
    this.y = bounds.top;
    this.width = bounds.width;
    this.height = bounds.height;
  }

  public highlight(position: DropletPosition<TreeTarget>) {
    return this;
  }
}

@Component({
  selector: '[tree-droplet-root]',
  template: `
    <ng-content></ng-content>
    <div class="highlight" *ngIf="preview"
      [style.left.px]="x" [style.top.px]="y" [style.width.px]="width" [style.height.px]="height">
  `
})
export class TreeRoot implements DropletRoot<TreeTarget, TreeSource> {
  @Input() context: any;

  public readonly backend: DropletBackend<TreeTarget, TreeSource>;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private preview: boolean = false;

  constructor (@Inject(ElementRef) private reference: ElementRef) {
    this.backend = new DropletBackend<TreeTarget, TreeSource>(this);
  }

  public getNativeElement() {
    return this.reference.nativeElement;
  }

  private static getBoundingRectFromProperty(name, context) {
    var rect = DropletBackend.getHiddenProperty(name, context).getNativeElement().getBoundingClientRect();
    return new TreeTarget(rect);
  }

  highlight(backend: DropletBackend<TreeTarget, TreeSource>, source: TreeSource, position: DropletPosition<TreeTarget>) {
    this.preview = !!position.matches.length;
    if(!position.matches.length) return;
    // TODO remove guard
    if(!position.matches[0].highlight) return;
    var highlight = position.matches[0].highlight(position);

    this.x = highlight.x;
    this.y = highlight.y;
    this.width = highlight.width;
    this.height = highlight.height;
  }

  drop(backend: DropletBackend<TreeTarget, TreeSource>, source: TreeSource, position: DropletPosition<TreeTarget>) {
    this.preview = false;
    //console.log(arguments);
  }

  private getRowsDepthFirst (items: any[], source: TreeSource, level: number = 0, result: any = []) {

    for(let item of items) {
      let isSource = DropletBackend.getHiddenProperty(TreeSource.SOURCE, item) === source;
      let isPreviousSameLevel = !!result.length && (result[result.length - 1].level === level);
      result.push({level, isSource, isPreviousSameLevel, item});
      if (item.children && !isSource) this.getRowsDepthFirst(item.children, source, level + 1, result);
    }
    return result;
  }

  private getTargetAreas (row: any, prev: any, next: any) {
    if (row.isSource) {
      return [TreeRoot.getBoundingRectFromProperty(TreePreview.PREVIEW, row.item)];
    } else {
      var rect = TreeRoot.getBoundingRectFromProperty(TreeSource.SOURCE, row.item);
      console.log(rect);
      return [rect];
      /*return [
        DropletHelper.getPartial(0, rect, 4), DropletHelper.getPartial(2, rect, 4)
      ];*/
    }
  }

  getDropTargets (source: TreeSource) {
    let rows = this.getRowsDepthFirst(this.context, source);
    return rows
      .map((row, i) => this.getTargetAreas(row, rows[i-1], rows[i+1]))
      .reduce((a, b) => a.concat(b));
  }
}

@Component({
  selector: '[tree-droplet]',
  template: `
    <tree-droplet-inner [source]="source" [root]="root" [preview]="DropletBackend.getHiddenProperty(TreePreview.PREVIEW, context)">
      <ng-content></ng-content>
    </tree-droplet-inner>
  `
})
export class TreeSource implements DropletSource, OnChanges, OnDestroy {
  @Input() context: any;
  @Input() root: TreeRoot;

  private readonly DropletBackend = DropletBackend;
  private readonly TreePreview = TreePreview;
  private readonly source = this;
  private readonly id = 'S' + DropletBackend.getUniqueId();
  private undo: any;
  public static readonly SOURCE = 'source';

  constructor (@Inject(ElementRef) private reference: ElementRef) {}

  public getNativeElement() {
    return this.reference.nativeElement;
  }

  public getId() {
    return this.id;
  }

  public getDragDirections(dragged: TreeSource) {
    return {0: true, 1: true, 2: true, 3: true};
  }

  ngOnDestroy () {
    if(this.undo) this.undo();
  }

  ngOnChanges(changes: {[ propName: string]: SimpleChange}) {
    if(this.undo) this.undo();
    this.undo = DropletBackend.setHiddenProperty(TreeSource.SOURCE, this.context, this);
  }
}


@Component({
  selector: '[tree-droplet-preview]',
  template: `<ng-content></ng-content>`
})
export class TreePreview implements DropletPreview, OnChanges, OnDestroy {
  @Input() context: any;

  private undo: any;
  public static readonly PREVIEW = 'preview';

  constructor (@Inject(ElementRef) private reference: ElementRef) {}

  public getNativeElement() {
    return this.reference.nativeElement;
  }

  ngOnDestroy () {
    if(this.undo) this.undo();
  }

  ngOnChanges(changes: {[ propName: string]: SimpleChange}) {
    if(this.undo) this.undo();
    this.undo = DropletBackend.setHiddenProperty(TreePreview.PREVIEW, this.context, this);
  }
}

@Component({
  selector: 'tree-droplet-inner',
  template: `<ng-content></ng-content>`
})
export class TreeInner implements OnChanges, OnDestroy {
  @Input() preview: TreePreview;
  @Input() source: TreeSource;
  @Input() root: TreeRoot;

  private undo: any;

  ngOnDestroy () {
    if(this.undo) this.undo();
  }

  ngOnChanges(changes: {[ propName: string]: SimpleChange}) {
    if(this.undo) this.undo();
    this.undo = this.root.backend.connect(this.source, this.preview);
  }
}

// https://stackoverflow.com/questions/38130705/set-component-style-from-variable-in-angular-2
// https://stackoverflow.com/questions/41109500/angular2-recursive-html-without-making-a-new-component
