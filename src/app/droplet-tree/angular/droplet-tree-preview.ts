import { Component, Input, ElementRef, Inject, SimpleChange } from '@angular/core';
import { OnChanges, OnDestroy } from '@angular/core';
import { DropletPreview } from '../_interfaces/droplet';
import { HiddenDataHelper } from '../hidden-data-helper';
import { DropletTreeRoot } from './droplet-tree-root';

@Component({
  selector: '[droplet-tree-preview]',
  template: `<ng-content></ng-content>`
})
export class DropletTreePreview implements DropletPreview, OnChanges, OnDestroy {
  @Input() context: any;
  @Input() root: DropletTreeRoot;

  private undo: any;

  constructor (@Inject(ElementRef) private reference: ElementRef) {}

  getNativeElement() {
    return this.reference.nativeElement;
  }

  ngOnDestroy () {
    if(this.undo) this.undo();
  }

  ngOnChanges(changes: {[ propName: string]: SimpleChange}) {
    if(this.undo) this.undo();
    this.undo = this.root.generator.hidden.setHidden(HiddenDataHelper.PREVIEW, this.context, this);
  }
}
