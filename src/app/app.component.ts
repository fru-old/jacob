import { Component, ViewChildren, QueryList, Input, ContentChildren } from '@angular/core';
import { ElementRef, Inject, ViewEncapsulation } from '@angular/core';
import { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { GridElement } from './elements/grid.element';
import { InputElement } from './elements/input.element';
import { DropletBackend } from './drag.backend';

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


@Component({
  selector: '[droplet-root]',
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
export class DropletRoot implements OnInit {
  @Input() context: any;

  constructor (@Inject(ElementRef) private componentRef: ElementRef) {}

  ngOnInit () {
    this.context.__isDragging = true;
    this.context.__highlight = {};
    this.context.__handlers = {};
    this.context.__backend = new DropletBackend();
    this.context.__backend.registerRoot(
      this.componentRef.nativeElement, this.getDropTargets, this.context.__highlight);
  }

  // [{position, highlight: (original, current, dropzone) => position, drop: (original, current, dropzone) => void}]
  getDropTargets (handle: any, preview: any) {
    return [{position: {minX: 10, maxX: 20, minY: 10, maxY: 20}}];
  }
}

var droppletInnerTemplate = `
  <droplet-inner
    [index]="index"
    [parent]="parent"
    [context]="context"
    [preview]="parent[index].__preview?.componentRef?.nativeElement"
    [isPreview]="isPreview">
    <ng-content></ng-content>
  </droplet-inner>
`;

@Component({
  selector: '[droplet]',
  template: droppletInnerTemplate
})
export class Droplet {
  @Input() index: number;
  @Input() parent: any[];
  @Input() context: any;
  isPreview = false;
}

class


@Component({
  selector: '[droplet-preview]',
  template: droppletInnerTemplate
})
export class DropletPreview {
  @Input() index: number;
  @Input() parent: any[];
  @Input() context: any;
  isPreview = true;
  constructor (@Inject(ElementRef) public componentRef: ElementRef) {}
}

@Component({
  selector: 'droplet-inner',
  template: `<ng-content></ng-content>`
})
export class DropletInner implements OnChanges, OnDestroy {
  private static globalCounter: number = 1;

  @Input() index: number;
  @Input() parent: any[];
  @Input() preview: any;
  @Input() context: any;
  @Input() isPreview: boolean;

  private lastIndex: number;
  private lastParent: any[];
  private lastPreview:any;
  private lastContext: any;
  private removeListener: () => void;

  public readonly id: number;

  constructor (@Inject(ElementRef) private componentRef: ElementRef) {
    this.id = DropletInner.globalCounter++;
  }

  ngOnDestroy () {
    this.removeRegister();
  }



  removeRegister () {
    if (this.isPreview) {
      if (!this.lastParent) return;
      this.lastParent[this.lastIndex].__preview = null;
    } else {
      if (!this.lastContext) return;
      delete this.lastContext.__handlers[this.id];
    }
  }

  addRegister () {
    if (this.isPreview) {
      var item = this.parent[this.index];
      if (item.__preview && item.__preview !== this) {
          throw "Only one preview allowed per object."
      }
      item.__preview = this;
    } else {
      this.context.__handlers[this.id] = this;
    }
  }

  hasBindingChanged () {
    return this.parent !== this.lastParent
        || this.index !== this.lastIndex
        || this.context !== this.lastContext;
  }

  hasPreviewChanged () {
    return this.preview !== this.lastPreview;
  }

  ngOnChanges(changes: any) {
    setTimeout(() => {
      if (this.hasBindingChanged()) {
        this.removeRegister();
        this.lastParent = this.parent;
        this.lastIndex = this.index;
        this.lastContext = this.context;
      }
      if (this.hasPreviewChanged()) {
        if (this.removeListener) this.removeListener();
        this.lastPreview = this.preview;
      }
      this.addRegister();
      if (!this.removeListener) {
        var el = this.componentRef.nativeElement;
        this.removeListener = this.context.__backend.registerSource(el, this.id, this.preview);
      }
    });
  }
}

// https://stackoverflow.com/questions/38130705/set-component-style-from-variable-in-angular-2
