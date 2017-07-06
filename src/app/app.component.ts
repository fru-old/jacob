import { Component, ViewChildren, QueryList, Input, ContentChildren } from '@angular/core';
import { ElementRef, Inject, ViewEncapsulation, SimpleChange } from '@angular/core';
import { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { GridElement } from './elements/grid.element';
import { InputElement } from './elements/input.element';
import { DropletBackend, DropletRoot, DropletSource, DropletTarget } from './drag.backend';
import { DropletPreview, DropletPosition, DropletCoordinate } from './drag.backend';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  tree : any = [
    {title: '1'},
    {title: '2'},
    {title: '3', children: [
      {title: '3.1'},
      {title: '3.2'}
    ]},
    [{title: '4.1'}, {title: '4.2'}]
  ]
}

class TreeTarget implements DropletTarget {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: '[tree-droplet-root]',
  template: `
    <ng-content></ng-content>
    <div class="highlight"
      *ngIf="this.context.__isDragging"
      [style.top.px]="this.context.__highlight.x"
      [style.left.px]="this.context.__highlight.y"
      [style.width.px]="this.context.__highlight.width"
      [style.height.px]="this.context.__highlight.height">
  `
})
export class TreeRoot implements DropletRoot<TreeTarget, TreeSource> {
  @Input() context: any;
  public readonly backend: DropletBackend<TreeTarget, TreeSource>;

  constructor (@Inject(ElementRef) private reference: ElementRef) {
    this.backend = new DropletBackend<TreeTarget, TreeSource>(this);
  }

  public getNativeElement() {
    return this.reference.nativeElement;
  }

  highlight(backend: DropletBackend<TreeTarget, TreeSource>, source: TreeSource, position: DropletPosition<TreeTarget>) {
    console.log(arguments);
  }

  drop(backend: DropletBackend<TreeTarget, TreeSource>, source: TreeSource, position: DropletPosition<TreeTarget>) {
    console.log(arguments);
  }

  getDropTargets (source: TreeSource) {
    return [];
  }
}

@Component({
  selector: '[tree-droplet]',
  template: `
    <tree-droplet-inner [context]="context" [source]="source" [root]="root"
      [preview]="DropletBackend.getPreview(this.context)">
      <ng-content></ng-content>
    </tree-droplet-inner>
  `
})
export class TreeSource implements DropletSource {
  @Input() context: any;
  @Input() root: TreeRoot;

  private readonly DropletBackend = DropletBackend;
  private readonly source = this;
  private readonly id = 'S' + DropletBackend.getUniqueId();

  constructor (@Inject(ElementRef) private reference: ElementRef) {}

  public getNativeElement() {
    return this.reference.nativeElement;
  }

  public getId() {
    return this.id;
  }
}


@Component({
  selector: '[tree-droplet-preview]',
  template: `<ng-content></ng-content>`
})
export class TreePreview implements OnChanges, OnDestroy {
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
    this.undo = DropletBackend.setPreview(this.context, this);
  }
}

@Component({
  selector: 'tree-droplet-inner',
  template: `<ng-content></ng-content>`
})
export class TreeInner implements OnChanges, OnDestroy {
  private static globalCounter: number = 1;

  @Input() preview: any;
  @Input() context: any;
  @Input() source: TreeSource;
  @Input() root: TreeRoot;

  ngOnDestroy () {
    //this.removeRegister();
  }

  private undo: any;
  ngOnChanges(changes: {[ propName: string]: SimpleChange}) {

    if(this.undo) this.undo();
    this.undo = this.root.backend.connect(this.source, this.preview);

    setTimeout(() => {

    });
  }
}

// https://stackoverflow.com/questions/38130705/set-component-style-from-variable-in-angular-2
