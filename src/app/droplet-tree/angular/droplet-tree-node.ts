import { Component, Input, ElementRef, Inject, SimpleChange } from '@angular/core';
import { OnChanges, OnDestroy } from '@angular/core';
import { DropletSource } from '../_interfaces/droplet';
import { HiddenDataHelper } from '../hidden-data-helper';
import { DropletTreeRoot } from './droplet-tree-root';

@Component({
  selector: '[droplet-tree-node]',
  template: `
    <droplet-tree-inner [source]="source" [root]="root" [preview]="hidden.getHidden(hidden.PREVIEW, context)">
      <ng-content></ng-content>
    </droplet-tree-inner>
  `
})
export class DropletTreeNode implements DropletSource, OnChanges, OnDestroy {

  @Input() context: any;
  @Input() root: DropletTreeRoot;

  private readonly id = 'S' + HiddenDataHelper.getUniqueId();
  private undo: any;

  // Used for bindings:
  private readonly hidden = HiddenDataHelper;
  private readonly source = this;

  constructor (@Inject(ElementRef) private reference: ElementRef) {}

  getNativeElement() {
    return this.reference.nativeElement;
  }

  getId() {
    return this.id;
  }

  ngOnDestroy () {
    if(this.undo) this.undo();
  }

  ngOnChanges(changes: {[ propName: string]: SimpleChange}) {
    if(this.undo) this.undo();
    this.undo = HiddenDataHelper.setHidden(HiddenDataHelper.SOURCE, this.context, this);
  }
}
