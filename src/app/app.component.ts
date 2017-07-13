import { Component, ViewChildren, QueryList, Input, ContentChildren } from '@angular/core';
import { ElementRef, Inject, ViewEncapsulation, SimpleChange } from '@angular/core';
import { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { GridElement } from './elements/grid.element';
import { InputElement } from './elements/input.element';
import { DropletBackend, DropletRoot, DropletSource } from './drag.backend';
import { DropletPreview, DropletPosition, DropletCoordinate } from './drag.backend';
import { TreeRectangleHelper, TreeState, TreeTarget, TreeTargetCollection } from './drag.backend';

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

  readonly backend: DropletBackend<TreeTarget, TreeSource>;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private preview: boolean = false;
  private state: TreeState;

  constructor (@Inject(ElementRef) private reference: ElementRef) {
    this.backend = new DropletBackend<TreeTarget, TreeSource>(this);
  }

  getNativeElement() {
    return this.reference.nativeElement;
  }

  highlight(backend: DropletBackend<TreeTarget, TreeSource>, source: TreeSource, position: DropletPosition<TreeTarget>) {
    this.preview = !!position.matches.length;
    if(position.matches.length) {
      var highlight = position.matches[0].highlight(position);
      this.x = highlight.x;
      this.y = highlight.y;
      this.width = highlight.width;
      this.height = highlight.height;
    }
  }

  drop(backend: DropletBackend<TreeTarget, TreeSource>, source: TreeSource, position: DropletPosition<TreeTarget>) {
    this.preview = false;
    if(position.matches.length) {
      position.matches[0].drop(position);
    }
  }

  getDropTargets (source: TreeSource) {
    this.state = new TreeState(10, 2, this.context, source);
    console.log(this.state.getTargetAreas());
    return this.state.getTargetAreas();
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

  constructor (@Inject(ElementRef) private reference: ElementRef) {}

  public getNativeElement() {
    return this.reference.nativeElement;
  }

  public getId() {
    return this.id;
  }

  /*
  public getDragDirections(dragged: TreeSource) {
    return {0: true, 1: true, 2: true, 3: true};
  }*/

  ngOnDestroy () {
    if(this.undo) this.undo();
  }

  ngOnChanges(changes: {[ propName: string]: SimpleChange}) {
    if(this.undo) this.undo();
    this.undo = DropletBackend.setHiddenProperty(TreeState.SOURCE, this.context, this);
  }
}


@Component({
  selector: '[tree-droplet-preview]',
  template: `<ng-content></ng-content>`
})
export class TreePreview implements DropletPreview, OnChanges, OnDestroy {
  @Input() context: any;

  private undo: any;

  constructor (@Inject(ElementRef) private reference: ElementRef) {}

  public getNativeElement() {
    return this.reference.nativeElement;
  }

  ngOnDestroy () {
    if(this.undo) this.undo();
  }

  ngOnChanges(changes: {[ propName: string]: SimpleChange}) {
    if(this.undo) this.undo();
    this.undo = DropletBackend.setHiddenProperty(TreeState.PREVIEW, this.context, this);
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
