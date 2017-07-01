import { Component, ViewChildren, QueryList, Input, ContentChildren } from '@angular/core';
import { ElementRef, Inject, ViewEncapsulation } from '@angular/core';
import { OnChanges, OnDestroy, OnInit } from '@angular/core';
import { GridElement } from './elements/grid.element';
import { InputElement } from './elements/input.element';
import { BackendFacade } from './drag.backend';

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
  action () {
  }
}


@Component({
  selector: '[droplet-root]',
  template: `<ng-content></ng-content>`
})
export class DropletRoot implements OnInit {
  @Input() context: any;

  constructor (@Inject(ElementRef) private componentRef: ElementRef) {}

  ngOnInit () {
    this.context.__backend = new BackendFacade();
    this.context.__backend.registerRoot(this.componentRef.nativeElement);
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

  private lastParent: any[];
  private lastIndex: number;
  private lastPreview:any;
  private id: number;
  private removeListener: () => void;

  constructor (@Inject(ElementRef) private componentRef: ElementRef) {
    this.id = DropletInner.globalCounter++;
  }

  ngOnDestroy () {
    this.removeRegister();
  }

  removeRegister () {
    if (!this.lastParent) return;
    let lastItem = this.lastParent[this.lastIndex];
    if (this.isPreview) {
      lastItem.__preview = null;
    } else {
      delete lastItem.__handlers[this.id];
    }
  }

  addRegister () {
    var item = this.parent[this.index];
    if (this.isPreview) {
      if (item.__preview && item.__preview !== this) throw "Only one preview allowed per object."
      item.__preview = this;
    } else {
      if (!item.__handlers) item.__handlers = {};
      item.__handlers[this.id] = this;
    }
  }

  hasParentOrIndexChanged () {
    return this.parent !== this.lastParent || this.index !== this.lastIndex;
  }

  hasPreviewChanged () {
    return this.preview !== this.lastPreview;
  }

  ngOnChanges(changes: any) {
    setTimeout(() => {
      if (this.hasParentOrIndexChanged()) {
        this.removeRegister();
        this.lastParent = this.parent;
        this.lastIndex = this.index;
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
